import { Module } from "@nestjs/common";

import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";

import { PrismaModule } from "../prisma/prisma.module";
import { AcademicStructureModule } from "../academic-structure/academic-structure.module";

import { PdfHypertextExtractor } from "./extractor/pdf-hypertext.extractor";

@Module({
  imports: [
    PrismaModule,
    AcademicStructureModule,
  ],

  controllers: [
    MaterialController,
  ],

  providers: [
    MaterialService,
    PdfHypertextExtractor,
  ],

  exports: [
    MaterialService,
  ],
})
export class MaterialModule {}