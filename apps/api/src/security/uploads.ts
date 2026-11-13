import {
  BadRequestException,
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { memoryStorage } from 'multer';
import { mkdir, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import sharp from 'sharp';
import { finalize } from 'rxjs';
export const logoUpload = {
  storage: memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
    fields: 10,
    fieldSize: 10000,
    parts: 11,
  },
};
export const pdfUpload = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 1, parts: 2 },
};
export const materialUpload = {
  storage: memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 10, fields: 1, parts: 11 },
};
export async function persistLogo(
  file: Express.Multer.File | undefined,
  folder: string,
  ownerId: string,
) {
  if (!file) return undefined;
  let buffer: Buffer;
  try {
    const image = sharp(file.buffer, {
      limitInputPixels: 16_000_000,
      animated: false,
    });
    const meta = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(meta.format || '')) throw new Error();
    buffer = await image
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new BadRequestException(
      'La imagen debe ser un JPG, PNG o WEBP válido.',
    );
  }
  const filename = `${randomUUID()}.webp`;
  if (!/^[a-z0-9-]+$/i.test(ownerId))
    throw new BadRequestException('Usuario inválido.');
  const dir = join(process.cwd(), 'uploads', folder, ownerId);
  await mkdir(dir, { recursive: true });
  const existing = await readdir(dir);
  const sizes = await Promise.all(
    existing.map((name) => stat(join(dir, name)).then((info) => info.size)),
  );
  if (
    existing.length >= 1000 ||
    sizes.reduce((a, b) => a + b, 0) + buffer.length > 100 * 1024 * 1024
  )
    throw new BadRequestException('Se alcanzó la cuota de imágenes.');
  await writeFile(join(dir, filename), buffer, { flag: 'wx' });
  return `/uploads/${folder}/${ownerId}/${filename}`;
}
export async function inspectMaterial(file: Express.Multer.File) {
  const { fileTypeFromBuffer } = await import('file-type');
  const detected = await fileTypeFromBuffer(file.buffer);
  const allowed = new Set([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'video/mp4',
    'video/webm',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]);
  if (!detected || !allowed.has(detected.mime))
    throw new BadRequestException(
      'Formato de archivo no permitido o contenido inválido.',
    );
  file.mimetype = detected.mime;
  return detected;
}
// The slot is acquired before Multer buffers the request and released on every exit path.
@Injectable()
export class UploadConcurrency implements NestInterceptor {
  private active = 0;
  intercept(context: ExecutionContext, next: CallHandler) {
    if (this.active >= 4)
      throw new HttpException(
        'Hay demasiadas cargas simultáneas. Inténtalo de nuevo.',
        429,
      );
    this.active++;
    return next.handle().pipe(
      finalize(() => {
        this.active--;
      }),
    );
  }
}
