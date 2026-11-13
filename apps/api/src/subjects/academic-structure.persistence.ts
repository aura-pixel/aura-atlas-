import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';

type Structure = {
  units: {
    number: number;
    title: string;
    objective?: string;
    topics: {
      number: string;
      title: string;
      subtopics?: { number: string; title: string }[];
    }[];
  }[];
};

// Keep existing IDs on conflict: materials and other relations stay attached.
// Three batched writes avoid a network round trip for every topic on Neon.
export async function persistAcademicStructure(
  tx: Prisma.TransactionClient,
  hypertextId: string,
) {
  await tx.$queryRaw`SELECT id FROM "Hypertext" WHERE id = ${hypertextId} FOR UPDATE`;
  const hypertext = await tx.hypertext.findUnique({
    where: { id: hypertextId },
  });
  if (!hypertext) throw new NotFoundException('Hipertexto no encontrado.');
  // The row lock makes concurrent retries safe and confirmation idempotent.
  if (hypertext.academicStructureConfirmed) return hypertext;
  const structure = hypertext.academicStructure as unknown as Structure | null;
  if (!structure?.units?.length) {
    throw new BadRequestException(
      'El programa no contiene unidades para confirmar.',
    );
  }

  const units = new Map(
    structure.units.map((unit) => [
      unit.number,
      {
        id: randomUUID(),
        number: unit.number,
        title: unit.title,
        objective: unit.objective,
      },
    ]),
  );
  const storedUnits = await tx.$queryRaw<{ id: string; number: number }[]>`
    INSERT INTO "Unit" (id, number, title, objective, "hypertextId", "updatedAt")
    SELECT r.id, r.number, r.title, r.objective, ${hypertextId}, CURRENT_TIMESTAMP
    FROM jsonb_to_recordset(${JSON.stringify([...units.values()])}::jsonb)
      AS r(id text, number integer, title text, objective text)
    ON CONFLICT ("hypertextId", number) DO UPDATE SET
      title = EXCLUDED.title,
      objective = COALESCE(EXCLUDED.objective, "Unit".objective),
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING id, number
  `;
  const unitIds = new Map(storedUnits.map((unit) => [unit.number, unit.id]));
  const topicKey = (unitId: string, number: string) =>
    JSON.stringify([unitId, number]);
  const topics = new Map<
    string,
    { id: string; number: string; title: string; unitId: string }
  >();
  for (const unit of structure.units) {
    const unitId = unitIds.get(unit.number)!;
    for (const topic of unit.topics) {
      topics.set(topicKey(unitId, topic.number), {
        id: randomUUID(),
        number: topic.number,
        title: topic.title,
        unitId,
      });
    }
  }
  if (!topics.size)
    throw new BadRequestException(
      'El programa no contiene temas para confirmar.',
    );
  const storedTopics = await tx.$queryRaw<
    { id: string; number: string; unitId: string }[]
  >`
    INSERT INTO "Topic" (id, number, title, "unitId", "updatedAt")
    SELECT r.id, r.number, r.title, r."unitId", CURRENT_TIMESTAMP
    FROM jsonb_to_recordset(${JSON.stringify([...topics.values()])}::jsonb)
      AS r(id text, number text, title text, "unitId" text)
    ON CONFLICT ("unitId", number) DO UPDATE SET
      title = EXCLUDED.title, "updatedAt" = CURRENT_TIMESTAMP
    RETURNING id, number, "unitId"
  `;
  const topicIds = new Map(
    storedTopics.map((topic) => [
      topicKey(topic.unitId, topic.number),
      topic.id,
    ]),
  );
  const subtopics = new Map<
    string,
    { id: string; number: string; title: string; topicId: string }
  >();
  for (const unit of structure.units) {
    for (const topic of unit.topics) {
      const topicId = topicIds.get(
        topicKey(unitIds.get(unit.number)!, topic.number),
      )!;
      for (const subtopic of topic.subtopics ?? []) {
        subtopics.set(JSON.stringify([topicId, subtopic.number]), {
          id: randomUUID(),
          number: subtopic.number,
          title: subtopic.title,
          topicId,
        });
      }
    }
  }
  if (subtopics.size) {
    await tx.$executeRaw`
      INSERT INTO "Subtopic" (id, number, title, "topicId", "updatedAt")
      SELECT r.id, r.number, r.title, r."topicId", CURRENT_TIMESTAMP
      FROM jsonb_to_recordset(${JSON.stringify([...subtopics.values()])}::jsonb)
        AS r(id text, number text, title text, "topicId" text)
      ON CONFLICT ("topicId", number) DO UPDATE SET
        title = EXCLUDED.title, "updatedAt" = CURRENT_TIMESTAMP
    `;
  }
  return tx.hypertext.update({
    where: { id: hypertextId },
    data: { academicStructureConfirmed: true },
  });
}
