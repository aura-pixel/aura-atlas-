import { visibleFaculties } from '../security/university-visibility';
import { privateUser } from '../security/access';
import { Injectable, NotFoundException } from '@nestjs/common';

import { RegisterDto } from '../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(registerDto: RegisterDto) {
    return this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: registerDto.password,
        teacherType: registerDto.teacherType,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        careers: {
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
          },
        },
        hypertexts: true,
        requests: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        ...privateUser,
        careers: {
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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
          },
        },
        hypertexts: true,
        requests: true,
      },
    });
  }

  async setCareer(userId: string, careerId: string) {
    const career = await this.prisma.career.findFirst({
      where: {
        id: careerId,
        faculty: visibleFaculties({ id: userId, role: 'TEACHER' }),
      },
    });

    if (!career) {
      throw new NotFoundException('La carrera seleccionada no existe.');
    }

    return this.prisma.userCareer.upsert({
      where: {
        userId_careerId: {
          userId,
          careerId,
        },
      },
      update: {},
      create: {
        userId,
        careerId,
      },
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
      },
    });
  }
}
