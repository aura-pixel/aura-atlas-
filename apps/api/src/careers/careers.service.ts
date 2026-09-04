import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { CreateCareerDto } from "./dto/create-career.dto";
import { UpdateCareerDto } from "./dto/update-career.dto";

@Injectable()
export class CareersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateCareerDto,
    logoUrl?: string,
  ) {
    return this.prisma.career.create({
      data: {
        ...dto,
        logoUrl,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateCareerDto,
    logoUrl?: string,
  ) {
    return this.prisma.career.update({
      where: {
        id,
      },
      data: {
        ...dto,
        ...(logoUrl && { logoUrl }),
      },
    });
  }

  async findAll(
    facultyId?: string,
  ) {
    return this.prisma.career.findMany({
      where: facultyId
        ? {
            facultyId,
          }
        : undefined,
      include: {
        faculty: true,
        subjects: true,
        users: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(
    id: string,
  ) {
    return this.prisma.career.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        faculty: true,
        subjects: true,
        users: true,
      },
    });
  }

  async remove(
    id: string,
  ) {
    return this.prisma.career.delete({
      where: {
        id,
      },
    });
  }
}