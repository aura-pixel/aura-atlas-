import { Module } from "@nestjs/common";

import {
  AcademicStructureController,
} from "./academic-structure.controller";

import {
  PdfTextExtractor,
} from "./extractors/pdf-text.extractor";

import {
  AcademicStructureParser,
} from "./parsers/academic-structure.parser";

import {
  AcademicContentParser,
} from "./parsers/academic-content.parser";

import {
  ContentMatcher,
} from "./classifiers/content-matcher";

@Module({
  controllers: [
    AcademicStructureController,
  ],

  providers: [
    PdfTextExtractor,
    AcademicStructureParser,
    AcademicContentParser,
    ContentMatcher,
  ],

  exports: [
    ContentMatcher,
  ],
})
export class AcademicStructureModule {}