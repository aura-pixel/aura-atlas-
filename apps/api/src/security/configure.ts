import type { Actor } from './access';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

export function configureSecurity(app: NestExpressApplication) {
  const frontendOrigin = new URL(
    process.env.FRONTEND_URL || 'http://localhost:3001',
  ).origin;
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
      throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
    if (!process.env.FRONTEND_URL?.startsWith('https://'))
      throw new Error('FRONTEND_URL debe usar HTTPS en producción.');
    if (!process.env.SMTP_URL || !process.env.MAIL_FROM)
      new Logger('EmailVerification').warn(
        'El envío de verificaciones está pendiente de configurar SMTP_URL y MAIL_FROM.',
      );
  }
  app.disable('x-powered-by');
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      frameguard: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: [frontendOrigin],
          sandbox: ['allow-same-origin'],
        },
      },
    }),
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.on('finish', () => {
      if (
        !['GET', 'HEAD', 'OPTIONS'].includes(req.method) ||
        [401, 403].includes(res.statusCode)
      ) {
        new Logger('SecurityAudit').log(
          JSON.stringify({
            method: req.method,
            route:
              (req.route as { path?: string } | undefined)?.path || 'unknown',
            status: res.statusCode,
            userId: (req as Request & { user?: Actor }).user?.id || null,
          }),
        );
      }
    });
    // Cookie-authenticated browser mutations must originate from the configured web app.
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      (!req.headers.authorization ||
        req.headers.cookie?.includes('atlas_session='))
    ) {
      const origin = req.headers.origin;
      if (origin !== frontendOrigin) {
        res.status(403).json({ message: 'Origen no permitido.' });
        return;
      }
    }
    next();
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: false, value: false },
    }),
  );
  app.enableCors({
    origin: frontendOrigin,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });
}
