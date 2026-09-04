import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: "admin@atlas.local",
    },
  });

  if (existingAdmin) {
    console.log("✅ El SUPER_ADMIN ya existe.");
    return;
  }

  const hashedPassword = await bcrypt.hash("AuraAtlas2026!", 10);

  await prisma.user.create({
    data: {
      name: "Aura Admin",
      email: "admin@atlas.local",
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  console.log("🚀 SUPER_ADMIN creado correctamente.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });