import {
  BadRequestException,
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
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  diskStorage,
  FileFilterCallback,
} from "multer";
import { extname } from "path";

import { SubjectsService } from "./subject.service";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { UpdateSubjectDto } from "./dto/update-subject.dto";

// ─────────────────────────────────────────────
// Configuración de almacenamiento Multer
// ─────────────────────────────────────────────

const multerStorage = diskStorage({
  destination: "./uploads/subjects",

  filename: (req, file, callback) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    callback(
      null,
      uniqueName + extname(file.originalname),
    );
  },
});

// ─────────────────────────────────────────────
// Validación del tipo de archivo
// ─────────────────────────────────────────────

const multerFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    throw new BadRequestException(
      "La imagen debe ser JPG, PNG o WEBP.",
    );
  }

  callback(null, true);
};

// ─────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────

@Controller("subjects")
@UseGuards(AuthGuard("jwt"))
export class SubjectsController {
  constructor(
    private readonly subjectsService: SubjectsService,
  ) {}

  // ───────────────────────────────────────────
  // Crear materia
  // ───────────────────────────────────────────

  @Post()
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: multerStorage,
      fileFilter: multerFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async create(
    @Body() dto: CreateSubjectDto,
    @UploadedFile()
    logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    const logoUrl = logo
      ? `/uploads/subjects/${logo.filename}`
      : undefined;

    return this.subjectsService.create(
      dto,
      req.user,
      logoUrl,
    );
  }

  // ───────────────────────────────────────────
  // Obtener materias de una carrera
  // ───────────────────────────────────────────

  @Get("career/:careerId")
  findByCareer(
    @Param("careerId") careerId: string,
    @Req() req: any,
  ) {
    return this.subjectsService.findByCareer(
      careerId,
      req.user,
    );
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

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.subjectsService.findOne(
      id,
      req.user,
    );
  }

  // ───────────────────────────────────────────
  // Actualizar estructura académica
  // ───────────────────────────────────────────

  @Patch(":id/academic-structure")
  async updateAcademicStructure(
    @Param("id") id: string,
    @Body() dto: { structure: any },
    @Req() req: any,
  ) {
    return this.subjectsService.updateAcademicStructure(
      id,
      dto.structure,
      req.user,
    );
  }

  // ───────────────────────────────────────────
  // Confirmar estructura académica
  // ───────────────────────────────────────────

  @Patch(":id/academic-structure/confirm")
  async confirmAcademicStructure(
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.subjectsService.confirmAcademicStructure(
      id,
      req.user,
    );
  }

  // ───────────────────────────────────────────
  // Actualizar materia
  // ───────────────────────────────────────────

  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: multerStorage,
      fileFilter: multerFileFilter,
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
    }),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateSubjectDto,
    @UploadedFile()
    logo?: Express.Multer.File,
    @Req() req?: any,
  ) {
    const logoUrl = logo
      ? `/uploads/subjects/${logo.filename}`
      : undefined;

    return this.subjectsService.update(
      id,
      dto,
      req.user,
      logoUrl,
    );
  }

  // ───────────────────────────────────────────
  // Eliminar materia
  // ───────────────────────────────────────────

  @Delete(":id")
  remove(
    @Param("id") id: string,
    @Req() req: any,
  ) {
    return this.subjectsService.remove(
      id,
      req.user,
    );
  }
}
