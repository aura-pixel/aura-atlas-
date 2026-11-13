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
    const file = await this.r2.getFile(material.url);
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
    res.setHeader(
      'Content-Type',
      safeInline.has(type) ? type : 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `${safeInline.has(type) ? 'inline' : 'attachment'}; filename="material"`,
    );
    res.setHeader(
      'Content-Security-Policy',
      `default-src 'none'; ${safeInline.has(type) ? '' : 'sandbox; '}frame-ancestors ${process.env.FRONTEND_URL || 'http://localhost:3001'}`,
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
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
