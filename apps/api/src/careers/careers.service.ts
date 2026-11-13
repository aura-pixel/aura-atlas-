import { visibleFaculties, type CatalogActor } from '../security/university-visibility';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@Injectable()
export class CareersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCareerDto, logoUrl?: string) {
    return this.prisma.career.create({
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        description: dto.description,
        color: dto.color,
        facultyId: dto.facultyId,
        logoUrl,
      },
    });
  }

  async update(id: string, dto: UpdateCareerDto, logoUrl?: string) {
    return this.prisma.career.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        description: dto.description,
        color: dto.color,
        facultyId: dto.facultyId,
        ...(logoUrl && { logoUrl }),
      },
    });
  }

  async findAll(facultyId?: string, user?: CatalogActor) {
    return this.prisma.career.findMany({
      where: { facultyId, ...{ faculty: visibleFaculties(user) } },
      include: {
        faculty: true,
        subjects: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, user?: CatalogActor) {
    const row = await this.prisma.career.findFirst({
      where: {
        id,
        ...{ faculty: visibleFaculties(user) },
      },
      include: {
        faculty: true,
        subjects: true,
      },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async remove(id: string) {
    return this.prisma.career.delete({
      where: {
        id,
      },
    });
  }
}
