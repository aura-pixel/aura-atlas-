import { visibleUniversities, visibleFaculties, type CatalogActor } from '../security/university-visibility';
import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

@Injectable()
export class UniversitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUniversityDto, logoUrl?: string) {
    return this.prisma.university.create({
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        description: dto.description,
        logoUrl,
      },
    });
  }

  async update(id: string, dto: UpdateUniversityDto, logoUrl?: string) {
    return this.prisma.university.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        abbreviation: dto.abbreviation,
        description: dto.description,
        ...(logoUrl && { logoUrl }),
      },
    });
  }

  async findAll(user?: CatalogActor) {
    return this.prisma.university.findMany({
      where: visibleUniversities(user),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, user?: CatalogActor) {
    const row = await this.prisma.university.findFirst({
      where: {
        id,
        ...visibleUniversities(user),
      },

      include: {
        faculties: {
          where: visibleFaculties(user),
          orderBy: {
            name: 'asc',
          },
        },
      },
    });
    if (!row) throw new NotFoundException();
    return row;
  }
}
