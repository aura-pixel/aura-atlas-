import { R2Service } from '../storage/r2.service';
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
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FacultiesService } from './faculties.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Controller('faculties')
export class FacultiesController {
  constructor(
    private readonly facultiesService: FacultiesService,
    private readonly storage: R2Service,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @UseInterceptors(UploadConcurrency, FileInterceptor('logo', logoUpload))
  async create(
    @Body() dto: CreateFacultyDto,
    @UploadedFile() logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    const logoUrl = await persistLogo(
      logo,
      'faculties',
      req.user.id,
      this.storage,
    );

    return this.facultiesService.create(dto, logoUrl);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query('universityId')
    universityId?: string,
    @Req() req?: any,
  ) {
    return this.facultiesService.findAll(universityId, req?.user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req?: any) {
    return this.facultiesService.findOne(id, req?.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @UseInterceptors(UploadConcurrency, FileInterceptor('logo', logoUpload))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateFacultyDto,
    @UploadedFile() logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    const logoUrl = await persistLogo(
      logo,
      'faculties',
      req.user.id,
      this.storage,
    );

    return this.facultiesService.update(id, dto, logoUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  remove(@Param('id') id: string) {
    return this.facultiesService.remove(id);
  }
}
