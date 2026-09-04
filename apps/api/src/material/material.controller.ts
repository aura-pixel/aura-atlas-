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
  Res,
  NotFoundException,
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";

import {
  FilesInterceptor,
} from "@nestjs/platform-express";

import {
  memoryStorage,
} from "multer";

import type { Response } from "express";

import { MaterialService } from "./material.service";
import { R2Service } from "../storage/r2.service";

@Controller("materials")
export class MaterialController {
  constructor(
    private readonly materialService: MaterialService,
    private readonly r2Service: R2Service,
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

  @Get("file/:materialId")
  async getMaterialFile(
    @Param("materialId") materialId: string,
    @Res() res: Response,
  ) {
    const material =
      await this.materialService.getMaterialById(
        materialId,
      );

    if (!material || !material.url) {
      throw new NotFoundException(
        "Material no encontrado.",
      );
    }

    const file =
      await this.r2Service.getFile(
        material.url,
      );

    if (!file.Body) {
      throw new NotFoundException(
        "Archivo no encontrado.",
      );
    }

    if (file.ContentType) {
      res.setHeader(
        "Content-Type",
        file.ContentType,
      );
    }

    if (file.ContentLength !== undefined) {
      res.setHeader(
        "Content-Length",
        file.ContentLength.toString(),
      );
    }

    if (file.ContentDisposition) {
      res.setHeader(
        "Content-Disposition",
        file.ContentDisposition,
      );
    }

    const body = file.Body as any;

    if (typeof body.pipe === "function") {
      body.pipe(res);
      return;
    }

    const buffer = await body.transformToByteArray();

    res.send(
      Buffer.from(buffer),
    );
  }
}