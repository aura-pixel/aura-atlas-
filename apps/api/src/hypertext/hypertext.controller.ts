import { ConfigurationDto, UnitImageDto } from '../security/dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { logoUpload, UploadConcurrency } from '../security/uploads';
import { UnitImageService } from './unit-image.service';
import { Readable } from 'node:stream';
import type { Response } from 'express';

import { AuthGuard } from '@nestjs/passport';

import { HypertextService } from './hypertext.service';

@Controller('hypertexts')
export class HypertextController {
  constructor(
    private readonly hypertextService: HypertextService,
    private readonly images: UnitImageService,
  ) {}
  @Get('unit-images/:unitId')
  @UseGuards(OptionalJwtAuthGuard)
  async image(
    @Param('unitId') unitId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const image = await this.images.read(unitId, req.user?.id);
    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; sandbox");
    if (image.Body instanceof Readable) {
      const body = image.Body;
      res.on('close', () => body.destroy());
      body.on('error', () => res.destroy());
      body.pipe(res);
    } else res.send(Buffer.from(await image.Body!.transformToByteArray()));
  }
  @Post(':id/units/:unitId/image')
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @UseInterceptors(UploadConcurrency, FileInterceptor('image', logoUpload))
  uploadImage(
    @Param('id') id: string,
    @Param('unitId') unitId: string,
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.images.upload(id, unitId, req.user.id, file);
  }

  @Get('public/:slug')
  async findPublic(@Param('slug') slug: string) {
    return this.hypertextService.findPublicBySlug(slug);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.hypertextService.findOne(id, req.user.id);
  }

  @Patch(':id/configuration')
  @UseGuards(AuthGuard('jwt'))
  async updateConfiguration(
    @Param('id') id: string,
    @Body()
    body: ConfigurationDto,
    @Req() req: any,
  ) {
    return this.hypertextService.updateConfiguration(id, body, req.user.id);
  }

  @Patch(':id/units/:unitId/image')
  @UseGuards(AuthGuard('jwt'))
  async updateUnitImage(
    @Param('id') id: string,
    @Param('unitId') unitId: string,
    @Body()
    body: UnitImageDto,
    @Req() req: any,
  ) {
    return this.images.select(id, unitId, req.user.id, body.imageUrl ?? null);
  }

  @Post(':id/publish')
  @UseGuards(AuthGuard('jwt'))
  async publish(@Param('id') id: string, @Req() req: any) {
    return this.hypertextService.publish(id, req.user.id);
  }
}
