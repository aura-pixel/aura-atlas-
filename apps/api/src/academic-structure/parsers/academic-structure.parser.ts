import { Injectable } from "@nestjs/common";

import {
  AcademicStructure,
  AcademicUnit,
} from "../types/academic-structure.types";

import { AcademicContentParser } from "./academic-content.parser";

@Injectable()
export class AcademicStructureParser {
    constructor(
  private readonly contentParser: AcademicContentParser,
) {}
  parse(
    text: string,
  ): AcademicStructure {
    const lines =
      this.normalizeLines(text);

    const subjectObjective =
      this.extractSubjectObjective(
        lines,
      );

    const units =
      this.extractUnits(lines);

    return {
      subjectObjective,
      units,
    };
  }

  private normalizeLines(
    text: string,
  ): string[] {
    return text
      .replace(/\r/g, "")
      .split("\n")
      .map((line) =>
        line
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);
  }

 private extractSubjectObjective(
  lines: string[],
): string | undefined {
  /*
   * Buscamos el encabezado de la sección
   * que contiene el objetivo general.
   *
   * UAEMéx suele utilizar algo como:
   *
   * V. Objetivos de la unidad de aprendizaje
   *
   * pero no queremos depender de que sea
   * exactamente "V." ni de plural/singular.
   */
  const objectiveSectionIndex =
    lines.findIndex((line) => {
      const normalized = line
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

      return (
        /^(?:[ivxlcdm]+\.\s*)?objetivos?\s+de\s+la\s+unidad\s+de\s+aprendizaje\b/.test(
          normalized,
        )
      );
    });

  if (
    objectiveSectionIndex === -1
  ) {
    return undefined;
  }

  /*
   * Buscamos el siguiente encabezado
   * importante del programa:
   *
   * VI. Contenidos de la unidad de aprendizaje...
   */
  const contentSectionIndex =
    lines.findIndex(
      (line, index) => {
        if (
          index <=
          objectiveSectionIndex
        ) {
          return false;
        }

        const normalized = line
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        return (
          /^(?:[ivxlcdm]+\.\s*)?contenidos?\s+de\s+la\s+unidad\s+de\s+aprendizaje\b/.test(
            normalized,
          )
        );
      },
    );

  if (
    contentSectionIndex === -1
  ) {
    return undefined;
  }

  /*
   * Todo lo que está entre ambos encabezados
   * corresponde al objetivo general.
   */
  const objectiveLines =
    lines.slice(
      objectiveSectionIndex + 1,
      contentSectionIndex,
    );

  const objective =
    objectiveLines
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

  return objective || undefined;
}
  

 private extractUnits(
  lines: string[],
): AcademicUnit[] {
  const units: AcademicUnit[] = [];

  for (
    let index = 0;
    index < lines.length;
    index++
  ) {
    const firstLine = lines[index];

    const match =
      this.matchUnit(firstLine);

    if (!match) {
      continue;
    }

    /*
     * -------------------------------------------------
     * 1. Encontrar el final del título de la unidad
     * -------------------------------------------------
     */

    const titleParts = [
      match.title,
    ];

    let titleEndIndex =
      index + 1;

    while (
      titleEndIndex < lines.length
    ) {
      const nextLine =
        lines[titleEndIndex];

      if (
        this.matchUnit(nextLine)
      ) {
        break;
      }

      if (
        this.isStructuralMarker(
          nextLine,
        )
      ) {
        break;
      }

      titleParts.push(nextLine);

      titleEndIndex++;
    }

    /*
     * -------------------------------------------------
     * 2. Obtener todas las líneas de esta unidad
     * -------------------------------------------------
     */

    const unitContent =
      this.extractUnitLines(
        lines,
        index,
      );

    /*
     * -------------------------------------------------
     * 3. Buscar el objetivo de la unidad
     * -------------------------------------------------
     */

    const objectiveResult =
      this.extractUnitObjective(
        lines,
        titleEndIndex,
      );

    /*
     * -------------------------------------------------
     * 4. Buscar temas y subtemas
     * -------------------------------------------------
     */

    const topics =
      this.contentParser.parse(
        unitContent.lines,
      );

    /*
     * -------------------------------------------------
     * 5. Crear la unidad completa
     * -------------------------------------------------
     */

    const unit: AcademicUnit = {
      number: Number(match.number),

      title: this.cleanTitle(
        titleParts.join(" "),
      ),

      topics,
    };

    if (
      objectiveResult.objective
    ) {
      unit.objective =
        objectiveResult.objective;
    }

    units.push(unit);

    /*
     * Saltamos directamente al inicio
     * de la siguiente unidad.
     */
    index =
      unitContent.nextIndex - 1;
  }

  return units;
}

