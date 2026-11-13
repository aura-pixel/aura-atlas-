import * as bcrypt from 'bcrypt';
import { PrismaClient } from "@prisma/client";

if (!process.env.DATABASE_URL || !/^postgresql:\/\/[^/]+@(?:localhost|127\.0\.0\.1):5433\/aura_security_/.test(process.env.DATABASE_URL)) throw new Error('Este script sólo admite una base local aura_security_ explícita.');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "R2 Test User",
      email: `r2-test-${Date.now()}@example.com`,
      password: await bcrypt.hash("temporary-test-password", 12),
      role: "TEACHER",
    },
  });

  const university = await prisma.university.create({
    data: {
      name: "Universidad de Prueba",
      abbreviation: "UP",
    },
  });

  const faculty = await prisma.faculty.create({
    data: {
      name: "Facultad de Prueba",
      abbreviation: "FP",
      universityId: university.id,
    },
  });

  const career = await prisma.career.create({
    data: {
      name: "Carrera de Prueba",
      abbreviation: "CP",
      facultyId: faculty.id,
    },
  });

  const subject = await prisma.subject.create({
    data: {
      name: "Materia de Prueba",
      abbreviation: "MP",
      careerId: career.id,
    },
  });

  const hypertext = await prisma.hypertext.create({
    data: {
      title: "Hipertexto de Prueba",
      subjectId: subject.id,
      userId: user.id,
    },
  });

  const unit = await prisma.unit.create({
    data: {
      number: 1,
      title: "Unidad de Prueba",
      hypertextId: hypertext.id,
    },
  });

  const topic = await prisma.topic.create({
    data: {
      number: "1.1",
      title: "Tema de Prueba",
      unitId: unit.id,
    },
  });

  const material = await prisma.material.create({
    data: {
      name: "Prueba R2",
      type: "OTHER",
      mimeType: "text/plain",
      size: 40,
      url: "test/material-1788548321428.txt",
      topicId: topic.id,
    },
  });

  console.log("✅ Estructura de prueba creada");
  console.log("");
  console.log("MATERIAL ID:");
  console.log(material.id);
  console.log("");
  console.log("TOPIC ID:");
  console.log(topic.id);
}

main()
  .catch((error) => {
    console.error("❌ Error:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });