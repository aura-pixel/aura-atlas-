import type { AuthenticatedRequest } from '../security/access';
import { Readable } from 'node:stream';
import {
  Body,
  Controller,
  Get,
  Delete,
  Patch,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { MaterialService } from './material.service';
import { R2Service } from '../storage/r2.service';
import { SaveMaterialsDto, MaterialTopicDto } from '../security/dto';
import { materialUpload, UploadConcurrency } from '../security/uploads';
import { JwtService } from '@nestjs/jwt';
import { JwtStrategy, cookieToken } from '../auth/strategies/jwt.strategy';
@Controller('materials')
export class MaterialController {
  constructor(
    private readonly service: MaterialService,
    private readonly r2: R2Service,
    private readonly jwt: JwtService,
    private readonly strategy: JwtStrategy,
  ) {}
  @Get('progress/:subjectId')
  @UseGuards(AuthGuard('jwt'))
  progress(@Param('subjectId') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.getHypertextProgress(id, req.user.id);
  }
  @Get('workspace/:subjectId')
  @UseGuards(AuthGuard('jwt'))
  workspace(@Param('subjectId') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.getWorkspace(id, req.user.id);
  }
  @Patch(':materialId/topic')
  @UseGuards(AuthGuard('jwt'))
  assign(
    @Param('materialId') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: MaterialTopicDto,
  ) {
    return this.service.assignTopic(id, req.user.id, dto.topicNumber);
  }
  @Delete('pending/:uploadId')
  @UseGuards(AuthGuard('jwt'))
  discard(@Param('uploadId') id: string, @Req() req: AuthenticatedRequest) {
    return this.service.discardPending(id, req.user.id);
  }
  @Post('upload/:subjectId')
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 120, ttl: 60000 } })
  @UseInterceptors(
    UploadConcurrency,
    FilesInterceptor('files', 10, materialUpload),
  )
  upload(
    @Param('subjectId') id: string,
    @Req() req: AuthenticatedRequest,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.service.prepareFiles(id, req.user.id, files);
  }
  @Post('save/:subjectId')
  @UseGuards(AuthGuard('jwt'))
  save(
    @Param('subjectId') id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: SaveMaterialsDto,
  ) {
    return this.service.saveMaterials(id, req.user.id, dto.files);
  }
  @Get('file/:materialId')
  async file(
    @Param('materialId') id: string,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    let userId: string | undefined;
    const token =
      req.headers.authorization?.replace(/^Bearer /, '') || cookieToken(req);
    if (token) {
      try {
        const payload = await this.jwt.verifyAsync<{
          sub?: unknown;
          jti?: unknown;
        }>(token, {
          algorithms: ['HS256'],
        });
        userId = (await this.strategy.validate(payload)).id;
      } catch {
        /* Invalid sessions never grant private access. */
      }
    }
    const material = await this.service.getMaterialById(id, userId);
    if (!material.url || /^https?:/i.test(material.url))
      throw new NotFoundException();
    let range = req.headers.range;
    if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) range = undefined;
    const ifRange = req.headers['if-range'];
    if (range && ifRange) {
      const info = await this.r2.headFile(material.url);
      if (ifRange !== info.ETag && ifRange !== info.LastModified?.toUTCString())
        range = undefined;
    }
    const file = await this.r2
      .getFile(material.url, range)
      .catch(
        async (error: {
          name?: string;
          $metadata?: { httpStatusCode?: number };
        }) => {
          if (
            error.name === 'InvalidRange' ||
            error.$metadata?.httpStatusCode === 416
          ) {
            const info = await this.r2.headFile(material.url!);
            res.setHeader('Accept-Ranges', 'bytes');
            res.setHeader(
              'Content-Range',
              `bytes */${info.ContentLength ?? 0}`,
            );
            res.status(416).end();
            return null;
          }
          throw error;
        },
      );
    if (!file) return;
    if (!file.Body) throw new NotFoundException();
    const safeInline = new Set([
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/webp',
      'audio/mpeg',
      'audio/ogg',
      'audio/wav',
      'video/mp4',
      'video/webm',
    ]);
    const type = file.ContentType || 'application/octet-stream';
    const extensions: Record<string, string> = {
      'application/pdf': '.pdf',
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'audio/mpeg': '.mp3',
      'audio/ogg': '.ogg',
      'audio/wav': '.wav',
      'video/mp4': '.mp4',
      'video/webm': '.webm',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        '.docx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        '.pptx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        '.xlsx',
    };
    const extension = extensions[type] ?? '';
    let filename = material.name || 'material';
    if (extension && !filename.toLowerCase().endsWith(extension))
      filename += extension;
    const encodedName = encodeURIComponent(filename).replace(
      /[!'()*]/g,
      (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
    );
    res.setHeader(
      'Content-Type',
      safeInline.has(type) ? type : 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `${safeInline.has(type) ? 'inline' : 'attachment'}; filename="material${extension}"; filename*=UTF-8''${encodedName}`,
    );
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'none'; ${safeInline.has(type) ? '' : 'sandbox; '}frame-ancestors ${process.env.FRONTEND_URL || 'http://localhost:3001'}`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Accept-Ranges', 'bytes');
    if (file.ContentRange) {
      res.status(206);
      res.setHeader('Content-Range', file.ContentRange);
    }
    if (file.ETag) res.setHeader('ETag', file.ETag);
    if (file.LastModified)
      res.setHeader('Last-Modified', file.LastModified.toUTCString());
    if (file.ContentLength !== undefined)
      res.setHeader('Content-Length', String(file.ContentLength));
    const body = file.Body;
    res.on('close', () => {
      if (body instanceof Readable) body.destroy();
    });
    if (body instanceof Readable) {
      body.on('error', () => res.destroy());
      body.pipe(res);
      return;
    }
    res.send(Buffer.from(await body.transformToByteArray()));
  }
}
