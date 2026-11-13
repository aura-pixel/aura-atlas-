import type { Request } from 'express';
import { createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { hasEmailAccess } from '../email-verification-policy';
export function cookieToken(
  req: Pick<Request, 'headers'> | undefined,
): string | null {
  const raw = req?.headers?.cookie
    ?.split(';')
    .map((x: string) => x.trim())
    .find((x: string) => x.startsWith('atlas_session='));
  if (!raw) return null;
  try {
    return decodeURIComponent(raw.slice('atlas_session='.length));
  } catch {
    return null;
  }
}
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieToken,
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }
  async validate(payload: { sub?: unknown; jti?: unknown }) {
    if (typeof payload.sub !== 'string' || typeof payload.jti !== 'string')
      throw new UnauthorizedException();
    const session = await this.prisma.session.findUnique({
      where: { id: payload.jti },
      include: { user: true },
    });
    if (
      !session ||
      session.userId !== payload.sub ||
      session.expiresAt <= new Date() ||
      session.passwordHash !==
        createHash('sha256').update(session.user.password).digest('hex') ||
      !hasEmailAccess(session.user)
    )
      throw new UnauthorizedException();
    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
      emailVerified: session.user.emailVerified,
      emailVerificationDeadline: session.user.emailVerificationDeadline,
    };
  }
}
