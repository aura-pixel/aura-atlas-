import { Module } from "@nestjs/common";

import { CareersController } from "./careers.controller";
import { CareersService } from "./careers.service";

import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}