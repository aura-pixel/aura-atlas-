import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";

import {
  FileInterceptor,
} from "@nestjs/platform-express";

import { AuthGuard } from "@nestjs/passport";

import { PdfTextExtractor } from "./extractors/pdf-text.extractor";
import { AcademicStructureParser } from "./parsers/academic-structure.parser";

@Controller("academic-structure")
export class AcademicStructureController {
  constructor(
    private readonly pdfTextExtractor: PdfTextExtractor,
    private readonly structureParser: AcademicStructureParser,
  ) {}

  @Post("analyze")
  @UseGuards(AuthGuard("jwt"))
  @UseInterceptors(
    FileInterceptor("file"),
  )
  async analyze(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "Debes subir un archivo PDF.",
      );
    }

    if (
      file.mimetype !==
      "application/pdf"
    ) {
      throw new BadRequestException(
        "El archivo debe ser un PDF.",
      );
    }

    const extracted =
      await this.pdfTextExtractor.extract(
        file.buffer,
      );

    const structure =
      this.structureParser.parse(
        extracted.text,
      );

    return {
      totalPages:
        extracted.totalPages,

      structure,
    };
  }
}