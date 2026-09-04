import { Module } from "@nestjs/common";

import { HypertextController } from "./hypertext.controller";
import { HypertextService } from "./hypertext.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [
    PrismaModule,
  ],

  controllers: [
    HypertextController,
  ],

  providers: [
    HypertextService,
  ],

  exports: [
    HypertextService,
  ],
})
export class HypertextModule {}