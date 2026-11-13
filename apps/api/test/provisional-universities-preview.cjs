process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/aura_security_regression?schema=public';
process.env.JWT_SECRET = 'isolated-provisional-preview-at-least-32-characters';
process.env.FRONTEND_URL = 'http://localhost:3001';
process.env.NODE_ENV = 'test';
require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { configureSecurity } = require('../dist/security/configure');
const { PrismaService } = require('../dist/prisma/prisma.service');
const bcrypt = require('bcrypt'),
  fs = require('node:fs'),
  { randomUUID } = require('node:crypto');
(async () => {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  configureSecurity(app);
  const db = app.get(PrismaService),
    run = randomUUID(),
    password = randomUUID() + 'Local!',
    users = [];
  const hash = await bcrypt.hash(password, 4);
  for (const role of ['TEACHER', 'SUPER_ADMIN'])
    users.push(
      await db.user.create({
        data: {
          name:
            role === 'TEACHER'
              ? 'Docente de prueba'
              : 'Administrador de prueba',
          email: `${role.toLowerCase()}-${run}@audit.invalid`,
          password: hash,
          role,
          emailVerified: true,
        },
      }),
    );
  const university = await db.university.create({
    data: { name: 'Universidad del Conocimiento', abbreviation: 'UDC' },
  });
  const faculty = await db.faculty.create({
    data: { name: 'Facultad de Ciencias', universityId: university.id },
  });
  await db.career.create({
    data: {
      name: 'Licenciatura en Ciencias de la Educacion',
      facultyId: faculty.id,
    },
  });
  fs.writeFileSync(
    '.temp/provisional-browser-fixture.json',
    JSON.stringify({
      teacher: users[0].email,
      admin: users[1].email,
      password,
    }),
  );
  await app.listen(3000, '127.0.0.1');
  console.log('Local provisional university browser fixtures ready');
  let stopping = false;
  async function stop() {
    if (stopping) return;
    stopping = true;
    await db.university.deleteMany({
      where: {
        OR: [
          { id: university.id },
          { createdById: { in: users.map((u) => u.id) } },
        ],
      },
    });
    await db.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await app.close();
    await db.$disconnect();
    process.exit(0);
  }
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    if (data.includes('stop')) void stop();
  });
  process.stdin.resume();
  process.on('SIGINT', () => void stop());
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
