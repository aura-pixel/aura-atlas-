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

import { CareersService } from './careers.service';

import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@Controller('careers')
export class CareersController {
  constructor(private readonly careersService: CareersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @UseInterceptors(UploadConcurrency, FileInterceptor('logo', logoUpload))
  async create(
    @Body() dto: CreateCareerDto,
    @UploadedFile() logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    const logoUrl = await persistLogo(logo, 'careers', req.user.id);

    return this.careersService.create(dto, logoUrl);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Query('facultyId')
    facultyId?: string,
    @Req() req?: any,
  ) {
    return this.careersService.findAll(facultyId, req?.user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req?: any) {
    return this.careersService.findOne(id, req?.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  @UseInterceptors(UploadConcurrency, FileInterceptor('logo', logoUpload))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCareerDto,
    @UploadedFile() logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    const logoUrl = await persistLogo(logo, 'careers', req.user.id);

    return this.careersService.update(id, dto, logoUrl);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  remove(@Param('id') id: string) {
    return this.careersService.remove(id);
  }
}
