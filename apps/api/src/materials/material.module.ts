import { Module } from "@nestjs/common";

import { MaterialController } from "./material.controller";
import { MaterialService } from "./material.service";

import { PrismaModule } from "../prisma/prisma.module";
import { AcademicStructureModule } from "../academic-structure/academic-structure.module";

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
  ],

  exports: [
    MaterialService,
  ],
})
export class MaterialModule {}