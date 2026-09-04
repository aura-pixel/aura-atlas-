import { Module } from "@nestjs/common";

import { UniversitiesController } from "./universities.controller";
import { UniversitiesService } from "./universities.service";

import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [UniversitiesController],
  providers: [UniversitiesService],
})
export class UniversitiesModule {}