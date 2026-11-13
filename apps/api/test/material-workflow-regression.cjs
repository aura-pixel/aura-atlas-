// Build first. Isolated local database and in-memory object storage only.
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/aura_security_regression?schema=public';
process.env.JWT_SECRET = 'local-material-workflow-regression-secret';
process.env.FRONTEND_URL = 'http://localhost:3001';
process.env.NODE_ENV = 'test';
require('reflect-metadata');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const bcrypt = require('bcrypt');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { configureSecurity } = require('../dist/security/configure');
const { PrismaService } = require('../dist/prisma/prisma.service');
const { R2Service } = require('../dist/storage/r2.service');
const {
  ContentMatcher,
} = require('../dist/academic-structure/classifiers/content-matcher');

(async () => {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  configureSecurity(app);
  const db = app.get(PrismaService);
  const r2 = app.get(R2Service),
    objects = new Map();
  r2.uploadFile = async (key, data) => objects.set(key, data);
  r2.deleteFile = async (key) => objects.delete(key);
  let university;
  const users = [],
    password = randomUUID();
  try {
    const hash = await bcrypt.hash(password, 4);
    for (let i = 0; i < 2; i++)
      users.push(
        await db.user.create({
          data: {
            email: `${randomUUID()}@audit.invalid`,
            name: 'Local workflow',
            password: hash,
            emailVerified: true,
          },
        }),
      );
    university = await db.university.create({
      data: { name: 'Material workflow regression', abbreviation: 'TEST' },
    });
    const faculty = await db.faculty.create({
      data: { name: 'Faculty', universityId: university.id },
    });
    const career = await db.career.create({
      data: { name: 'Career', facultyId: faculty.id },
    });
    await db.userCareer.createMany({
      data: users.map((u) => ({ userId: u.id, careerId: career.id })),
    });
    await app.listen(0, '127.0.0.1');
    const base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
    async function login(user) {
      const response = await fetch(`${base}/auth/login`, {
        method: 'POST',
        headers: {
          Origin: process.env.FRONTEND_URL,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email, password }),
      });
      assert.equal(response.status, 201);
      return response.headers
        .getSetCookie()
        .map((c) => c.split(';')[0])
        .join('; ');
    }
    const owner = await login(users[0]),
      other = await login(users[1]);
    async function request(path, method = 'GET', data, cookie = owner) {
      const form = data instanceof FormData;
      const response = await fetch(base + path, {
        method,
        headers: {
          Origin: process.env.FRONTEND_URL,
          Cookie: cookie,
          ...(!form ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(data === undefined
          ? {}
          : { body: form ? data : JSON.stringify(data) }),
      });
      return { status: response.status, data: await response.json() };
    }
    async function subject(count) {
      const row = await db.subject.create({
        data: { name: `Program ${count}`, careerId: career.id },
      });
      const structure = {
        subjectObjective: 'Keep objectives',
        units: [
          {
            number: 1,
            title: 'Learning',
            objective: 'Keep unit objective',
            topics: Array.from({ length: count }, (_, i) => ({
              number: `1.${i + 1}`,
              title: `Topic ${i + 1}`,
              subtopics: [],
            })),
          },
        ],
      };
      assert.equal(
        (
          await request(`/subjects/${row.id}/academic-structure`, 'PATCH', {
            structure,
          })
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            `/subjects/${row.id}/academic-structure/confirm`,
            'PATCH',
            {},
          )
        ).status,
        200,
      );
      return row;
    }
    const png = fs.readFileSync('../web/public/aura-atlas.png');
    async function upload(id, name) {
      const body = new FormData();
      body.append('files', new Blob([png], { type: 'image/png' }), name);
      return request(`/materials/upload/${id}`, 'POST', body);
    }
    const fifty = await subject(50);
    let firstId;
    for (let i = 1; i <= 50; i++) {
      const uploaded = await upload(fifty.id, `1.${i} Topic ${i}.png`);
      assert.equal(uploaded.status, 201, JSON.stringify(uploaded.data));
      const file = uploaded.data.files[0];
      const payload = {
        files: [
          {
            uploadId: file.uploadId,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
            topicNumber: `1.${i}`,
            type: 'IMAGE',
          },
        ],
      };
      if (i === 2) {
        assert.equal(
          (
            await request(`/materials/save/${fifty.id}`, 'POST', {
              files: [{ ...payload.files[0], topicNumber: '1.1' }],
            })
          ).status,
          400,
        );
        assert.equal(
          (await request(`/materials/save/${fifty.id}`, 'POST', payload, other))
            .status,
          404,
        );
      }
      const saved = await request(
        `/materials/save/${fifty.id}`,
        'POST',
        payload,
      );
      assert.equal(saved.status, 201, JSON.stringify(saved.data));
      if (i === 1) {
        firstId = saved.data.materials[0].id;
        assert.equal(
          (await request(`/materials/save/${fifty.id}`, 'POST', payload)).data
            .materials[0].id,
          firstId,
        );
      }
    }
    assert.equal((await upload(fifty.id, 'extra.png')).status, 400);
    const workspace = await request(`/materials/workspace/${fifty.id}`);
    assert.equal(workspace.data.limits.maxFiles, 50);
    assert.equal(workspace.data.resources.length, 50);
    assert.ok(
      workspace.data.resources.every((r) => !('key' in r) && !('userId' in r)),
    );
    assert.equal(
      (
        await request(
          `/materials/workspace/${fifty.id}`,
          'GET',
          undefined,
          other,
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await request(`/materials/${firstId}/topic`, 'PATCH', {
          topicNumber: '1.2',
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await request(
          `/materials/${firstId}/topic`,
          'PATCH',
          { topicNumber: '1.1' },
          other,
        )
      ).status,
      404,
    );
    for (const type of ['VIDEO', 'LINK']) {
      const payload = {
        files: [
          {
            name: type,
            type,
            mimeType: type === 'VIDEO' ? 'video/external' : 'text/uri-list',
            size: 0,
            url: 'https://example.org',
            topicNumber: '1.1',
          },
        ],
      };
      const saved = await request(
        `/materials/save/${fifty.id}`,
        'POST',
        payload,
      );
      assert.equal(saved.status, 201);
      assert.equal(
        (await request(`/materials/save/${fifty.id}`, 'POST', payload)).data
          .materials[0].id,
        saved.data.materials[0].id,
      );
    }
    const twentySix = await subject(26);
    let pendingId;
    for (let i = 0; i < 26; i++) {
      const result = await upload(twentySix.id, `pending-${i}.png`);
      assert.equal(result.status, 201);
      pendingId = result.data.files[0].uploadId;
    }
    assert.equal((await upload(twentySix.id, 'extra.png')).status, 400);
    assert.equal(
      (
        await request(
          `/materials/pending/${pendingId}`,
          'DELETE',
          undefined,
          other,
        )
      ).status,
      404,
    );
    assert.equal(
      (await request(`/materials/pending/${pendingId}`, 'DELETE')).status,
      200,
    );
    assert.equal((await upload(twentySix.id, 'replacement.png')).status, 201);
    const restored = await request(`/materials/workspace/${twentySix.id}`);
    assert.equal(restored.data.limits.maxFiles, 26);
    assert.equal(
      restored.data.resources.filter((r) => r.status === 'PENDING').length,
      26,
    );
    assert.equal(
      await db.material.count({
        where: {
          topic: {
            unit: { hypertext: { subjectId: fifty.id, userId: users[0].id } },
          },
        },
      }),
      52,
    );
    const matcher = new ContentMatcher();
    const topics = [
      {
        number: '1.1',
        title: 'Fundamentos del aprendizaje',
        subtopics: [{ number: '1.1.1', title: 'Aprendizaje significativo' }],
      },
      { number: '1.2', title: 'Evaluación educativa' },
    ];
    assert.equal(
      matcher.match('1.1 Fundamentos del aprendizaje.png', '', topics)
        .confidence,
      'HIGH',
    );
    assert.equal(
      matcher.match('1.1.1 Aprendizaje significativo.pdf', '', topics)
        .suggestedTopic.number,
      '1.1',
    );
    assert.notEqual(
      matcher.match('documento.png', '', topics).confidence,
      'HIGH',
    );
    console.log(
      'PASS: 50/26-file quotas, one file per topic, pending recovery/removal, unlimited separate video/link slots, idempotent retries, ownership boundaries and conservative topic/subtopic matching',
    );
  } finally {
    if (university)
      await db.university.delete({ where: { id: university.id } });
    await db.pendingUpload.deleteMany({
      where: { userId: { in: users.map((u) => u.id) } },
    });
    await db.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await app.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
