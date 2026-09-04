import { Injectable } from "@nestjs/common";
import { PDFParse } from "pdf-parse";

@Injectable()
export class PdfTextExtractor {
  async extract(buffer: Buffer) {
    const parser = new PDFParse({
      data: buffer,
    });

    try {
      const result = await parser.getText();

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