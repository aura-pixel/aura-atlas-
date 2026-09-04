import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

import { UniversitiesService } from "./universities.service";
import { CreateUniversityDto } from "./dto/create-university.dto";
import { UpdateUniversityDto } from "./dto/update-university.dto";

@Controller("universities")
export class UniversitiesController {
  constructor(
    private readonly universitiesService: UniversitiesService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: diskStorage({
        destination: "./uploads/universities",
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
    @Body() dto: CreateUniversityDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const logoUrl = logo
      ? `/uploads/universities/${logo.filename}`
      : undefined;

    return this.universitiesService.create(
      dto,
      logoUrl,
    );
  }

  @Get()
  findAll() {
    return this.universitiesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.universitiesService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: diskStorage({
        destination: "./uploads/universities",
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
    @Body() dto: UpdateUniversityDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const logoUrl = logo
      ? `/uploads/universities/${logo.filename}`
      : undefined;

    return this.universitiesService.update(
      id,
      dto,
      logoUrl,
    );
  }
}