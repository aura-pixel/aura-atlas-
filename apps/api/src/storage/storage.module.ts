import { Global, Module } from '@nestjs/common';
import { R2Service } from './r2.service';
import { PublicImagesController } from './public-images.controller';

@Global()
@Module({
  providers: [R2Service],
  controllers: [PublicImagesController],
  exports: [R2Service],
})
export class StorageModule {}
