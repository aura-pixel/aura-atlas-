import {
  PrismaClient,
} from "@prisma/client";

import fs from "fs";
import path from "path";

import PDFDocument from "pdfkit";

const prisma =
  new PrismaClient();

const OUTPUT_DIR = path.join(
  process.cwd(),
  "scripts",
  "material-prueba",
);

// Cantidad de temas que queremos generar.
// 25 = aproximadamente 50% de una materia de 50 temas.
const LIMIT = 25;

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

function createPdf(
  filePath: string,
  unitNumber: number,
  unitTitle: string,
  topicNumber: string,
  topicTitle: string,
) {
  return new Promise<void>(
    (resolve, reject) => {
      const doc =
        new PDFDocument({
          size: "A4",
          margin: 60,
        });

      const stream =
        fs.createWriteStream(
          filePath,
        );

      stream.on(
        "finish",
        () => resolve(),
      );

      stream.on(
        "error",
        reject,
      );

      doc.pipe(stream);

      doc
        .fontSize(22)
        .text(
          topicTitle,
          {
            align: "center",
          },
        );

      doc.moveDown();

      doc
        .fontSize(14)
        .text(
          `Unidad ${unitNumber}: ${unitTitle}`,
          {
            align: "center",
          },
        );

      doc.moveDown(2);

      doc
        .fontSize(12)
        .text(
          `Tema ${topicNumber}`,
        );

      doc.moveDown();

      doc
        .fontSize(11)
        .text(
          `
Material educativo de prueba para Aura Atlas.

Este documento corresponde al tema:

${topicNumber} ${topicTitle}

El contenido de este documento se utiliza
únicamente para probar el reconocimiento
de patrones y la clasificación automática
de materiales de Aura Atlas.

Tema principal:
${topicTitle}

Unidad:
${unitTitle}

Número de tema:
${topicNumber}

Aura Atlas puede utilizar el nombre del
archivo y el contenido textual del documento
para sugerir a qué tema pertenece este material.
          `.trim(),
        );

      doc.end();
    },
  );
}

async function main() {
  console.log(
    "Generando material de prueba...",
  );

  const subject =
    await prisma.subject.findFirst({
      where: {
        name: {
          contains: "SALUD MENTAL",
          mode: "insensitive",
        },
      },
      include: {
        career: true,
      },
    });

  if (!subject) {
    throw new Error(
      "No se encontró la materia SALUD MENTAL.",
    );
  }

  const hypertext =
    await prisma.hypertext.findFirst({
      where: {
        subjectId:
          subject.id,
      },
      include: {
        units: {
          include: {
            topics: {
              orderBy: {
                number: "asc",
              },
            },
          },
          orderBy: {
            number: "asc",
          },
        },
      },
    });

  if (!hypertext) {
    throw new Error(
      "No se encontró el hipertexto de la materia.",
    );
  }

  const topics =
    hypertext.units.flatMap(
      (unit) =>
        unit.topics.map(
          (topic) => ({
            unitNumber:
              unit.number,
            unitTitle:
              unit.title,
            topicNumber:
              topic.number,
            topicTitle:
              topic.title,
          }),
        ),
    );

  const selectedTopics =
    topics.slice(0, LIMIT);

  fs.mkdirSync(
    OUTPUT_DIR,
    {
      recursive: true,
    },
  );

  console.log(
    `Temas encontrados: ${topics.length}`,
  );

  console.log(
    `Generando ${selectedTopics.length} PDFs...`,
  );

  for (
    const topic of selectedTopics
  ) {
    const fileName =
      `${topic.topicNumber}-${slugify(
        topic.topicTitle,
      )}.pdf`;

    const filePath =
      path.join(
        OUTPUT_DIR,
        fileName,
      );

    await createPdf(
      filePath,
      topic.unitNumber,
      topic.unitTitle,
      topic.topicNumber,
      topic.topicTitle,
    );

    console.log(
      `✓ ${fileName}`,
    );
  }

  console.log("");
  console.log(
    "Material de prueba generado correctamente.",
  );

  console.log(
    `Archivos: ${selectedTopics.length}`,
  );

  console.log(
    `Carpeta: ${OUTPUT_DIR}`,
  );
}

main()
  .catch((error) => {
    console.error(
      "Error:",
      error,
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });