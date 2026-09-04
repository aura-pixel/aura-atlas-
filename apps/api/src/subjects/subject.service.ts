import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

interface UserContext {
  id: string;
  role: string;
}

interface AcademicStructure {
  subjectObjective?: string;
  units: {
    number: number;
    title: string;
    objective?: string;
    topics: {
      number: string;
      title: string;
      subtopics?: {
        number: string;
        title: string;
      }[];
    }[];
  }[];
}

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // Auxiliar reusable para validar permisos de carrera
  private async checkTeacherCareerAccess(userId: string, careerId: string) {
    const userCareer = await this.prisma.userCareer.findUnique({
      where: {
        userId_careerId: {
          userId,
          careerId,
        },
      },
    });

    if (!userCareer) {
      throw new ForbiddenException(
        "No tienes acceso a materias en esta carrera."
      );
    }
  }

  async create(dto: CreateSubjectDto, user: UserContext, logoUrl?: string) {
    if (user.role === "TEACHER") {
      await this.checkTeacherCareerAccess(user.id, dto.careerId);
    } else if (user.role !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "No tienes permisos para crear materias."
      );
    }

    return this.prisma.subject.create({
      data: {
        ...dto,
        logoUrl,
      },
    });
  }

  async update(
  id: string,
  dto: UpdateSubjectDto,
  user: UserContext,
  logoUrl?: string,
) {
  const subject =
    await this.prisma.subject.findUnique({
      where: { id },
      select: {
        careerId: true,
      },
    });

  if (!subject) {
    throw new NotFoundException(
      "Materia no encontrada.",
    );
  }

  if (user.role === "TEACHER") {
    await this.checkTeacherCareerAccess(
      user.id,
      subject.careerId,
    );
  } else if (user.role !== "SUPER_ADMIN") {
    throw new ForbiddenException(
      "No tienes permisos para modificar materias.",
    );
  }

  return this.prisma.subject.update({
    where: { id },
    data: {
      ...dto,
      ...(logoUrl !== undefined && {
        logoUrl,
      }),
    },
  });
}

  async updateAcademicStructure(
    id: string,
    structure: Prisma.InputJsonValue,
    user: UserContext
  ) {
    const subject = await this.prisma.subject.findUnique({
  where: { id },
  select: {
    careerId: true,
    name: true,
    description: true,
  },
});

    if (!subject) {
      throw new NotFoundException("Materia no encontrada.");
    }

    if (user.role === "TEACHER") {
      await this.checkTeacherCareerAccess(user.id, subject.careerId);
    } else if (user.role !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "No tienes permisos para modificar la estructura académica."
      );
    }

    let hypertext = await this.prisma.hypertext.findFirst({
  where: {
    subjectId: id,
    userId: user.id,
  },
});

if (!hypertext) {
  hypertext = await this.prisma.hypertext.create({
    data: {
      title: `Hipertexto — ${subject.name}`,
      description: subject.description,
      userId: user.id,
      subjectId: id,
    },
  });
}

    return this.prisma.hypertext.update({
      where: {
        id: hypertext.id,
      },
      data: {
        academicStructure: structure,
        academicStructureConfirmed: false,
      },
    });
  }

  async confirmAcademicStructure(id: string, user: UserContext) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: {
        name: true,
        careerId: true,
      },
    });

    if (!subject) {
      throw new NotFoundException("Materia no encontrada.");
    }

    if (user.role === "TEACHER") {
      await this.checkTeacherCareerAccess(user.id, subject.careerId);
    } else if (user.role !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "No tienes permisos para confirmar la estructura académica."
      );
    }

    const hypertext = await this.prisma.hypertext.findFirst({
      where: {
        subjectId: id,
        userId: user.id,
      },
    });

    if (!hypertext) {
      throw new NotFoundException(
        "No tienes un hipertexto creado para esta materia."
      );
    }

    if (!hypertext.academicStructure) {
      throw new BadRequestException(
        "El hipertexto no tiene una estructura académica para confirmar."
      );
    }

    if (hypertext.academicStructureConfirmed) {
      throw new BadRequestException(
        "La estructura académica ya fue confirmada."
      );
    }

    const structure =
      hypertext.academicStructure as unknown as AcademicStructure;

    if (
      !structure.units ||
      !Array.isArray(structure.units) ||
      structure.units.length === 0
    ) {
      throw new BadRequestException(
        "El formato de la estructura académica es inválido o no contiene unidades."
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
  for (const unitData of structure.units) {
    const unit = await tx.unit.upsert({
      where: {
        hypertextId_number: {
          hypertextId: hypertext.id,
          number: unitData.number,
        },
      },
      update: {
        title: unitData.title,
        objective: unitData.objective,
      },
      create: {
        number: unitData.number,
        title: unitData.title,
        objective: unitData.objective,
        hypertextId: hypertext.id,
      },
    });

    if (Array.isArray(unitData.topics)) {
      for (const topicData of unitData.topics) {
        const topic = await tx.topic.upsert({
          where: {
            unitId_number: {
              unitId: unit.id,
              number: topicData.number,
            },
          },
          update: {
            title: topicData.title,
          },
          create: {
            number: topicData.number,
            title: topicData.title,
            unitId: unit.id,
          },
        });

        if (topicData.subtopics?.length) {
          for (const subtopicData of topicData.subtopics) {
            await tx.subtopic.upsert({
              where: {
                topicId_number: {
                  topicId: topic.id,
                  number: subtopicData.number,
                },
              },
              update: {
                title: subtopicData.title,
              },
              create: {
                number: subtopicData.number,
                title: subtopicData.title,
                topicId: topic.id,
              },
            });
          }
        }
      }
    }
  }

  const updatedHypertext = await tx.hypertext.update({
    where: {
      id: hypertext.id,
    },
    data: {
      academicStructureConfirmed: true,
    },
  });

  return updatedHypertext;
});

    return {
      message: "Estructura académica confirmada correctamente.",
      hypertext: result,
    };
  }

  async findAll() {
    return this.prisma.subject.findMany({
      include: { career: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByCareer(careerId: string, user: UserContext) {
    if (user.role === "TEACHER") {
      await this.checkTeacherCareerAccess(user.id, careerId);
    } else if (user.role !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "No tienes acceso a materias de esta carrera."
      );
    }

    return this.prisma.subject.findMany({
      where: { careerId },
      include: { career: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, user: UserContext) {
  const subject = await this.prisma.subject.findUnique({
    where: { id },
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

      hypertexts: {
        where:
          user.role === "TEACHER"
            ? {
                userId: user.id,
              }
            : undefined,

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
      },
    },
  });

  if (!subject) {
    throw new NotFoundException(
      "Materia no encontrada."
    );
  }

  if (user.role === "SUPER_ADMIN") {
    return subject;
  }

  if (user.role === "TEACHER") {
    await this.checkTeacherCareerAccess(
      user.id,
      subject.careerId
    );

    return subject;
  }

  throw new ForbiddenException(
    "No tienes permisos para acceder a esta materia."
  );
}

  async remove(id: string, user: UserContext) {
    if (user.role !== "SUPER_ADMIN") {
      throw new ForbiddenException(
        "Solo un SUPER_ADMIN puede eliminar materias."
      );
    }

    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException("Materia no encontrada.");

    return this.prisma.subject.delete({ where: { id } });
  }
}