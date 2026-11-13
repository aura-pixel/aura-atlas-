import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { Req } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminOnly, RolesGuard } from '../security/access';
import {
  logoUpload,
  persistLogo,
  UploadConcurrency,
} from '../security/uploads';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @UseInterceptors(UploadConcurrency, FileInterceptor('logo', logoUpload))
  async create(
    @Body() dto: CreateUniversityDto,
    @UploadedFile() logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    const logoUrl = await persistLogo(logo, 'universities', req.user.id);

    return this.universitiesService.create(dto, logoUrl);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(@Req() req?: any) {
    return this.universitiesService.findAll(req?.user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req?: any) {
    return this.universitiesService.findOne(id, req?.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @UseInterceptors(UploadConcurrency, FileInterceptor('logo', logoUpload))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUniversityDto,
    @UploadedFile() logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    const logoUrl = await persistLogo(logo, 'universities', req.user.id);

    return this.universitiesService.update(id, dto, logoUrl);
  }
}
