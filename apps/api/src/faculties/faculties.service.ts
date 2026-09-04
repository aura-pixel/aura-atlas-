import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { CreateFacultyDto } from "./dto/create-faculty.dto";
import { UpdateFacultyDto } from "./dto/update-faculty.dto";

@Injectable()
export class FacultiesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    dto: CreateFacultyDto,
    logoUrl?: string,
  ) {
    return this.prisma.faculty.create({
      data: {
        ...dto,
        logoUrl,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateFacultyDto,
    logoUrl?: string,
  ) {
    return this.prisma.faculty.update({
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
    universityId?: string,
  ) {
    return this.prisma.faculty.findMany({
      where: universityId
        ? {
            universityId,
          }
        : undefined,
      include: {
        university: true,
        careers: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async findOne(
    id: string,
  ) {
    return this.prisma.faculty.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        university: true,
        careers: true,
      },
    });
  }

  async remove(
    id: string,
  ) {
    return this.prisma.faculty.delete({
      where: {
        id,
      },
    });
  }
}