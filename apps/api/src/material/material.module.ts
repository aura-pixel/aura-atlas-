import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';

import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';

import { PrismaModule } from '../prisma/prisma.module';
import { AcademicStructureModule } from '../academic-structure/academic-structure.module';

import { PdfHypertextExtractor } from './extractor/pdf-hypertext.extractor';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, PrismaModule, AcademicStructureModule, StorageModule],

  controllers: [MaterialController],

  providers: [MaterialService, PdfHypertextExtractor],

  exports: [MaterialService, StorageModule],
})
export class MaterialModule {}