  private extractUnitLines(
  lines: string[],
  startIndex: number,
): {
  lines: string[];
  nextIndex: number;
} {
  const unitLines: string[] = [];

  let index = startIndex;

  while (index < lines.length) {
    const line = lines[index];

    // La siguiente unidad termina la actual.
    if (
      index > startIndex &&
      this.matchUnit(line)
    ) {
      break;
    }

    unitLines.push(line);

    index++;
  }

  return {
    lines: unitLines,
    nextIndex: index,
  };
}

  private extractUnitObjective(
  lines: string[],
  startIndex: number,
): {
  objective?: string;
  nextIndex: number;
} {
  let objectiveIndex = -1;

  for (
    let index = startIndex;
    index < Math.min(
      startIndex + 10,
      lines.length,
    );
    index++
  ) {
    if (
      /^objetivos?\s*:/i.test(
        lines[index],
      )
    ) {
      objectiveIndex = index;
      break;
    }
  }

  if (objectiveIndex === -1) {
    return {
      nextIndex: startIndex,
    };
  }

  const objectiveParts: string[] = [];

  /**
   * El texto del objetivo puede comenzar
   * en la misma línea que "Objetivo:".
   *
   * Ejemplo:
   *
   * Objetivo: Analizar los principios...
   *
   * Por eso primero recuperamos lo que
   * aparece después de los dos puntos.
   */
  const firstObjectiveLine =
    lines[objectiveIndex]
      .replace(
        /^objetivos?\s*:\s*/i,
        "",
      )
      .trim();

  if (firstObjectiveLine) {
    objectiveParts.push(
      firstObjectiveLine,
    );
  }

  let nextIndex =
    objectiveIndex + 1;

  while (
    nextIndex < lines.length
  ) {
    const line =
      lines[nextIndex];

    /**
     * Si comienza una nueva unidad,
     * terminó el objetivo.
     */
    if (this.matchUnit(line)) {
      break;
    }

    /**
     * Si comienza un tema numerado,
     * terminó el objetivo.
     */
    if (this.matchTopic(line)) {
      break;
    }

    /**
     * "Temas:" marca el final
     * del objetivo.
     */
    if (
      this.isContentMarker(line)
    ) {
      break;
    }

    objectiveParts.push(line);

    nextIndex++;
  }

  return {
    objective:
      this.cleanObjective(
        objectiveParts.join(" "),
      ),
    nextIndex,
  };
}

  private matchUnit(
    line: string,
  ): {
    number: string;
    title: string;
  } | null {
    const match =
      line.match(
        /^unidad(?:\s+temática)?\s*(\d+)\s*[.:\-–—]?\s*(.+)$/i,
      );

    if (!match) {
      return null;
    }

    return {
      number: match[1],
      title: match[2].trim(),
    };
  }

  private matchTopic(
    line: string,
  ): boolean {
    return /^\d+\.\d+(?:\.\d+)*\s+.+/.test(
      line,
    );
  }

  private isStructuralMarker(
    line: string,
  ): boolean {
    return /^(objetivo|objetivos|temas|contenidos|unidad temática|unidad)\b/i.test(
      line.trim(),
    );
  }

  private isContentMarker(
    line: string,
  ): boolean {
    return /^(temas|contenidos|contenido|bibliografía|referencias)\s*:?\s*$/i.test(
      line.trim(),
    );
  }

  private cleanTitle(
    title: string,
  ): string {
    return title
      .replace(/\s+/g, " ")
      .trim()
      .replace(/[.]+$/, "");
  }

  private cleanObjective(
    objective: string,
  ): string | undefined {
    const cleaned =
      objective
        .replace(/\s+/g, " ")
        .trim();

    return cleaned || undefined;
  }
}