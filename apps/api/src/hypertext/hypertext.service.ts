import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { slugify } from "./slug.util";

@Injectable()
export class HypertextService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findOne(
    id: string,
    userId: string,
  ) {
    const hypertext =
      await this.prisma.hypertext.findFirst({
        where: {
          id,
          userId,
        },

        include: {
          user: true,

          subject: {
            include: {
              career: {
                include: {
                  faculty: {
                    include: {
                      university: true,
                    },
                  },
                },
              },
            },
          },

          units: {
            orderBy: {
              number: "asc",
            },

            include: {
              topics: {
                orderBy: {
                  number: "asc",
                },

                include: {
                  subtopics: {
                    orderBy: {
                      number: "asc",
                    },
                  },

                  materials: true,
                },
              },
            },
          },
        },
      });

    if (!hypertext) {
  throw new NotFoundException(
    "Hipertexto no encontrado",
  );
}

const publicUrl =
  hypertext.isPublished && hypertext.slug
    ? `/${slugify(
        hypertext.subject.career.faculty.university.abbreviation,
      )}/${slugify(
        hypertext.subject.career.abbreviation ??
          hypertext.subject.career.name,
      )}/${hypertext.slug}`
    : null;

return {
  ...hypertext,
  publicUrl,
};
  }

  async findPublicBySlug(
    slug: string,
  ) {
    const hypertext =
      await this.prisma.hypertext.findFirst({
        where: {
          slug,
          isPublished: true,
        },

        include: {
          user: true,

          subject: {
            include: {
              career: {
                include: {
                  faculty: {
                    include: {
                      university: true,
                    },
                  },
                },
              },
            },
          },

          authors: {
            include: {
              user: true,
            },
          },

          units: {
            where: {
              topics: {
                some: {
                  materials: {
                    some: {},
                  },
                },
              },
            },

            orderBy: {
              number: "asc",
            },

            include: {
              topics: {
                where: {
                  materials: {
                    some: {},
                  },
                },

                orderBy: {
                  number: "asc",
                },

                include: {
                  materials: true,
                },
              },
            },
          },
        },
      });

    if (!hypertext) {
      throw new NotFoundException(
        "Hipertexto no encontrado o no publicado",
      );
    }

    return hypertext;
  }

  async updateConfiguration(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
      theme?: "LIGHT" | "DARK";
    },
    userId: string,
  ) {
    const hypertext =
      await this.prisma.hypertext.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!hypertext) {
      throw new NotFoundException(
        "Hipertexto no encontrado",
      );
    }

    const updated =
      await this.prisma.hypertext.update({
        where: {
          id,
        },

        data: {
          title: data.title,
          description: data.description,
          primaryColor: data.primaryColor,
          secondaryColor: data.secondaryColor,
          fontFamily: data.fontFamily,
          theme: data.theme,
        },

        include: {
          user: true,

          subject: {
            include: {
              career: {
                include: {
                  faculty: {
                    include: {
                      university: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    return updated;
  }

  async updateUnitImage(
    hypertextId: string,
    unitId: string,
    imageUrl: string | null,
    userId: string,
  ) {
    const unit =
      await this.prisma.unit.findFirst({
        where: {
          id: unitId,
          hypertextId,
          hypertext: {
            userId,
          },
        },
      });

    if (!unit) {
      throw new NotFoundException(
        "Unidad no encontrada",
      );
    }

    return this.prisma.unit.update({
      where: {
        id: unitId,
      },

      data: {
        imageUrl,
      },
    });
  }

  async getConfiguration(
    id: string,
    userId: string,
  ) {
    const hypertext =
      await this.prisma.hypertext.findFirst({
        where: {
          id,
          userId,
        },

        select: {
          id: true,
          title: true,
          description: true,
          coverImageUrl: true,
          primaryColor: true,
          secondaryColor: true,
          fontFamily: true,
          theme: true,
          isPublished: true,
          slug: true,
        },
      });

    if (!hypertext) {
      throw new NotFoundException(
        "Hipertexto no encontrado",
      );
    }

    return hypertext;
  }

  async publish(
    id: string,
    userId: string,
  ) {
    const hypertext =
      await this.prisma.hypertext.findFirst({
        where: {
          id,
          userId,
        },

        include: {
          subject: {
            include: {
              career: {
                include: {
                  faculty: {
                    include: {
                      university: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!hypertext) {
      throw new NotFoundException(
        "Hipertexto no encontrado",
      );
    }

    const university =
      hypertext.subject.career.faculty.university;

    const career =
      hypertext.subject.career;

    const subject =
      hypertext.subject;

    if (
      !university.abbreviation ||
      !career.abbreviation
    ) {
      throw new NotFoundException(
        "La universidad y la carrera deben tener abreviaturas para publicar el hipertexto",
      );
    }

    const universitySlug =
      slugify(university.abbreviation);

    const careerSlug =
      slugify(career.abbreviation);

    const subjectSlug =
      slugify(subject.name);

    const uniqueSlug =
      `${subjectSlug}-${hypertext.id.slice(-8)}`;

    const existing =
      await this.prisma.hypertext.findFirst({
        where: {
          slug: uniqueSlug,
          NOT: {
            id,
          },
        },
      });

    if (existing) {
      throw new ConflictException(
        "Ya existe un hipertexto con esta URL",
      );
    }

    const updated =
      await this.prisma.hypertext.update({
        where: {
          id,
        },

        data: {
          slug: uniqueSlug,
          isPublished: true,
        },
      });

    const publicUrl =
      `/${universitySlug}/${careerSlug}/${uniqueSlug}`;

    return {
      ...updated,
      publicUrl,
    };
  }
}