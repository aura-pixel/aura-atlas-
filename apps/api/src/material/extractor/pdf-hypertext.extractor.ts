import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";

import { PDFParse } from "pdf-parse";

@Injectable()
export class PdfHypertextExtractor {
  async extract(buffer: Buffer) {
    if (!buffer || buffer.length === 0) {
      throw new BadRequestException(
        "El archivo PDF está vacío o no contiene datos.",
      );
    }

    const pdfHeader =
      buffer.subarray(0, 5).toString();

    if (pdfHeader !== "%PDF-") {
      throw new BadRequestException(
        "El archivo no parece ser un PDF válido.",
      );
    }

    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result =
        await parser.getText();

      return {
        text: result.text,
        pages: result.pages,
        totalPages: result.total,
      };
    } finally {
      await parser.destroy();
    }
  }
}