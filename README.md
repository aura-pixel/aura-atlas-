# AURA ATLAS

Workspace pnpm con una web Next.js en `apps/web` y una API NestJS/Prisma en `apps/api`.

```powershell
pnpm install
docker compose up -d
pnpm --filter api exec prisma generate
pnpm dev
```

Web: http://localhost:3001. API: http://localhost:3000. PostgreSQL local: localhost:5433.

Usa los archivos `.env.example` de cada aplicación como referencia. Revisa DATABASE_URL antes de aplicar migraciones: la configuración existente puede apuntar a Neon. La API requiere que las migraciones de su schema estén aplicadas.

```powershell
pnpm build
pnpm test
pnpm security:test
pnpm audit --prod
```

`security:test` usa exclusivamente una base PostgreSQL local dedicada y adaptadores simulados de correo/R2; no modifica Neon.

Consulta [SECURITY-FIXES.md](SECURITY-FIXES.md) para el estado de las correcciones, la migración, verificación de correo, configuración del administrador y pruebas. [SECURITY-AUDIT.md](SECURITY-AUDIT.md) conserva el diagnóstico original.
