import { BadRequestException } from '@nestjs/common';
import { publicAuthor } from '../security/access';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { academicSlug, slugify } from './slug.util';
import type { Subject } from '@prisma/client';
import {
  applySubjectProfile,
  subjectProfileFields,
} from '../subjects/subject-profile';

@Injectable()
export class HypertextService {
  constructor(private readonly prisma: PrismaService) {}

  private async withPersonalSubject<
    T extends { userId: string; subjectId: string; subject: Subject },
  >(hypertext: T) {
    const profile = await this.prisma.subjectProfile.findUnique({
      where: {
        userId_subjectId: {
          userId: hypertext.userId,
          subjectId: hypertext.subjectId,
        },
      },
      select: subjectProfileFields,
    });
    return {
      ...hypertext,
      subject: applySubjectProfile(hypertext.subject, profile),
    };
  }

  async findOne(id: string, userId: string) {
    const hypertext = await this.prisma.hypertext.findFirst({
      where: {
        id,
        userId,
      },

      include: {
        user: { select: publicAuthor },

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
            number: 'asc',
          },

          include: {
            topics: {
              orderBy: {
                number: 'asc',
              },

              include: {
                subtopics: {
                  orderBy: {
                    number: 'asc',
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
      throw new NotFoundException('Hipertexto no encontrado');
    }

    const publicUrl =
      hypertext.isPublished &&
      hypertext.slug &&
      hypertext.subject.career.faculty.university.approvalStatus ===
        'APPROVED' &&
      hypertext.subject.career.faculty.approvalStatus === 'APPROVED'
        ? `/${academicSlug(
            hypertext.subject.career.faculty.university.name,
            hypertext.subject.career.faculty.university.abbreviation,
          )}/${academicSlug(
            hypertext.subject.career.name,
            hypertext.subject.career.abbreviation,
          )}/${hypertext.slug}`
        : null;

    return {
      ...(await this.withPersonalSubject(hypertext)),
      publicUrl,
    };
  }

  async findPublicBySlug(slug: string) {
    const hypertext = await this.prisma.hypertext.findFirst({
      where: {
        slug,
        isPublished: true,
        subject: {
          career: {
            faculty: {
              approvalStatus: 'APPROVED',
              university: { approvalStatus: 'APPROVED' },
            },
          },
        },
      },

      include: {
        user: { select: publicAuthor },

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
            user: { select: publicAuthor },
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
            number: 'asc',
          },

          include: {
            topics: {
              where: {
                materials: {
                  some: {},
                },
              },

              orderBy: {
                number: 'asc',
              },

              include: {
                materials: true,
                subtopics: { orderBy: { number: 'asc' } },
              },
            },
          },
        },
      },
    });

    if (!hypertext) {
      throw new NotFoundException('Hipertexto no encontrado o no publicado');
    }

    return this.withPersonalSubject(hypertext);
  }

  async updateConfiguration(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      primaryColor?: string;
      secondaryColor?: string;
      fontFamily?: string;
      theme?: 'LIGHT' | 'DARK';
      coverImageUrl?: string | null;
    },
    userId: string,
  ) {
    const hypertext = await this.prisma.hypertext.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!hypertext) {
      throw new NotFoundException('Hipertexto no encontrado');
    }

    const updated = await this.prisma.hypertext.update({
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
        coverImageUrl: data.coverImageUrl,
      },

      include: {
        user: { select: publicAuthor },

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

    return this.withPersonalSubject(updated);
  }

  async updateUnitImage(
    hypertextId: string,
    unitId: string,
    imageUrl: string | null,
    userId: string,
  ) {
    const unit = await this.prisma.unit.findFirst({
      where: {
        id: unitId,
        hypertextId,
        hypertext: {
          userId,
        },
      },
    });

    if (!unit) {
      throw new NotFoundException('Unidad no encontrada');
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

  async getConfiguration(id: string, userId: string) {
    const hypertext = await this.prisma.hypertext.findFirst({
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
      throw new NotFoundException('Hipertexto no encontrado');
    }

    return hypertext;
  }

  async publish(id: string, userId: string) {
    const hypertext = await this.prisma.hypertext.findFirst({
      where: {
        id,
        userId,
      },

      include: {
        units: { include: { topics: { include: { materials: true } } } },
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
      throw new NotFoundException('Hipertexto no encontrado');
    }

    const topics = hypertext.units.flatMap((unit) => unit.topics);
    if (
      !hypertext.academicStructureConfirmed ||
      topics.length === 0 ||
      topics.filter((topic) => topic.materials.length > 0).length <
        Math.ceil(topics.length * 0.3)
    ) {
      throw new BadRequestException(
        'Confirma la estructura y agrega contenido a por lo menos el 30% de los temas.',
      );
    }
    const university = hypertext.subject.career.faculty.university;
    if (hypertext.subject.career.faculty.approvalStatus !== 'APPROVED')
      throw new BadRequestException(
        'La facultad necesita aprobacion administrativa antes de publicar. Puedes seguir trabajando en privado.',
      );
    if (university.approvalStatus !== 'APPROVED')
      throw new BadRequestException(
        'Tu universidad necesita aprobación administrativa antes de publicar. Puedes seguir trabajando en privado.',
      );

    const career = hypertext.subject.career;

    const subject = (await this.withPersonalSubject(hypertext)).subject;

    const universitySlug = academicSlug(
      university.name,
      university.abbreviation,
    );

    const careerSlug = academicSlug(career.name, career.abbreviation);

    const subjectSlug = slugify(subject.name);

    const uniqueSlug = `${subjectSlug}-${hypertext.id.slice(-8)}`;

    const existing = await this.prisma.hypertext.findFirst({
      where: {
        slug: uniqueSlug,
        NOT: {
          id,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe un hipertexto con esta URL');
    }

    const updated = await this.prisma.hypertext.update({
      where: {
        id,
      },

      data: {
        slug: uniqueSlug,
        isPublished: true,
      },
    });

    const publicUrl = `/${universitySlug}/${careerSlug}/${uniqueSlug}`;

    return {
      ...updated,
      publicUrl,
    };
  }
}
