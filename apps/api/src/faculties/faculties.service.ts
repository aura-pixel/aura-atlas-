import { visibleFaculties, type CatalogActor } from '../security/university-visibility';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Injectable()
export class FacultiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFacultyDto, logoUrl?: string) {
    return this.prisma.faculty.create({
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        description: dto.description,
        color: dto.color,
        universityId: dto.universityId,
        logoUrl,
      },
    });
  }

  async update(id: string, dto: UpdateFacultyDto, logoUrl?: string) {
    return this.prisma.faculty.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        description: dto.description,
        color: dto.color,
        universityId: dto.universityId,
        ...(logoUrl && { logoUrl }),
      },
    });
  }

  async findAll(universityId?: string, user?: CatalogActor) {
    return this.prisma.faculty.findMany({
      where: { universityId, ...visibleFaculties(user) },
      include: {
        university: true,
        careers: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string, user?: CatalogActor) {
    const row = await this.prisma.faculty.findFirst({
      where: {
        id,
        ...visibleFaculties(user),
      },
      include: {
        university: true,
        careers: true,
      },
    });
    if (!row) throw new NotFoundException();
    return row;
  }

  async remove(id: string) {
    return this.prisma.faculty.delete({
      where: {
        id,
      },
    });
  }
}
