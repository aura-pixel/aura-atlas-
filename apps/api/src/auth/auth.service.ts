import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { privateUser } from '../security/access';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { EmailService } from './email.service';
import { hasEmailAccess } from './email-verification-policy';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: EmailService,
  ) {}
  async register(dto: RegisterDto) {
    const result = {
      message:
        'Si el correo puede registrarse, recibirás instrucciones de verificación.',
      verificationRequired: true,
      verificationGraceDays: 5,
    };
    const email = dto.email.trim().toLowerCase();
    const password = await bcrypt.hash(dto.password, 12);
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) return result;
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email,
        password,
        teacherType: dto.teacherType,
      },
    });
    await this.issueVerification(user.id, user.email);
    return result;
  }
  async resend(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (user && !user.emailVerified)
      await this.issueVerification(user.id, user.email);
    return {
      message: 'Si la cuenta necesita verificación, recibirás un enlace.',
    };
  }
  private async issueVerification(userId: string, email: string) {
    const token = randomBytes(32).toString('hex');
    const hash = createHash('sha256').update(token).digest('hex');
    await this.prisma.$transaction([
      this.prisma.emailToken.deleteMany({ where: { userId } }),
      this.prisma.emailToken.create({
        data: { hash, userId, expiresAt: new Date(Date.now() + 3600000) },
      }),
    ]);
    try {
      await this.mail.sendVerification(email, token);
    } catch {
      new Logger('EmailVerification').error(
        'No se pudo entregar un correo de verificación. Revisa el proveedor SMTP.',
      );
    }
  }
  async verify(token: string) {
    const hash = createHash('sha256').update(token).digest('hex');
    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT hash FROM "EmailToken" WHERE hash = ${hash} FOR UPDATE`;
      const entry = await tx.emailToken.findUnique({ where: { hash } });
      if (!entry || entry.expiresAt <= new Date())
        throw new UnauthorizedException('El enlace no es válido o ya venció.');
      await tx.emailToken.delete({ where: { hash } });
      await tx.user.update({
        where: { id: entry.userId },
        data: { emailVerified: true },
      });
    });
    return { message: 'Correo verificado. Ya puedes iniciar sesión.' };
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });
    const hash =
      user?.password ||
      '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW';
    const valid = await bcrypt.compare(dto.password, hash);
    if (!user || !valid)
      throw new UnauthorizedException('Credenciales inválidas.');
    if (!hasEmailAccess(user))
      throw new ForbiddenException(
        'Verifica tu correo para continuar. El plazo de cinco días ha terminado.',
      );
    await this.prisma.session.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    });
    const expiresAt = new Date(Date.now() + 8 * 3600000);
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        passwordHash: createHash('sha256').update(user.password).digest('hex'),
        expiresAt,
      },
    });
    const token = await this.jwt.signAsync(
      { sub: user.id, jti: session.id },
      { expiresIn: '8h' },
    );
    const profile = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: privateUser,
    });
    return { token, user: profile, expiresAt };
  }
  async logout(sessionId: string) {
    await this.prisma.session.deleteMany({ where: { id: sessionId } });
    return { message: 'Sesión cerrada.' };
  }
}
