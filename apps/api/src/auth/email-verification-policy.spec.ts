import { hasEmailAccess } from './email-verification-policy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { createHash } from 'crypto';
import * as bcrypt from 'bcrypt';

describe('Five-day email verification period', () => {
  const now = new Date('2026-11-12T12:00:00Z');
  it('allows administrators without a verified mailbox after the deadline', () => {
    expect(
      hasEmailAccess(
        {
          role: 'SUPER_ADMIN',
          emailVerified: false,
          emailVerificationDeadline: new Date(0),
        },
        now,
      ),
    ).toBe(true);
    expect(
      hasEmailAccess(
        {
          role: 'TEACHER',
          emailVerified: false,
          emailVerificationDeadline: new Date(0),
        },
        now,
      ),
    ).toBe(false);
  });
  it('allows an unverified account before its fixed deadline', () => {
    expect(
      hasEmailAccess(
        {
          emailVerified: false,
          emailVerificationDeadline: new Date(now.getTime() + 1),
        },
        now,
      ),
    ).toBe(true);
  });
  it.each([0, -1])(
    'denies an unverified account at or after its deadline (%s ms)',
    (delta) => {
      expect(
        hasEmailAccess(
          {
            emailVerified: false,
            emailVerificationDeadline: new Date(now.getTime() + delta),
          },
          now,
        ),
      ).toBe(false);
    },
  );
  it('keeps a verified account accessible after the deadline', () => {
    expect(
      hasEmailAccess(
        { emailVerified: true, emailVerificationDeadline: new Date(0) },
        now,
      ),
    ).toBe(true);
  });
  it('lets a new unverified teacher log in without extending the deadline', async () => {
    const deadline = new Date(Date.now() + 5 * 86400000);
    const user = {
      id: 'teacher',
      role: 'TEACHER',
      emailVerified: false,
      emailVerificationDeadline: deadline,
      password: await bcrypt.hash('correct-password', 4),
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user),
        findUniqueOrThrow: jest.fn().mockResolvedValue(user),
        update: jest.fn(),
      },
      session: {
        deleteMany: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 'session' }),
      },
    };
    const jwt = { signAsync: jest.fn().mockResolvedValue('token') };
    const result = await new AuthService(
      prisma as any,
      jwt as any,
      {} as any,
    ).login({ email: 'teacher@example.com', password: 'correct-password' });
    expect(result.token).toBe('token');
    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(result.user.emailVerificationDeadline).toBe(deadline);
  });
  it('blocks an already-open session when its deadline passes, and accepts it after verification', async () => {
    const user = {
      id: 'teacher',
      name: 'Teacher',
      email: 'teacher@example.com',
      role: 'TEACHER',
      emailVerified: false,
      emailVerificationDeadline: new Date(Date.now() + 60000),
      password: 'password-hash',
    };
    const session = {
      userId: user.id,
      id: 'session',
      expiresAt: new Date(Date.now() + 3600000),
      passwordHash: createHash('sha256').update(user.password).digest('hex'),
      user,
    };
    const strategy = new JwtStrategy(
      { getOrThrow: () => 'unit-test-secret' } as any,
      { session: { findUnique: jest.fn().mockResolvedValue(session) } } as any,
    );
    await expect(
      strategy.validate({ sub: user.id, jti: session.id }),
    ).resolves.toMatchObject({ id: user.id, emailVerified: false });
    user.emailVerificationDeadline = new Date(0);
    await expect(
      strategy.validate({ sub: user.id, jti: session.id }),
    ).rejects.toThrow();
    user.emailVerified = true;
    await expect(
      strategy.validate({ sub: user.id, jti: session.id }),
    ).resolves.toMatchObject({ emailVerified: true });
  });
});
