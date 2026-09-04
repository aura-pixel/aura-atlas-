import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

import { CreateUniversityRequestDto } from "./dto/create-university-request.dto";
import { UpdateUniversityRequestDto } from "./dto/update-university-request.dto";

@Injectable()
export class UniversityRequestsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateUniversityRequestDto,
  ) {
    return this.prisma.universityRequest.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll() {
    return this.prisma.universityRequest.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.universityRequest.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateUniversityRequestDto,
  ) {
    return this.prisma.universityRequest.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.universityRequest.delete({
      where: {
        id,
      },
    });
  }
}