import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { persistAcademicStructure } from './academic-structure.persistence';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { applySubjectProfile, subjectProfileFields } from './subject-profile';

interface UserContext {
  id: string;
  role: string;
}

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // Auxiliar reusable para validar permisos de carrera
  async checkTeacherCareerAccess(userId: string, careerId: string) {
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
        'No tienes acceso a materias en esta carrera.',
      );
    }
  }

  async create(dto: CreateSubjectDto, user: UserContext, logoUrl?: string) {
    if (user.role === 'TEACHER') {
      await this.checkTeacherCareerAccess(user.id, dto.careerId);
    } else if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('No tienes permisos para crear materias.');
    }

    return this.prisma.subject.create({
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        description: dto.description,
        color: dto.color,
        careerId: dto.careerId,
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
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      select: {
        careerId: true,
        name: true,
        abbreviation: true,
        description: true,
        color: true,
        logoUrl: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Materia no encontrada.');
    }

    if (user.role === 'TEACHER') {
      await this.checkTeacherCareerAccess(user.id, subject.careerId);
      const overrides = {
        name:
          dto.name === undefined
            ? undefined
            : dto.name === subject.name
              ? null
              : dto.name,
        abbreviation:
          dto.abbreviation === undefined
            ? undefined
            : dto.abbreviation === subject.abbreviation
              ? null
              : dto.abbreviation,
        description:
          dto.description === undefined
            ? undefined
            : dto.description === subject.description
              ? null
              : dto.description,
        color:
          dto.color === undefined
            ? undefined
            : dto.color === subject.color
              ? null
              : dto.color,
        ...(logoUrl !== undefined && {
          logoUrl: logoUrl === subject.logoUrl ? null : logoUrl,
        }),
      };
      await this.prisma.subjectProfile.upsert({
        where: { userId_subjectId: { userId: user.id, subjectId: id } },
        create: {
          userId: user.id,
          subjectId: id,
          ...overrides,
        },
        update: {
          ...overrides,
        },
      });
      return this.findOne(id, user);
    } else if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'No tienes permisos para modificar materias.',
      );
    }

    return this.prisma.subject.update({
      where: { id },
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        description: dto.description,
        color: dto.color,
        ...(logoUrl !== undefined && {
          logoUrl,
        }),
      },
    });
  }

  async updateAcademicStructure(
    id: string,
    structure: Prisma.InputJsonValue,
    user: UserContext,
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
      throw new NotFoundException('Materia no encontrada.');
    }

    if (user.role === 'TEACHER') {
      await this.checkTeacherCareerAccess(user.id, subject.careerId);
    } else if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'No tienes permisos para modificar la estructura académica.',
      );
    }

    let hypertext = await this.prisma.hypertext.findFirst({
      where: {
        subjectId: id,
        userId: user.id,
      },
    });

    if (!hypertext) {
      const display = applySubjectProfile(
        subject,
        await this.prisma.subjectProfile.findUnique({
          where: { userId_subjectId: { userId: user.id, subjectId: id } },
          select: subjectProfileFields,
        }),
      );
      hypertext = await this.prisma.hypertext.create({
        data: {
          title: `Hipertexto — ${display.name}`,
          description: display.description,
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
      throw new NotFoundException('Materia no encontrada.');
    }

    if (user.role === 'TEACHER') {
      await this.checkTeacherCareerAccess(user.id, subject.careerId);
    } else if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'No tienes permisos para confirmar la estructura académica.',
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
        'No tienes un hipertexto creado para esta materia.',
      );
    }

    if (!hypertext.academicStructure) {
      throw new BadRequestException(
        'El hipertexto no tiene una estructura académica para confirmar.',
      );
    }

    const result = await this.prisma
      .$transaction((tx) => persistAcademicStructure(tx, hypertext.id), {
        maxWait: 10_000,
        timeout: 30_000,
      })
      .catch((error: unknown) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          ['P2028', 'P1001', 'P1002', 'P1017'].includes(error.code)
        ) {
          throw new ServiceUnavailableException(
            'No pudimos completar la confirmación por un problema de conexión. Tu programa sigue guardado; vuelve a intentarlo.',
          );
        }
        throw error;
      });

    return {
      message: 'Estructura académica confirmada correctamente.',
      hypertext: result,
    };
  }

  async findAll(user: UserContext) {
    const subjects = await this.prisma.subject.findMany({
      where:
        user.role === 'SUPER_ADMIN'
          ? {}
          : { career: { users: { some: { userId: user.id } } } },
      include: {
        career: true,
        profiles: { where: { userId: user.id }, select: subjectProfileFields },
      },
      orderBy: { createdAt: 'desc' },
    });
    return subjects.map(({ profiles, ...subject }) =>
      applySubjectProfile(
        subject,
        user.role === 'TEACHER' ? profiles[0] : null,
      ),
    );
  }

  async findByCareer(careerId: string, user: UserContext) {
    if (user.role === 'TEACHER') {
      await this.checkTeacherCareerAccess(user.id, careerId);
    } else if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'No tienes acceso a materias de esta carrera.',
      );
    }

    const subjects = await this.prisma.subject.findMany({
      where: { careerId },
      include: {
        career: true,
        profiles: { where: { userId: user.id }, select: subjectProfileFields },
      },
      orderBy: { createdAt: 'desc' },
    });
    return subjects.map(({ profiles, ...subject }) =>
      applySubjectProfile(
        subject,
        user.role === 'TEACHER' ? profiles[0] : null,
      ),
    );
  }

  async findOne(id: string, user: UserContext) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        profiles: { where: { userId: user.id }, select: subjectProfileFields },
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
            user.role === 'TEACHER'
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
      throw new NotFoundException('Materia no encontrada.');
    }

    const { profiles, ...base } = subject;
    if (user.role === 'SUPER_ADMIN') {
      return base;
    }

    if (user.role === 'TEACHER') {
      await this.checkTeacherCareerAccess(user.id, subject.careerId);

      return applySubjectProfile(base, profiles[0]);
    }

    throw new ForbiddenException(
      'No tienes permisos para acceder a esta materia.',
    );
  }

  async remove(id: string, user: UserContext) {
    if (user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException(
        'Solo un SUPER_ADMIN puede eliminar materias.',
      );
    }

    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException('Materia no encontrada.');

    return this.prisma.subject.delete({ where: { id } });
  }
}
