import { Module } from '@nestjs/common';

import { HypertextController } from './hypertext.controller';
import { HypertextService } from './hypertext.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MaterialModule } from '../material/material.module';
import { AuthModule } from '../auth/auth.module';
import { UnitImageService } from './unit-image.service';

@Module({
  imports: [PrismaModule, MaterialModule, AuthModule],

  controllers: [HypertextController],

  providers: [HypertextService, UnitImageService],

  exports: [HypertextService],
})
export class HypertextModule {}
