import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { R2Service } from "../storage/r2.service";

import { randomUUID } from "crypto";

import { PrismaService } from "../prisma/prisma.service";
import { ContentMatcher } from "../academic-structure/classifiers/content-matcher";
import { PdfHypertextExtractor } from "./extractor/pdf-hypertext.extractor";


@Injectable()
export class MaterialService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly contentMatcher: ContentMatcher,
  private readonly pdfHypertextExtractor: PdfHypertextExtractor,
  private readonly r2Service: R2Service,
) {}

  async prepareFiles(
  subjectId: string,
  userId: string,
  files: Express.Multer.File[],
) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        "No se recibieron archivos.",
      );
    }

    // Buscar el hipertexto asociado a la materia
    const hypertext =
      await this.prisma.hypertext.findFirst({
        where: {
          subjectId,
          userId,
        },
        include: {
          units: {
            include: {
              topics: true,
            },
          },
        },
      });

    if (!hypertext) {
      throw new NotFoundException(
        "Hipertexto no encontrado.",
      );
    }

    const topics =
      hypertext.units.flatMap(
        (unit) => unit.topics,
      );

    if (topics.length === 0) {
      throw new BadRequestException(
        "El hipertexto todavía no tiene temas para clasificar el material.",
      );
    }

    const topicInputs = topics.map(
      (topic) => ({
        number: topic.number,
        title: topic.title,
      }),
    );

    const processedFiles: {
  name: string;
  mimeType: string;
  size: number;
  url: string;

  textLength: number;

  suggestedTopic: ReturnType<
    ContentMatcher["match"]
  >["suggestedTopic"];

  confidence: ReturnType<
    ContentMatcher["match"]
  >["confidence"];

  margin: number;

  candidates: ReturnType<
    ContentMatcher["match"]
  >["candidates"];

  extractionError: string | null;
}[] = [];


for (const file of files) {

const filename =
  `${randomUUID()}-${file.originalname}`;

await this.r2Service.uploadFile(
  filename,
  file.buffer,
  file.mimetype,
);

const url = filename;

  let extractedText = "";
  let extractionError: string | null = null;

  try {
    if (
      file.mimetype ===
      "application/pdf"
    ) {
      const result =
        await this.pdfHypertextExtractor.extract(
          file.buffer,
        );

      extractedText = result.text;
    }
  } catch (error) {
    extractionError =
      error instanceof Error
        ? error.message
        : "No se pudo procesar el archivo.";
  }

  const match =
    extractionError
      ? {
          suggestedTopic: null,
          confidence: "LOW" as const,
          margin: 0,
          candidates: [],
        }
      : this.contentMatcher.match(
          file.originalname,
          extractedText,
          topicInputs,
        );

  processedFiles.push({
  name: file.originalname,
  mimeType: file.mimetype,
  size: file.size,
  url,

  textLength: extractedText.length,

  suggestedTopic: match.suggestedTopic,
  confidence: match.confidence,
  margin: match.margin,
  candidates: match.candidates,
  extractionError,
});
}

    return {
      hypertextId: hypertext.id,
      subjectId,

      totalFiles: files.length,
      totalTopics: topics.length,

      files: processedFiles,
    };
  }

  async getHypertextProgress(
  subjectId: string,
  userId: string,
) {
  const hypertext =
    await this.prisma.hypertext.findFirst({
      where: {
        subjectId,
        userId,
      },
      include: {
        units: {
          include: {
            topics: {
              include: {
                materials: true,
              },
            },
          },
        },
      },
    });

  if (!hypertext) {
    return {
      hypertextId: null,
      totalTopics: 0,
      topicsWithContent: 0,
      minimumTopics: 0,
      percentage: 0,
      canGenerate: false,
    };
  }

  const topics =
    hypertext.units.flatMap(
      (unit) => unit.topics,
    );

  const totalTopics =
    topics.length;

  const topicsWithContent =
    topics.filter(
      (topic) =>
        topic.materials.length > 0,
    ).length;

  const minimumTopics =
    Math.ceil(
      totalTopics * 0.30,
    );

  const percentage =
    totalTopics > 0
      ? Math.round(
          (topicsWithContent /
            totalTopics) *
            100,
        )
      : 0;

  const canGenerate =
    topicsWithContent >=
    minimumTopics;

  return {
    hypertextId:
      hypertext.id,

    totalTopics,

    topicsWithContent,

    minimumTopics,

    percentage,

    canGenerate,
  };
}

    async saveMaterials(
    subjectId: string,
    userId: string,
    files: {
  name: string;
  mimeType: string;
  size: number;
  topicNumber: string;
  type: string;
  url: string;
}[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        "No hay materiales para guardar.",
      );
    }

    const hypertext =
      await this.prisma.hypertext.findFirst({
        where: {
          subjectId,
          userId,
        },
        include: {
          units: {
            include: {
              topics: true,
            },
          },
        },
      });

    if (!hypertext) {
      throw new NotFoundException(
        "Hipertexto no encontrado.",
      );
    }

    const topics =
      hypertext.units.flatMap(
        (unit) => unit.topics,
      );

    const topicMap = new Map(
      topics.map((topic) => [
        topic.number,
        topic,
      ]),
    );

    const materialsToCreate = files.map(
      (file) => {
        const topic =
          topicMap.get(file.topicNumber);

        if (!topic) {
          throw new BadRequestException(
            `No se encontró el tema ${file.topicNumber}.`,
          );
        }

        return {
  name: file.name,
  type: file.type as any,
  mimeType: file.mimeType,
  size: file.size,
  url: file.url,
  topicId: topic.id,
};
      },
    );

    const materials =
  await this.prisma.$transaction(
    async (tx) => {
      const created =
        await Promise.all(
          materialsToCreate.map(
            (material) =>
              tx.material.create({
                data: material,
              }),
          ),
        );

      return created;
    },
  );

    return {
      message:
        "Materiales guardados correctamente.",
      total: materials.length,
      materials,
    };
  }

  async getMaterialById(materialId: string) {
  return this.prisma.material.findUnique({
    where: {
      id: materialId,
    },
  });
}


}