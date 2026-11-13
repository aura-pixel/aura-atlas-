import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
@Injectable()
export class EmailService {
  async sendVerification(email: string, token: string) {
    const url = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${token}`;
    if (process.env.SMTP_URL && process.env.MAIL_FROM) {
      await createTransport(process.env.SMTP_URL).sendMail({
        from: process.env.MAIL_FROM,
        to: email,
        subject: 'Verifica tu correo en Aura Atlas',
        text: `Confirma tu correo: ${url}\nEl enlace vence en una hora.`,
      });
    } else if (process.env.NODE_ENV !== 'production') {
      await mkdir(join(process.cwd(), '.temp', 'mail'), { recursive: true });
      await writeFile(
        join(process.cwd(), '.temp', 'mail', `${token}.json`),
        JSON.stringify({ to: email, url }),
        { mode: 0o600 },
      );
    } else
      throw new ServiceUnavailableException(
        'El correo de verificación no está configurado.',
      );
  }
}
