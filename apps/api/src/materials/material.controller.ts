import {
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Req,
  Param,
  
} from "@nestjs/common";

import { AuthGuard } from "@nestjs/passport";
import { FilesInterceptor } from "@nestjs/platform-express";

import { diskStorage } from "multer";
import { extname } from "path";

import { MaterialService } from "./material.service";

const multerStorage = diskStorage({
  destination: "./uploads/materials",
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

@Controller("materials")
export class MaterialController {
  constructor(
    private readonly materialService: MaterialService,
  ) {}

  @Post("upload/:subjectId")
@UseGuards(AuthGuard("jwt"))
@UseInterceptors(
  FilesInterceptor("files", 50, {
    storage: multerStorage,
  }),
)
async upload(
  @Param("subjectId") hypertextId: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Req() req: any,
) {
  return this.materialService.prepareFiles(
    hypertextId,
    files,
  );
}
}