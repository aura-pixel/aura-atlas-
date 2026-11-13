// This suite always uses the isolated local database, including its fixtures.
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/aura_security_regression?schema=public';
process.env.JWT_SECRET = 'isolated-faculty-test-secret-at-least-32-characters';
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
  const db = app.get(PrismaService);
  const requests = app.get(UniversityRequestsService);
  await app.listen(0, '127.0.0.1');
  const base = await app.getUrl();
  const run = randomUUID();
  const users = [];
  const universities = [];
  let checks = 0;

  async function request(method, path, token, data, status = 200) {
    const response = await fetch(base + path, {
      method,
      headers: {
        Origin: process.env.FRONTEND_URL,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const body = await response.json();
    assert.equal(
      response.status,
      status,
      `${method} ${path}: ${JSON.stringify(body)}`,
    );
    checks++;
    return body;
  }

  try {
    const password = 'Local-only-test-password-123!';
    const hash = await bcrypt.hash(password, 4);
    for (const role of ['TEACHER', 'TEACHER', 'SUPER_ADMIN']) {
      users.push(
        await db.user.create({
          data: {
            name: 'Faculty test',
            email: `${users.length}-${run}@audit.invalid`,
            password: hash,
            role,
            emailVerified: true,
          },
        }),
      );
    }
    const [owner, other] = users;
    const [ownerToken, otherToken, adminToken] = await Promise.all(
      users.map(
        async (user) =>
          (await app.get(AuthService).login({ email: user.email, password }))
            .token,
      ),
    );
    for (const name of ['Existing university', 'Another university']) {
      universities.push(
        await db.university.create({
          data: { name: `${name} ${run}`, abbreviation: 'TEST' },
        }),
      );
    }
    const university = universities[0];
    const data = {
      universityId: university.id,
      facultyName: 'Faculty of Medicine',
      careerName: 'Medical Education',
    };
    await request('POST', '/university-requests/faculties', null, data, 401);
    await request(
      'POST',
      '/university-requests/faculties',
      ownerToken,
      { ...data, approvalStatus: 'APPROVED' },
      400,
    );
    await request(
      'POST',
      '/university-requests/faculties',
      ownerToken,
      { ...data, facultyName: '   ' },
      400,
    );
    const row = await request(
      'POST',
      '/university-requests/faculties',
      ownerToken,
      { ...data, facultyName: '  Faculty   of Medicine  ' },
      201,
    );
    assert.equal(row.kind, 'FACULTY');
    assert.equal(row.facultyName, data.facultyName);
    assert.equal(row.universityId, university.id);
    assert.equal(
      (await db.university.findUnique({ where: { id: university.id } }))
        .approvalStatus,
      'APPROVED',
    );
    assert.equal(
      (await request('GET', '/users/me', ownerToken)).careers[0].careerId,
      row.careerId,
    );

    for (const token of [undefined, otherToken]) {
      const catalogUniversity = await request(
        'GET',
        `/universities/${university.id}`,
        token,
      );
      assert(
        !catalogUniversity.faculties.some(
          (faculty) => faculty.id === row.facultyId,
        ),
      );
      assert(
        !(await request('GET', '/faculties', token)).some(
          (faculty) => faculty.id === row.facultyId,
        ),
      );
      await request('GET', `/faculties/${row.facultyId}`, token, null, 404);
      assert(
        !(await request('GET', '/careers', token)).some(
          (career) => career.id === row.careerId,
        ),
      );
      await request('GET', `/careers/${row.careerId}`, token, null, 404);
    }
    for (const token of [ownerToken, adminToken]) {
      const catalogUniversity = await request(
        'GET',
        `/universities/${university.id}`,
        token,
      );
      assert(
        catalogUniversity.faculties.some(
          (faculty) => faculty.id === row.facultyId,
        ),
      );
      await request('GET', `/faculties/${row.facultyId}`, token);
      await request('GET', `/careers/${row.careerId}`, token);
    }
    await request(
      'PATCH',
      '/users/me/career',
      otherToken,
      { careerId: row.careerId },
      404,
    );
    await request(
      'PATCH',
      `/university-requests/${row.id}`,
      ownerToken,
      { status: 'APPROVED' },
      403,
    );
    await request(
      'PATCH',
      `/university-requests/${row.id}/resubmit-faculty`,
      otherToken,
      data,
      400,
    );
    await request(
      'PATCH',
      `/university-requests/${row.id}/resubmit-faculty`,
      otherToken,
      { facultyName: data.facultyName, careerName: data.careerName },
      404,
    );
    await request(
      'PATCH',
      `/university-requests/${row.id}/resubmit`,
      ownerToken,
      {
        universityName: 'Do not rename the university',
        facultyName: data.facultyName,
        careerName: data.careerName,
      },
      404,
    );
    await request(
      'POST',
      '/university-requests/faculties',
      ownerToken,
      data,
      409,
    );

    const subject = await request(
      'POST',
      '/subjects',
      ownerToken,
      { name: 'Private faculty subject', careerId: row.careerId },
      201,
    );
    const hypertext = await db.hypertext.create({
      data: {
        userId: owner.id,
        subjectId: subject.id,
        title: 'Private faculty content',
        slug: `faculty-${run}`,
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
                    url: 'local-fixture-file',
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
    await request(
      'GET',
      `/hypertexts/public/${hypertext.slug}`,
      null,
      null,
      404,
    );
    await request(
      'GET',
      `/materials/file/${hypertext.units[0].topics[0].materials[0].id}`,
      null,
      null,
      404,
    );
    assert.equal(
      (await request('GET', `/hypertexts/${hypertext.id}`, ownerToken))
        .publicUrl,
      null,
    );
    await request(
      'POST',
      `/hypertexts/${hypertext.id}/publish`,
      ownerToken,
      {},
      400,
    );
    await db.hypertext.update({
      where: { id: hypertext.id },
      data: { isPublished: false },
    });

    await request('PATCH', `/university-requests/${row.id}`, adminToken, {
      status: 'REJECTED',
      reviewNotes: 'Check the official faculty name.',
    });
    await request('GET', `/faculties/${row.facultyId}`, otherToken, null, 404);
    await request('GET', `/subjects/${subject.id}`, ownerToken);
    assert.equal(
      (await db.university.findUnique({ where: { id: university.id } }))
        .approvalStatus,
      'APPROVED',
    );
    const corrected = {
      facultyName: 'Faculty of Medical Sciences',
      careerName: data.careerName,
    };
    await request(
      'PATCH',
      `/university-requests/${row.id}/resubmit-faculty`,
      ownerToken,
      corrected,
    );
    assert.equal(
      (await db.hypertext.findUnique({ where: { id: hypertext.id } }))
        .subjectId,
      subject.id,
    );
    await request('PATCH', `/university-requests/${row.id}`, adminToken, {
      status: 'APPROVED',
    });
    for (const token of [undefined, otherToken]) {
      const catalogUniversity = await request(
        'GET',
        `/universities/${university.id}`,
        token,
      );
      assert(
        catalogUniversity.faculties.some(
          (faculty) => faculty.id === row.facultyId,
        ),
      );
      await request('GET', `/faculties/${row.facultyId}`, token);
      await request('GET', `/careers/${row.careerId}`, token);
    }
    await request('PATCH', '/users/me/career', otherToken, {
      careerId: row.careerId,
    });
    await request(
      'PATCH',
      `/university-requests/${row.id}/resubmit-faculty`,
      ownerToken,
      corrected,
      409,
    );
    assert.equal(
      (await db.hypertext.findUnique({ where: { id: hypertext.id } }))
        .isPublished,
      false,
    );
    assert.equal(
      (await db.university.findUnique({ where: { id: university.id } })).name,
      university.name,
    );

    const first = await requests.createFaculty(owner.id, {
      ...data,
      facultyName: 'Duplicate faculty',
    });
    const second = await requests.createFaculty(other.id, {
      ...data,
      facultyName: 'Duplicate faculty',
    });
    await request('PATCH', `/university-requests/${first.id}`, adminToken, {
      status: 'APPROVED',
    });
    await request(
      'PATCH',
      `/university-requests/${second.id}`,
      adminToken,
      { status: 'APPROVED' },
      409,
    );
    await requests.createFaculty(other.id, {
      ...data,
      universityId: universities[1].id,
      facultyName: corrected.facultyName,
    });

    const privateUniversity = await requests.create(owner.id, {
      universityName: `Private university ${run}`,
      facultyName: 'Original faculty',
      careerName: 'Original career',
    });
    await assert.rejects(
      requests.createFaculty(other.id, {
        ...data,
        universityId: privateUniversity.universityId,
      }),
    );
    const privateFaculty = await requests.createFaculty(owner.id, {
      ...data,
      universityId: privateUniversity.universityId,
    });
    await request(
      'PATCH',
      `/university-requests/${privateFaculty.id}`,
      adminToken,
      { status: 'APPROVED' },
    );
    await request(
      'GET',
      `/faculties/${privateFaculty.facultyId}`,
      otherToken,
      null,
      404,
    );
    await request(
      'PATCH',
      `/university-requests/${privateUniversity.id}`,
      adminToken,
      { status: 'APPROVED' },
    );
    await request('GET', `/faculties/${privateFaculty.facultyId}`, otherToken);
    console.log(`PASS ${checks} provisional faculty API scenarios`);
  } finally {
    await db.university.deleteMany({
      where: {
        OR: [
          { id: { in: universities.map((university) => university.id) } },
          { createdById: { in: users.map((user) => user.id) } },
        ],
      },
    });
    await db.user.deleteMany({
      where: { id: { in: users.map((user) => user.id) } },
    });
    await app.close();
    await db.$disconnect();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
