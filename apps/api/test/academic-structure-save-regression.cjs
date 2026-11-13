// Build the API first. Always uses the isolated local regression database.
process.env.DATABASE_URL =
  'postgresql://postgres:postgres@localhost:5433/aura_security_regression?schema=public';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { randomUUID } = require('node:crypto');
const { PrismaClient } = require('@prisma/client');
const {
  persistAcademicStructure,
} = require('../dist/subjects/academic-structure.persistence');
const db = new PrismaClient();
const structure = process.argv[2]
  ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
  : {
      units: Array.from({ length: 5 }, (_, u) => ({
        number: u + 1,
        title: `Unidad ${u + 1}`,
        topics: Array.from({ length: 10 }, (_, t) => ({
          number: `${u + 1}.${t + 1}`,
          title: `Tema ${t + 1}`,
          subtopics:
            u === 0 && t === 0
              ? [
                  { number: '1.1.1', title: 'Primero' },
                  { number: '1.1.2', title: 'Segundo' },
                ]
              : [],
        })),
      })),
    };
const expectedTopics = structure.units.reduce((n, u) => n + u.topics.length, 0);
const expectedSubtopics = structure.units.reduce(
  (n, u) => n + u.topics.reduce((n, t) => n + (t.subtopics?.length ?? 0), 0),
  0,
);
let user, university;
(async () => {
  try {
    user = await db.user.create({
      data: {
        email: `program-${randomUUID()}@audit.invalid`,
        password: 'unused-local-fixture',
        name: 'Regression',
      },
    });
    university = await db.university.create({
      data: { name: 'Isolated program regression', abbreviation: 'TEST' },
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
        userId: user.id,
        subjectId: subject.id,
        title: 'Personal program',
        academicStructure: structure,
      },
    });
    const first = structure.units[0];
    const unit = await db.unit.create({
      data: { hypertextId: hyper.id, number: first.number, title: 'Old unit' },
    });
    const topic = await db.topic.create({
      data: {
        unitId: unit.id,
        number: first.topics[0].number,
        title: 'Old topic',
      },
    });
    const material = await db.material.create({
      data: {
        topicId: topic.id,
        name: 'Keep this material',
        type: 'LINK',
        url: 'https://example.org',
      },
    });
    // Simulate 150 ms per network operation. Per-topic upserts exceed the old
    // 5 second transaction; the batched operation must still complete in it.
    let operations = 0;
    const delay =
      (fn) =>
      async (...args) => {
        operations++;
        await new Promise((resolve) => setTimeout(resolve, 150));
        return fn(...args);
      };
    const result = await db.$transaction(
      (tx) =>
        persistAcademicStructure(
          new Proxy(tx, {
            get(target, property) {
              const value = Reflect.get(target, property);
              if (property === '$queryRaw' || property === '$executeRaw')
                return delay(value.bind(target));
              if (property === 'hypertext')
                return {
                  findUnique: delay(value.findUnique.bind(value)),
                  update: delay(value.update.bind(value)),
                };
              return value;
            },
          }),
          hyper.id,
        ),
      { timeout: 5000 },
    );
    assert.equal(result.academicStructureConfirmed, true);
    assert.ok(operations <= 6, `Expected bounded queries, got ${operations}`);
    assert.equal(
      await db.unit.count({ where: { hypertextId: hyper.id } }),
      structure.units.length,
    );
    assert.equal(
      await db.topic.count({ where: { unit: { hypertextId: hyper.id } } }),
      expectedTopics,
    );
    assert.equal(
      await db.subtopic.count({
        where: { topic: { unit: { hypertextId: hyper.id } } },
      }),
      expectedSubtopics,
    );
    assert.equal(
      (await db.material.findUniqueOrThrow({ where: { id: material.id } }))
        .topicId,
      topic.id,
    );
    assert.equal(
      (await db.topic.findUniqueOrThrow({ where: { id: topic.id } })).title,
      first.topics[0].title,
    );
    // Both concurrent retries return success without creating duplicate rows.
    await Promise.all(
      [1, 2].map(() =>
        db.$transaction((tx) => persistAcademicStructure(tx, hyper.id), {
          timeout: 10000,
        }),
      ),
    );
    assert.equal(
      await db.topic.count({ where: { unit: { hypertextId: hyper.id } } }),
      expectedTopics,
    );
    // A failure after the unit write must roll back all changes and the flag.
    await db.hypertext.update({
      where: { id: hyper.id },
      data: {
        academicStructureConfirmed: false,
        academicStructure: {
          units: [{ number: 99, title: 'Rollback', topics: [] }],
        },
      },
    });
    await assert.rejects(
      db.$transaction((tx) => persistAcademicStructure(tx, hyper.id)),
    );
    assert.equal(
      await db.unit.count({ where: { hypertextId: hyper.id, number: 99 } }),
      0,
    );
    assert.equal(
      (await db.hypertext.findUniqueOrThrow({ where: { id: hyper.id } }))
        .academicStructureConfirmed,
      false,
    );
    console.log(
      `PASS: ${structure.units.length} units, ${expectedTopics} topics, ${expectedSubtopics} subtopics; ${operations} operations with simulated latency; existing materials, concurrent retries and rollback`,
    );
  } finally {
    if (university)
      await db.university.delete({ where: { id: university.id } });
    if (user) await db.user.delete({ where: { id: user.id } });
    await db.$disconnect();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
