import {
  Controller,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Body,
  Get,
  Req,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

import {
  FilesInterceptor,
} from "@nestjs/platform-express";

import {
  memoryStorage,
} from "multer";

import { MaterialService } from "./material.service";

@Controller("materials")
export class MaterialController {
  constructor(
    private readonly materialService: MaterialService,
  ) {}

  @Get("progress/:subjectId")
  @UseGuards(AuthGuard("jwt"))
  async getProgress(
    @Param("subjectId") subjectId: string,
    @Req() req: any,
  ) {
    return this.materialService.getHypertextProgress(
      subjectId,
      req.user.id,
    );
  }

  @Post("upload/:subjectId")
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(
    FilesInterceptor("files", 50, {
      storage: memoryStorage(),
      limits: {
        files: 50,
      },
    }),
  )
  async uploadFiles(
    @Param("subjectId") subjectId: string,
    @UploadedFiles()
    files: Express.Multer.File[],
    @Req() req: any,
  ) {
    return this.materialService.prepareFiles(
      subjectId,
      req.user.id,
      files,
    );
  }

  @Post("save/:subjectId")
  @UseGuards(AuthGuard("jwt"))
  async saveMaterials(
    @Param("subjectId") subjectId: string,
    @Body()
    body: {
  files: {
    name: string;
    mimeType: string;
    size: number;
    topicNumber: string;
    type: string;
    url: string;
  }[];
},
    @Req() req: any,
  ) {
    return this.materialService.saveMaterials(
      subjectId,
      req.user.id,
      body.files,
    );
  }
}