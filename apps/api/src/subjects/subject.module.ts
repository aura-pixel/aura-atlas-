import { Module } from "@nestjs/common";

import { SubjectsController } from "./subject.controller";
import { SubjectsService } from "./subject.service";

import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}