import { configureSecurity } from './security/configure';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(
      AppModule
    );

  configureSecurity(app);

  app.useStaticAssets(
    join(process.cwd(), "uploads"),
    {
      prefix: "/uploads",
      setHeaders: (res) => { res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox"); res.setHeader("X-Content-Type-Options", "nosniff"); },
    },
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();