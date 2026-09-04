import { Module } from "@nestjs/common";

import { PrismaModule } from "../prisma/prisma.module";

import { UniversityRequestsController } from "./university-requests.controller";
import { UniversityRequestsService } from "./university-requests.service";

@Module({
  imports: [PrismaModule],
  controllers: [UniversityRequestsController],
  providers: [UniversityRequestsService],
})
export class UniversityRequestsModule {}