import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { CreateUniversityDto } from "./dto/create-university.dto";
import { UpdateUniversityDto } from "./dto/update-university.dto";

@Injectable()
export class UniversitiesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateUniversityDto,
    logoUrl?: string,
  ) {
    return this.prisma.university.create({
      data: {
        ...dto,
        logoUrl,
      },
    });
  }

  async update(
  id: string,
  dto: UpdateUniversityDto,
  logoUrl?: string,
) {
  return this.prisma.university.update({
    where: {
      id,
    },
    data: {
      ...dto,
      ...(logoUrl && { logoUrl }),
    },
  });
}

  async findAll() {
  return this.prisma.university.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

async findOne(id: string) {
  return this.prisma.university.findUniqueOrThrow({
    where: {
      id,
    },

    include: {
      faculties: {
        orderBy: {
          name: "asc",
        },
      },
    },
  });
}

}

