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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

import { FacultiesService } from "./faculties.service";
import { CreateFacultyDto } from "./dto/create-faculty.dto";
import { UpdateFacultyDto } from "./dto/update-faculty.dto";

@Controller("faculties")
export class FacultiesController {
  constructor(
    private readonly facultiesService: FacultiesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: diskStorage({
        destination: "./uploads/faculties",
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
      }),
    }),
  )
  async create(
    @Body() dto: CreateFacultyDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const logoUrl = logo
      ? `/uploads/faculties/${logo.filename}`
      : undefined;

    return this.facultiesService.create(
      dto,
      logoUrl,
    );
  }

  @Get()
  findAll(
    @Query("universityId")
    universityId?: string,
  ) {
    return this.facultiesService.findAll(
      universityId,
    );
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
  ) {
    return this.facultiesService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: diskStorage({
        destination: "./uploads/faculties",
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
      }),
    }),
  )
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateFacultyDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const logoUrl = logo
      ? `/uploads/faculties/${logo.filename}`
      : undefined;

    return this.facultiesService.update(
      id,
      dto,
      logoUrl,
    );
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
  ) {
    return this.facultiesService.remove(id);
  }
}