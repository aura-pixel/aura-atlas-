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

import { CareersService } from "./careers.service";

import { CreateCareerDto } from "./dto/create-career.dto";
import { UpdateCareerDto } from "./dto/update-career.dto";

@Controller("careers")
export class CareersController {
  constructor(
    private readonly careersService: CareersService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: diskStorage({
        destination: "./uploads/careers",
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
    @Body() dto: CreateCareerDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const logoUrl = logo
      ? `/uploads/careers/${logo.filename}`
      : undefined;

    return this.careersService.create(
      dto,
      logoUrl,
    );
  }

  @Get()
  findAll(
    @Query("facultyId")
    facultyId?: string,
  ) {
    return this.careersService.findAll(
      facultyId,
    );
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
  ) {
    return this.careersService.findOne(id);
  }

  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("logo", {
      storage: diskStorage({
        destination: "./uploads/careers",
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
    @Body() dto: UpdateCareerDto,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    const logoUrl = logo
      ? `/uploads/careers/${logo.filename}`
      : undefined;

    return this.careersService.update(
      id,
      dto,
      logoUrl,
    );
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
  ) {
    return this.careersService.remove(id);
  }
}