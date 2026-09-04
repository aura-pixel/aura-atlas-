import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { ContentMatcher } from "../academic-structure/classifiers/content-matcher";

@Injectable()
export class MaterialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly contentMatcher: ContentMatcher,
  ) {}

  async prepareFiles(
    subjectId: string,
    files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        "No se recibieron archivos.",
      );
    }

    const hypertext = await this.prisma.hypertext.findFirst({
  where: {
    subjectId,
  },
  orderBy: {
    createdAt: "desc",
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

    const topics = hypertext.units.flatMap(
      (unit) => unit.topics,
    );

    if (topics.length === 0) {
      throw new BadRequestException(
        "El hipertexto todavía no tiene temas para clasificar el material.",
      );
    }

    return {
      subjectId,
      totalFiles: files.length,
      totalTopics: topics.length,
      topics: topics.map((topic) => ({
        number: topic.number,
        title: topic.title,
      })),
    };
  }
  
}