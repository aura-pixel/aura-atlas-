process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/aura_security_regression?schema=public';
process.env.JWT_SECRET =
  'isolated-provisional-test-secret-at-least-32-characters';
process.env.FRONTEND_URL = 'http://localhost:3001';
process.env.NODE_ENV = 'test';
require('reflect-metadata');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { configureSecurity } = require('../dist/security/configure');
const { PrismaService } = require('../dist/prisma/prisma.service');
const { AuthService } = require('../dist/auth/auth.service');
const {
  UniversityRequestsService,
} = require('../dist/university-requests/university-requests.service');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');
(async () => {
  const app = await NestFactory.create(AppModule, { logger: ['error'] });
  configureSecurity(app);
  const db = app.get(PrismaService),
    service = app.get(UniversityRequestsService);
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl(),
    run = randomUUID(),
    password = 'Local-only-test-password-123!';
  let checks = 0;
  const users = [];
  async function req(method, path, token, data, status = 200) {
    const r = await fetch(base + path, {
      method,
      headers: {
        Origin: process.env.FRONTEND_URL,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const body = await r.json();
    assert.equal(
      r.status,
      status,
      `${method} ${path}: ${JSON.stringify(body)}`,
    );
    checks++;
    return body;
  }
  try {
    const hash = await bcrypt.hash(password, 4);
    for (const role of ['TEACHER', 'TEACHER', 'SUPER_ADMIN'])
      users.push(
        await db.user.create({
          data: {
            name: 'Fixture',
            email: `${users.length}-${run}@audit.invalid`,
            password: hash,
            role,
            emailVerified: true,
          },
        }),
      );
    const [a, b, admin] = users;
    const [ta, tb, at] = await Promise.all(
      users.map(
        async (u) =>
          (await app.get(AuthService).login({ email: u.email, password }))
            .token,
      ),
    );
    const data = {
      universityName: `University ${run}`,
      abbreviation: 'AUDIT',
      facultyName: 'Faculty of Medicine',
      careerName: 'Medical Education',
    };
    await req('POST', '/university-requests', null, data, 401);
    await req(
      'POST',
      '/university-requests',
      ta,
      { ...data, approvalStatus: 'APPROVED' },
      400,
    );
    await req(
      'POST',
      '/university-requests',
      ta,
      { ...data, universityName: '   ' },
      400,
    );
    const row = await req(
      'POST',
      '/university-requests',
      ta,
      { ...data, facultyName: '  Faculty   of Medicine  ' },
      201,
    );
    assert.equal(row.facultyName, 'Faculty of Medicine');
    assert.equal(row.status, 'PENDING');
    assert.equal(
      (await req('GET', '/users/me', ta)).careers[0].careerId,
      row.careerId,
    );
    assert(
      await db.userCareer.findUnique({
        where: { userId_careerId: { userId: a.id, careerId: row.careerId } },
      }),
    );
    for (const token of [undefined, tb]) {
      assert(
        !(await req('GET', '/universities', token)).some(
          (u) => u.id === row.universityId,
        ),
      );
      await req('GET', `/universities/${row.universityId}`, token, null, 404);
      assert(
        !(await req('GET', '/faculties', token)).some(
          (f) => f.id === row.facultyId,
        ),
      );
      await req('GET', `/faculties/${row.facultyId}`, token, null, 404);
      assert(
        !(await req('GET', '/careers', token)).some(
          (c) => c.id === row.careerId,
        ),
      );
      await req('GET', `/careers/${row.careerId}`, token, null, 404);
    }
    for (const token of [ta, at]) {
      assert(
        (await req('GET', '/universities', token)).some(
          (u) => u.id === row.universityId,
        ),
      );
      await req('GET', `/universities/${row.universityId}`, token);
      await req('GET', `/faculties/${row.facultyId}`, token);
      await req('GET', `/careers/${row.careerId}`, token);
    }
    await req('PATCH', '/users/me/career', tb, { careerId: row.careerId }, 404);
    await req('GET', `/university-requests/${row.id}`, tb, null, 404);
    await req(
      'PATCH',
      `/university-requests/${row.id}`,
      ta,
      { status: 'APPROVED' },
      403,
    );
    await req(
      'PATCH',
      `/university-requests/${row.id}/resubmit`,
      tb,
      data,
      404,
    );
    const subject = await req(
      'POST',
      '/subjects',
      ta,
      { name: 'Private subject', careerId: row.careerId },
      201,
    );
    const hyper = await db.hypertext.create({
      data: {
        userId: a.id,
        subjectId: subject.id,
        title: 'Private content',
        slug: `private-${run}`,
        isPublished: true,
        academicStructureConfirmed: true,
        units: {
          create: {
            number: 1,
            title: 'Unit',
            topics: {
              create: {
                number: '1.1',
                title: 'Topic',
                materials: {
                  create: {
                    name: 'File',
                    type: 'PDF',
                    mimeType: 'application/pdf',
                    url: 'fixture-private',
                  },
                },
              },
            },
          },
        },
      },
      include: {
        units: { include: { topics: { include: { materials: true } } } },
      },
    });
    await req('GET', `/hypertexts/public/${hyper.slug}`, null, null, 404);
    await req(
      'GET',
      `/materials/file/${hyper.units[0].topics[0].materials[0].id}`,
      null,
      null,
      404,
    );
    await req('POST', `/hypertexts/${hyper.id}/publish`, ta, {}, 400);
    await db.hypertext.update({
      where: { id: hyper.id },
      data: { isPublished: false },
    });
    await req(
      'PATCH',
      `/university-requests/${row.id}`,
      at,
      { status: 'REJECTED' },
      400,
    );
    await req('PATCH', `/university-requests/${row.id}`, at, {
      status: 'REJECTED',
      reviewNotes: 'Please check the official name.',
    });
    assert(
      (await req('GET', `/universities/${row.universityId}`, ta))
        .approvalStatus === 'REJECTED',
    );
    await req('GET', `/universities/${row.universityId}`, tb, null, 404);
    await req('GET', `/subjects/${subject.id}`, ta);
    await req('DELETE', `/university-requests/${row.id}`, at, null, 400);
    await req('PATCH', `/university-requests/${row.id}/resubmit`, ta, {
      ...data,
      universityName: `Corrected ${run}`,
    });
    assert.equal(
      (await db.hypertext.findUnique({ where: { id: hyper.id } })).subjectId,
      subject.id,
    );
    await req('PATCH', `/university-requests/${row.id}`, at, {
      status: 'APPROVED',
    });
    for (const token of [undefined, tb]) {
      await req('GET', `/universities/${row.universityId}`, token);
      assert(
        (await req('GET', '/careers', token)).some(
          (c) => c.id === row.careerId,
        ),
      );
    }
    await req('PATCH', '/users/me/career', tb, { careerId: row.careerId });
    assert.equal(
      (await db.hypertext.findUnique({ where: { id: hyper.id } })).isPublished,
      false,
    );
    await req(
      'PATCH',
      `/university-requests/${row.id}/resubmit`,
      ta,
      data,
      409,
    );
    await req(
      'POST',
      '/university-requests',
      tb,
      { ...data, universityName: `Corrected ${run}` },
      409,
    );
    const pending = await service.create(b.id, {
      ...data,
      universityName: `Pending ${run}`,
    });
    const duplicate = await service.create(a.id, {
      ...data,
      universityName: `Pending ${run}`,
    });
    await req('PATCH', `/university-requests/${pending.id}`, at, {
      status: 'APPROVED',
    });
    await req(
      'PATCH',
      `/university-requests/${duplicate.id}`,
      at,
      { status: 'APPROVED' },
      409,
    );
    assert.equal(
      (
        await db.university.findUnique({
          where: { id: duplicate.universityId },
        })
      ).approvalStatus,
      'PENDING',
    );
    console.log(
      `PASS ${checks} provisional university API scenarios: isolation, creation, rejection, corrections, approval, publication and duplicates`,
    );
  } finally {
    await db.university.deleteMany({
      where: { createdById: { in: users.map((u) => u.id) } },
    });
    await db.user.deleteMany({ where: { id: { in: users.map((u) => u.id) } } });
    await app.close();
    await db.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
