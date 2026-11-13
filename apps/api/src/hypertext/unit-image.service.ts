import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../storage/r2.service';

@Injectable()
export class UnitImageService {
  constructor(
    private readonly db: PrismaService,
    private readonly storage: R2Service,
  ) {}
  private prefix(userId: string) {
    return `users/${userId}/unit-images/`;
  }
  private async replace(
    hypertextId: string,
    unitId: string,
    userId: string,
    imageUrl: string | null,
  ) {
    const result = await this.db.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
        const unit = await tx.unit.findFirst({
          where: { id: unitId, hypertextId, hypertext: { userId } },
        });
        if (!unit) throw new NotFoundException('Unidad no encontrada.');
        if (
          imageUrl?.startsWith(this.prefix(userId)) &&
          !unit.imageUrl?.startsWith(this.prefix(userId))
        ) {
          const count = await tx.unit.count({
            where: {
              hypertext: { userId },
              imageUrl: { startsWith: this.prefix(userId) },
            },
          });
          if (count >= 200)
            throw new BadRequestException(
              'Has alcanzado el límite de 200 imágenes propias para unidades. Puedes usar la biblioteca.',
            );
        }
        return {
          previous: unit.imageUrl,
          unit: await tx.unit.update({
            where: { id: unitId },
            data: { imageUrl },
          }),
        };
      },
      { maxWait: 10000, timeout: 30000 },
    );
    if (
      result.previous?.startsWith(this.prefix(userId)) &&
      result.previous !== imageUrl
    ) {
      await this.storage.deleteFile(result.previous).catch(() => undefined);
    }
    return result.unit;
  }
  select(
    hypertextId: string,
    unitId: string,
    userId: string,
    imageUrl: string | null,
  ) {
    return this.replace(hypertextId, unitId, userId, imageUrl);
  }
  async upload(
    hypertextId: string,
    unitId: string,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const owned = await this.db.unit.findFirst({
      where: { id: unitId, hypertextId, hypertext: { userId } },
      select: { id: true },
    });
    if (!owned) throw new NotFoundException('Unidad no encontrada.');
    if (!file || file.size > 2 * 1024 * 1024)
      throw new BadRequestException('Selecciona una imagen de hasta 2 MB.');
    let image: Buffer;
    try {
      const input = sharp(file.buffer, {
        limitInputPixels: 16_000_000,
        animated: false,
      });
      const metadata = await input.metadata();
      if (!['png', 'jpeg', 'webp'].includes(metadata.format ?? ''))
        throw new Error();
      image = await input
        .rotate()
        .resize(1400, 1000, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    } catch {
      throw new BadRequestException(
        'La imagen debe ser un PNG, JPG o WEBP válido.',
      );
    }
    const key = `${this.prefix(userId)}${unitId}/${randomUUID()}.webp`;
    try {
      await this.storage.uploadFile(key, image, 'image/webp');
      return await this.replace(hypertextId, unitId, userId, key);
    } catch (error) {
      await this.storage.deleteFile(key).catch(() => undefined);
      throw error;
    }
  }
  async read(unitId: string, userId?: string) {
    const unit = await this.db.unit.findFirst({
      where: {
        id: unitId,
        OR: [
          ...(userId ? [{ hypertext: { userId } }] : []),
          {
            topics: { some: { materials: { some: {} } } },
            hypertext: {
              isPublished: true,
              subject: {
                career: {
                  faculty: {
                    approvalStatus: 'APPROVED',
                    university: { approvalStatus: 'APPROVED' },
                  },
                },
              },
            },
          },
        ],
      },
      include: { hypertext: { select: { userId: true } } },
    });
    if (!unit?.imageUrl?.startsWith(this.prefix(unit.hypertext.userId)))
      throw new NotFoundException('Imagen no encontrada.');
    return this.storage.getFile(unit.imageUrl);
  }
}
