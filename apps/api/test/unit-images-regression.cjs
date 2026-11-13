// Build first. Uses only the isolated local database and in-memory storage.
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/aura_security_regression?schema=public';
process.env.JWT_SECRET = 'isolated-unit-images-regression-secret';
process.env.FRONTEND_URL = 'http://localhost:3001';
process.env.NODE_ENV = 'test';
require('reflect-metadata');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { Readable } = require('node:stream');
const fs = require('node:fs');
const bcrypt = require('bcrypt');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { configureSecurity } = require('../dist/security/configure');
const { PrismaService } = require('../dist/prisma/prisma.service');
const { R2Service } = require('../dist/storage/r2.service');

(async () => {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  configureSecurity(app);
  const db = app.get(PrismaService),
    storage = app.get(R2Service),
    objects = new Map();
  storage.uploadFile = async (key, buffer, type) =>
    objects.set(key, { buffer, type });
  storage.deleteFile = async (key) => objects.delete(key);
  storage.getFile = async (key) => ({
    Body: Readable.from([objects.get(key).buffer]),
  });
  const users = [],
    password = randomUUID();
  let university;
  try {
    const hash = await bcrypt.hash(password, 4);
    for (let i = 0; i < 2; i++)
      users.push(
        await db.user.create({
          data: {
            name: 'Local image test',
            email: `${randomUUID()}@audit.invalid`,
            password: hash,
            emailVerified: true,
          },
        }),
      );
    university = await db.university.create({
      data: { name: 'Local unit images regression', abbreviation: 'TEST' },
    });
    const faculty = await db.faculty.create({
      data: { name: 'Faculty', universityId: university.id },
    });
    const career = await db.career.create({
      data: { name: 'Career', facultyId: faculty.id },
    });
    const subject = await db.subject.create({
      data: { name: 'Subject', careerId: career.id },
    });
    const hyper = await db.hypertext.create({
      data: {
        title: 'Local image fixture',
        userId: users[0].id,
        subjectId: subject.id,
      },
    });
    const unit = await db.unit.create({
      data: { title: 'Unit', number: 1, hypertextId: hyper.id },
    });
    const hidden = await db.unit.create({
      data: { title: 'Empty unit', number: 2, hypertextId: hyper.id },
    });
    const topic = await db.topic.create({
      data: { title: 'Topic', number: '1.1', unitId: unit.id },
    });
    await db.material.create({
      data: {
        name: 'Link',
        type: 'LINK',
        url: 'https://example.org',
        topicId: topic.id,
      },
    });
    await app.listen(0, '127.0.0.1');
    const base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    async function login(user) {
      const result = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: {
          Origin: process.env.FRONTEND_URL,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email, password }),
      });
      assert.equal(result.status, 201);
      return result.headers
        .getSetCookie()
        .map((c) => c.split(';')[0])
        .join('; ');
    }
    const owner = await login(users[0]),
      other = await login(users[1]);
    const png = fs.readFileSync('../web/public/aura-atlas.png');
    async function upload(
      id,
      buffer = png,
      mime = 'image/png',
      cookie = owner,
    ) {
      const form = new FormData();
      form.append('image', new Blob([buffer], { type: mime }), 'unit.png');
      return fetch(`${base}/hypertexts/${hyper.id}/units/${id}/image`, {
        method: 'POST',
        headers: { Origin: process.env.FRONTEND_URL, Cookie: cookie },
        body: form,
      });
    }
    const url = `${base}/hypertexts/unit-images/${unit.id}`;
    assert.equal((await upload(unit.id, png, 'image/png', other)).status, 404);
    assert.equal(
      (
        await upload(
          unit.id,
          Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
        )
      ).status,
      400,
    );
    assert.equal(
      (await upload(unit.id, Buffer.alloc(2 * 1024 * 1024 + 1))).status,
      413,
    );
    assert.equal((await upload(unit.id)).status, 201);
    assert.equal(objects.size, 1);
    const streamed = await fetch(url, { headers: { Cookie: owner } });
    assert.equal(streamed.status, 200);
    assert.equal(streamed.headers.get('Content-Type'), 'image/webp');
    assert.ok((await streamed.arrayBuffer()).byteLength > 0);
    assert.equal((await fetch(url)).status, 404);
    assert.equal(
      (await fetch(url, { headers: { Cookie: other } })).status,
      404,
    );
    assert.equal((await upload(unit.id)).status, 201);
    assert.equal(objects.size, 1);
    const select = await fetch(
      `${base}/hypertexts/${hyper.id}/units/${unit.id}/image`,
      {
        method: 'PATCH',
        headers: {
          Origin: process.env.FRONTEND_URL,
          Cookie: owner,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: '/hypertext/covers/minimal-sage.svg',
        }),
      },
    );
    assert.equal(select.status, 200);
    assert.equal(objects.size, 0);
    const forged = await fetch(
      `${base}/hypertexts/${hyper.id}/units/${unit.id}/image`,
      {
        method: 'PATCH',
        headers: {
          Origin: process.env.FRONTEND_URL,
          Cookie: owner,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: `users/${users[1].id}/unit-images/forged.webp`,
        }),
      },
    );
    assert.equal(forged.status, 400);
    assert.equal((await upload(unit.id)).status, 201);
    assert.equal((await upload(hidden.id)).status, 201);
    await db.hypertext.update({
      where: { id: hyper.id },
      data: { isPublished: true },
    });
    assert.equal((await fetch(url)).status, 200);
    assert.equal(
      (await fetch(`${base}/hypertexts/unit-images/${hidden.id}`)).status,
      404,
    );
    await db.faculty.update({
      where: { id: faculty.id },
      data: { approvalStatus: 'PENDING' },
    });
    assert.equal((await fetch(url)).status, 404);
    assert.equal(
      (await fetch(url, { headers: { Cookie: owner } })).status,
      200,
    );
    console.log(
      'PASS: optimized WebP upload, size/content validation, ownership, private/public visibility, hidden units/institution approval, replacement cleanup and catalog selection',
    );
  } finally {
    if (university)
      await db.university.delete({ where: { id: university.id } });
    await db.user.deleteMany({
      where: { id: { in: users.map((user) => user.id) } },
    });
    await app.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
