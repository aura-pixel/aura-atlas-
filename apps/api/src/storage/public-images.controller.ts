import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Res,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Readable } from 'node:stream';
import type { Response } from 'express';
import { R2Service } from './r2.service';
import { publicLogoKey } from './public-logo-key';

@Controller('uploads')
export class PublicImagesController {
  constructor(private readonly storage: R2Service) {}

  @Get([':folder/:ownerId/:filename', ':folder/:filename'])
  async image(
    @Param('folder') folder: string,
    @Param('ownerId') ownerId: string | undefined,
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const key = ownerId
      ? publicLogoKey(folder, ownerId, filename)
      : publicLogoKey(folder, filename);
    const image = await this.storage
      .getFile(key)
      .catch(
        (error: { name?: string; $metadata?: { httpStatusCode?: number } }) => {
          if (
            error.name === 'NoSuchKey' ||
            error.name === 'NotFound' ||
            error.$metadata?.httpStatusCode === 404
          )
            throw new NotFoundException('Imagen no encontrada.');
          throw new ServiceUnavailableException('No se pudo cargar la imagen.');
        },
      );
    if (!image.Body) throw new NotFoundException('Imagen no encontrada.');
    response.setHeader('Content-Type', 'image/webp');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    if (image.ContentLength !== undefined)
      response.setHeader('Content-Length', image.ContentLength);
    if (image.Body instanceof Readable) {
      const body = image.Body;
      response.on('close', () => body.destroy());
      body.on('error', () => response.destroy());
      body.pipe(response);
    } else response.send(Buffer.from(await image.Body.transformToByteArray()));
  }
}
