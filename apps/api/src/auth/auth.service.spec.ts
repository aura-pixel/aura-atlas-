import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
describe('AuthService security', () => {
  it('lets an administrator log in without email verification, and rejects a wrong password', async () => {
    const user = {
      id: 'admin',
      role: 'SUPER_ADMIN',
      emailVerified: false,
      emailVerificationDeadline: new Date(0),
      password: await bcrypt.hash('admin-test-password', 4),
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        findUniqueOrThrow: jest.fn().mockResolvedValue(user),
      },
      session: {
        deleteMany: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'admin-session' }),
      },
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('admin-token') };
    const service = new AuthService(prisma as any, jwt as any, {} as any);
    await expect(
      service.login({
        email: 'admin@atlas.local',
        password: 'admin-test-password',
      }),
    ).resolves.toMatchObject({
      token: 'admin-token',
      user: { role: 'SUPER_ADMIN' },
    });
    prisma.session.create.mockClear();
    await expect(
      service.login({ email: 'admin@atlas.local', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.session.create).not.toHaveBeenCalled();
  });
  it('never issues a session for an unknown account', async () => {
    const prisma = {
      user: { findUnique: jest.fn().mockResolvedValue(null) },
      session: { create: jest.fn() },
    };
    const jwt = { signAsync: jest.fn() };
    const service = new AuthService(prisma as any, jwt as any, {} as any);
    await expect(
      service.login({ email: 'missing@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.session.create).not.toHaveBeenCalled();
    expect(jwt.signAsync).not.toHaveBeenCalled();
  });
  it('requires verification after the grace period even with the correct password', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'a',
          role: 'TEACHER',
          emailVerified: false,
          emailVerificationDeadline: new Date(0),
          password: await bcrypt.hash('correct-password', 4),
        }),
      },
      session: { create: jest.fn() },
    };
    const service = new AuthService(prisma as any, {} as any, {} as any);
    await expect(
      service.login({ email: 'a@example.com', password: 'correct-password' }),
    ).rejects.toThrow('Verifica tu correo');
    expect(prisma.session.create).not.toHaveBeenCalled();
  });
});
