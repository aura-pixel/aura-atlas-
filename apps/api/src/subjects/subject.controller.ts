import { R2Service } from '../storage/r2.service';
import { SaveStructureDto } from '../security/dto';
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
  UploadedFile,
  UseInterceptors,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';

import { SubjectsService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

// ─────────────────────────────────────────────
// Configuración de almacenamiento Multer
// ─────────────────────────────────────────────

@Controller('subjects')
@UseGuards(AuthGuard('jwt'))
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
    private readonly storage: R2Service,
  ) {}

  // ───────────────────────────────────────────
  // Crear materia
  // ───────────────────────────────────────────

  @Post()
  @UseInterceptors(UploadConcurrency, FileInterceptor('logo', logoUpload))
  async create(
    @Body() dto: CreateSubjectDto,
    @UploadedFile()
    logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    if (req.user.role === 'TEACHER')
      await this.subjectsService.checkTeacherCareerAccess(
        req.user.id,
        dto.careerId,
      );
    const logoUrl = await persistLogo(
      logo,
      'subjects',
      req.user.id,
      this.storage,
    );

    return this.subjectsService.create(dto, req.user, logoUrl);
  }

  // ───────────────────────────────────────────
  // Obtener materias de una carrera
  // ───────────────────────────────────────────

  @Get('career/:careerId')
  findByCareer(@Param('careerId') careerId: string, @Req() req: any) {
    return this.subjectsService.findByCareer(careerId, req.user);
  }

  // ───────────────────────────────────────────
  // Obtener todas las materias
  // ───────────────────────────────────────────

  @Get()
  findAll(@Req() req: any) {
    return this.subjectsService.findAll(req.user);
  }

  // ───────────────────────────────────────────
  // Obtener una materia
  // ───────────────────────────────────────────

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.subjectsService.findOne(id, req.user);
  }

  // ───────────────────────────────────────────
  // Actualizar estructura académica
  // ───────────────────────────────────────────

  @Patch(':id/academic-structure')
  async updateAcademicStructure(
    @Param('id') id: string,
    @Body() dto: SaveStructureDto,
    @Req() req: any,
  ) {
    return this.subjectsService.updateAcademicStructure(
      id,
      dto.structure as any,
      req.user,
    );
  }

  // ───────────────────────────────────────────
  // Confirmar estructura académica
  // ───────────────────────────────────────────

  @Patch(':id/academic-structure/confirm')
  async confirmAcademicStructure(@Param('id') id: string, @Req() req: any) {
    return this.subjectsService.confirmAcademicStructure(id, req.user);
  }

  // ───────────────────────────────────────────
  // Actualizar materia
  // ───────────────────────────────────────────

  @Patch(':id')
  @UseInterceptors(UploadConcurrency, FileInterceptor('logo', logoUpload))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
    @UploadedFile()
    logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    await this.subjectsService.findOne(id, req.user);
    const logoUrl = await persistLogo(
      logo,
      'subjects',
      req.user.id,
      this.storage,
    );

    return this.subjectsService.update(id, dto, req.user, logoUrl);
  }

  // ───────────────────────────────────────────
  // Eliminar materia
  // ───────────────────────────────────────────

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.subjectsService.remove(id, req.user);
  }
}
