process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/aura_security_regression?schema=public';
process.env.JWT_SECRET =
  'isolated-email-grace-test-secret-at-least-32-characters';
process.env.FRONTEND_URL = 'http://localhost:3001';
process.env.NODE_ENV = 'test';
require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { configureSecurity } = require('../dist/security/configure');
const { PrismaService } = require('../dist/prisma/prisma.service');
const { EmailService } = require('../dist/auth/email.service');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
(async () => {
  const app = await NestFactory.create(AppModule, { logger: false });
  configureSecurity(app);
  const db = app.get(PrismaService);
  const mail = [];
  app.get(EmailService).sendVerification = async (email, token) =>
    mail.push({ email, token });
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const email = `grace-${randomUUID()}@audit.invalid`,
    password = 'Local-only-password-123!';
  async function req(path, data, cookie) {
    const res = await fetch(base + path, {
      method: data ? 'POST' : 'GET',
      headers: {
        Origin: process.env.FRONTEND_URL,
        ...(data ? { 'Content-Type': 'application/json' } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const body = await res.json();
    return { res, body };
  }
  try {
    let r = await req('/auth/register', {
      name: 'Grace test',
      email,
      password,
    });
    assert.equal(r.res.status, 201);
    assert.equal(r.body.verificationGraceDays, 5);
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    assert(
      Math.abs(user.emailVerificationDeadline - user.createdAt - 5 * 86400000) <
        5000,
    );
    console.log('PASS registration stores five-day deadline and issues link');
    r = await req('/auth/login', { email, password });
    assert.equal(r.res.status, 201);
    const cookie = r.res.headers.get('set-cookie').split(';')[0];
    assert.equal((await req('/auth/me', null, cookie)).res.status, 200);
    assert.equal((await req('/users/me', null, cookie)).res.status, 200);
    console.log('PASS unverified login, session and profile during grace');
    await req('/auth/login', { email, password });
    assert.equal(
      (
        await db.user.findUniqueOrThrow({ where: { email } })
      ).emailVerificationDeadline.getTime(),
      user.emailVerificationDeadline.getTime(),
    );
    console.log('PASS login never extends deadline');
    await db.user.update({
      where: { email },
      data: { emailVerificationDeadline: new Date(0) },
    });
    assert.equal(
      (await req('/auth/login', { email, password })).res.status,
      403,
    );
    assert.equal((await req('/auth/me', null, cookie)).res.status, 401);
    assert.equal((await req('/users/me', null, cookie)).res.status, 401);
    console.log('PASS expired deadline blocks login and existing sessions');
    r = await req('/auth/verify-email', { token: mail[0].token });
    assert.equal(r.res.status, 201);
    assert.equal(
      (await req('/auth/verify-email', { token: mail[0].token })).res.status,
      401,
    );
    assert.equal(
      (await req('/auth/login', { email, password })).res.status,
      201,
    );
    assert.equal((await req('/auth/me', null, cookie)).res.status, 200);
    console.log(
      'PASS verification restores access and token replay is rejected',
    );
    const bad = await req('/auth/register', {
      name: 'Forged',
      email: `forged-${email}`,
      password,
      emailVerificationDeadline: '2099-01-01',
    });
    assert.equal(bad.res.status, 400);
    console.log('PASS client cannot supply its deadline');
  } finally {
    await db.user.deleteMany({ where: { email } });
    await app.close();
    await db.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
