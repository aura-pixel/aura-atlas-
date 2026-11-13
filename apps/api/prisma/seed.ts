import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (
    !email ||
    !password ||
    password.length < 12 ||
    Buffer.byteLength(password) > 72
  )
    throw new Error('Configura ADMIN_EMAIL y ADMIN_PASSWORD (12 a 72 bytes).');
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && process.env.RESET_ADMIN_PASSWORD !== 'true')
    throw new Error(
      'La cuenta existe. Usa RESET_ADMIN_PASSWORD=true únicamente para una rotación intencional.',
    );
  await prisma.$transaction(async (tx) => {
    const admin = await tx.user.upsert({
      where: { email },
      create: {
        name: 'Aura Admin',
        email,
        password: await hash(password, 12),
        role: Role.SUPER_ADMIN,
        emailVerified: true,
      },
      update: {
        password: await hash(password, 12),
        role: Role.SUPER_ADMIN,
        emailVerified: true,
      },
    });
    await tx.session.deleteMany({ where: { userId: admin.id } });
  });
  console.log('Administrador configurado; sesiones anteriores revocadas.');
}
main()
  .catch(() => {
    console.error(
      'No se pudo configurar el administrador. Revisa las variables y la base de destino.',
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
