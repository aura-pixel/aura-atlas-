import type { Prisma } from '@prisma/client';
import {
  normalizedName,
  visibleUniversities,
} from '../security/university-visibility';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Actor } from '../security/access';
import { privateUser } from '../security/access';
import { CreateUniversityRequestDto } from './dto/create-university-request.dto';
import { ReviewRequestDto } from '../security/dto';
import {
  CreateFacultyRequestDto,
  FacultyRequestFieldsDto,
} from './dto/create-faculty-request.dto';
@Injectable()
export class UniversityRequestsService {
  constructor(private readonly prisma: PrismaService) {}
  private async checkName(
    tx: Prisma.TransactionClient,
    name: string,
    ownUniversityId?: string,
  ) {
    const approved = await tx.university.findMany({
      where: {
        approvalStatus: 'APPROVED',
        ...(ownUniversityId ? { id: { not: ownUniversityId } } : {}),
      },
      select: { name: true },
    });
    if (
      approved.some(
        (university: { name: string }) =>
          normalizedName(university.name) === normalizedName(name),
      )
    )
      throw new ConflictException(
        'Esta universidad ya está en el catálogo. Busca su nombre antes de crear otra.',
      );
  }
  async create(userId: string, dto: CreateUniversityRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(632112901)::text`;
      await this.checkName(tx, dto.universityName);
      const previous = await tx.universityRequest.findMany({
        where: { userId, kind: 'UNIVERSITY', status: { not: 'APPROVED' } },
        select: { universityName: true },
      });
      if (
        previous.some(
          (row) =>
            normalizedName(row.universityName) ===
            normalizedName(dto.universityName),
        )
      )
        throw new ConflictException(
          'Ya tienes una solicitud para esta universidad. Puedes revisarla o corregirla en Mis solicitudes.',
        );
      if (previous.length >= 3)
        throw new BadRequestException(
          'Revisa tus solicitudes existentes antes de crear otra universidad.',
        );
      const abbreviation =
        dto.abbreviation ||
        dto.universityName
          .split(' ')
          .filter((word) => word.length > 2)
          .map((word) => word[0])
          .join('')
          .slice(0, 20) ||
        'UNI';
      const university = await tx.university.create({
        data: {
          name: dto.universityName,
          abbreviation,
          approvalStatus: 'PENDING',
          createdById: userId,
        },
      });
      const faculty = await tx.faculty.create({
        data: { name: dto.facultyName, universityId: university.id },
      });
      const career = await tx.career.create({
        data: { name: dto.careerName, facultyId: faculty.id },
      });
      await tx.userCareer.create({ data: { userId, careerId: career.id } });
      return tx.universityRequest.create({
        data: {
          userId,
          universityName: dto.universityName,
          abbreviation,
          facultyName: dto.facultyName,
          careerName: dto.careerName,
          universityId: university.id,
          facultyId: faculty.id,
          careerId: career.id,
        },
      });
    });
  }
  async resubmit(id: string, userId: string, dto: CreateUniversityRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(632112901)::text`;
      const row = await tx.universityRequest.findFirst({
        where: { id, userId, kind: 'UNIVERSITY' },
      });
      if (!row || !row.universityId || !row.facultyId || !row.careerId)
        throw new NotFoundException();
      if (row.status === 'APPROVED')
        throw new ConflictException(
          'La universidad ya fue aprobada. Sus cambios generales corresponden al administrador.',
        );
      await this.checkName(tx, dto.universityName, row.universityId);
      const abbreviation = dto.abbreviation || row.abbreviation || 'UNI';
      await tx.university.update({
        where: { id: row.universityId },
        data: {
          name: dto.universityName,
          abbreviation,
          approvalStatus: 'PENDING',
        },
      });
      await tx.faculty.update({
        where: { id: row.facultyId },
        data: { name: dto.facultyName },
      });
      await tx.career.update({
        where: { id: row.careerId },
        data: { name: dto.careerName },
      });
      return tx.universityRequest.update({
        where: { id },
        data: {
          universityName: dto.universityName,
          abbreviation,
          facultyName: dto.facultyName,
          careerName: dto.careerName,
          status: 'PENDING',
          reviewNotes: null,
        },
      });
    });
  }
  private async checkFacultyName(
    tx: Prisma.TransactionClient,
    universityId: string,
    name: string,
    ownFacultyId?: string,
  ) {
    const approved = await tx.faculty.findMany({
      where: {
        universityId,
        approvalStatus: 'APPROVED',
        ...(ownFacultyId ? { id: { not: ownFacultyId } } : {}),
      },
      select: { name: true },
    });
    if (
      approved.some(
        (faculty) => normalizedName(faculty.name) === normalizedName(name),
      )
    ) {
      throw new ConflictException(
        'Esta facultad ya está en la universidad seleccionada. Elígela de la lista.',
      );
    }
  }

  async createFaculty(userId: string, dto: CreateFacultyRequestDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(632112901)::text`;
      const university = await tx.university.findFirst({
        where: {
          id: dto.universityId,
          ...visibleUniversities({ id: userId, role: 'TEACHER' }),
        },
      });
      if (!university)
        throw new NotFoundException('Universidad no encontrada.');
      await this.checkFacultyName(tx, university.id, dto.facultyName);
      const previous = await tx.universityRequest.findMany({
        where: {
          userId,
          universityId: university.id,
          kind: 'FACULTY',
          status: { not: 'APPROVED' },
        },
        select: { facultyName: true },
      });
      if (
        previous.some(
          (row) =>
            normalizedName(row.facultyName) === normalizedName(dto.facultyName),
        )
      ) {
        throw new ConflictException(
          'Ya tienes una solicitud para esta facultad. Puedes corregirla en Mis solicitudes.',
        );
      }
      const faculty = await tx.faculty.create({
        data: {
          universityId: university.id,
          name: dto.facultyName,
          abbreviation: dto.abbreviation,
          approvalStatus: 'PENDING',
          createdById: userId,
        },
      });
      const career = await tx.career.create({
        data: { name: dto.careerName, facultyId: faculty.id },
      });
      await tx.userCareer.create({ data: { userId, careerId: career.id } });
      return tx.universityRequest.create({
        data: {
          userId,
          kind: 'FACULTY',
          universityId: university.id,
          universityName: university.name,
          facultyId: faculty.id,
          careerId: career.id,
          facultyName: faculty.name,
          careerName: career.name,
          abbreviation: dto.abbreviation,
        },
      });
    });
  }

  async resubmitFaculty(
    id: string,
    userId: string,
    dto: FacultyRequestFieldsDto,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(632112901)::text`;
      const row = await tx.universityRequest.findFirst({
        where: { id, userId, kind: 'FACULTY' },
      });
      if (!row?.universityId || !row.facultyId || !row.careerId)
        throw new NotFoundException();
      if (row.status === 'APPROVED')
        throw new ConflictException(
          'La facultad ya fue aprobada. Sus cambios generales corresponden al administrador.',
        );
      await this.checkFacultyName(
        tx,
        row.universityId,
        dto.facultyName,
        row.facultyId,
      );
      await tx.faculty.update({
        where: { id: row.facultyId },
        data: {
          name: dto.facultyName,
          abbreviation: dto.abbreviation ?? null,
          approvalStatus: 'PENDING',
        },
      });
      await tx.career.update({
        where: { id: row.careerId },
        data: { name: dto.careerName },
      });
      return tx.universityRequest.update({
        where: { id },
        data: {
          facultyName: dto.facultyName,
          careerName: dto.careerName,
          abbreviation: dto.abbreviation ?? null,
          status: 'PENDING',
          reviewNotes: null,
        },
      });
    });
  }

  findAll(user: Actor) {
    return this.prisma.universityRequest.findMany({
      where: user.role === 'SUPER_ADMIN' ? {} : { userId: user.id },
      include: { user: { select: privateUser } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
  async findOne(id: string, user: Actor) {
    const row = await this.prisma.universityRequest.findFirst({
      where: {
        id,
        ...(user.role === 'SUPER_ADMIN' ? {} : { userId: user.id }),
      },
      include: { user: { select: privateUser } },
    });
    if (!row) throw new NotFoundException();
    return row;
  }
  async update(id: string, dto: ReviewRequestDto) {
    if (dto.status === 'PENDING')
      throw new BadRequestException(
        'Selecciona aprobar o solicitar correcciones.',
      );
    if (dto.status === 'REJECTED' && !dto.reviewNotes?.trim())
      throw new BadRequestException(
        'Indica qué datos debe corregir el docente.',
      );
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(632112901)::text`;
      const row = await tx.universityRequest.findUnique({ where: { id } });
      if (!row) throw new NotFoundException();
      if (row.status === dto.status) return row;
      if (row.status !== 'PENDING')
        throw new ConflictException(
          'Esta solicitud ya fue revisada. El docente debe reenviarla para una nueva revisión.',
        );
      if (row.kind === 'FACULTY') {
        if (!row.facultyId)
          throw new ConflictException('La facultad provisional ya no existe.');
        const faculty = await tx.faculty.findUnique({
          where: { id: row.facultyId },
        });
        if (!faculty || faculty.universityId !== row.universityId)
          throw new NotFoundException();
        if (dto.status === 'APPROVED')
          await this.checkFacultyName(
            tx,
            faculty.universityId,
            faculty.name,
            faculty.id,
          );
        await tx.faculty.update({
          where: { id: faculty.id },
          data: { approvalStatus: dto.status },
        });
      } else if (dto.status === 'APPROVED') {
        if (!row.universityId)
          throw new ConflictException(
            'Esta solicitud antigua no tiene un espacio provisional. Solicita al docente volver a crearla.',
          );
        const university = await tx.university.findUniqueOrThrow({
          where: { id: row.universityId },
        });
        await this.checkName(tx, university.name, university.id);
      }
      if (row.kind === 'UNIVERSITY' && row.universityId)
        await tx.university.update({
          where: { id: row.universityId },
          data: { approvalStatus: dto.status },
        });
      return tx.universityRequest.update({
        where: { id },
        data: {
          status: dto.status,
          reviewNotes: dto.reviewNotes?.trim() || null,
        },
      });
    });
  }
  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.universityRequest.findUnique({ where: { id } });
      if (!row) throw new NotFoundException();
      if (row.universityId && row.status !== 'APPROVED')
        throw new BadRequestException(
          'Conserva esta solicitud para que el docente pueda corregirla sin perder su trabajo.',
        );
      return tx.universityRequest.delete({ where: { id } });
    });
  }
}
