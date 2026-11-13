# Correcciones de seguridad

Actualización del 12 de noviembre. La creación privada con revisión administrativa admite universidades y facultades. Neon tiene 13 migraciones aplicadas.

Estado: implementadas y comprobadas en una base local aislada. Las dos migraciones se aplicaron a Neon el 11 de noviembre de 2026; se verificó que los datos de las 13 tablas existentes permanecieron intactos. Este documento complementa el diagnóstico histórico de SECURITY-AUDIT.md; no es una garantía de ausencia de otras vulnerabilidades.

## Decisiones confirmadas

- Un docente puede elegir libremente su carrera.
- Los docentes de esa carrera pueden personalizar nombre, abreviación, descripción, color e imagen exclusivamente en su propio perfil.
- Una materia nueva creada por un docente sí queda disponible en la carrera; sus modificaciones posteriores no cambian esa base común.
- Esa relación no concede acceso a hipertextos privados de otros docentes ni funciones administrativas.
- La integración SMTP está preparada. Al no haber proveedor aún, desarrollo guarda los enlaces de verificación en `apps/api/.temp/mail/`; producción exige SMTP_URL y MAIL_FROM y nunca utiliza esa bandeja local.

## Hallazgo por hallazgo

| ID | Cambio | Comprobación |
| --- | --- | --- |
| S01 | Guard de sesión y rol de administrador; DTO estricto y campos escalares explícitos | Peticiones anónimas 401, docentes 403, escrituras anidadas incluso de admin 400; el rol queda intacto |
| S02 | Crear/editar catálogo y borrar facultades/carreras requiere admin | Matriz visitante/docente/admin para cada operación; los flujos autorizados funcionan |
| S03 | Materias no aceptan relaciones Prisma ni cambios de carrera; datos personales en SubjectProfile y el hipertexto privado con filtro de dueño | Intento de cambiar/publicar hipertexto ajeno rechazado; cambios de A no alteran B ni el catálogo |
| S04 | Selecciones mínimas de datos en perfiles, autores y solicitudes | Verificación recursiva de respuestas: sin password, passwordHash, sessions ni emailTokens |
| S05 | Solicitudes atribuidas al usuario autenticado; listado/detalle propios; revisión y borrado sólo por admin | A no ve la solicitud de B; sólo admin aprueba/elimina |
| S06 | Descarga autorizada por relación Material → Topic → Unit → Hypertext | Dueño accede; otro docente y visitante no acceden al archivo privado; publicado sí es público |
| S07 | Cargas pendientes persistidas con propietario, materia, tamaño, tipo y vencimiento; consumo único transaccional de uploadId | Clave arbitraria, carga ajena, vencida y reutilizada rechazadas; metadatos se toman del servidor |
| S08 | Tipos detectados por contenido; logos decodificados y convertidos a WebP con nombre generado; descargas desconocidas como attachment | HTML y MIME falsificado rechazados; imagen real convertida aunque su nombre original termine en .html |
| S09 | Límites de bytes/cantidad/campos, cuotas, concurrencia y limpieza de cargas; PDFs en worker con límites de memoria y tiempo | Archivos grandes, cuota excedida y PDF falso rechazados; PDF real procesado correctamente |
| S10 | ValidationPipe global con whitelist/forbidNonWhitelisted; DTOs reales y validación anidada | Contraseña débil, email inválido, campos de rol, relaciones y estructura inválida rechazados |
| S11 | Sesión persistida, rol/usuario actuales, huella de contraseña y vencimiento; cookie HttpOnly y logout real | Cuenta eliminada, contraseña cambiada, sesión vencida o cerrada y firma inválida dejan de funcionar; rol degradado pierde permisos |
| S12 | Seed sin credenciales fijas; bootstrap por variables; rotación explícita revoca sesiones; login impide usar la contraseña pública antigua del admin | Código de bootstrap revisado; no se rotó una cuenta real ni se ejecutó el seed en Neon |
| S13 | Libre elección de carrera y creación de materias comunes; personalización posterior individual | Otros docentes ven las materias nuevas, pero no heredan cambios personales de su creador |
| S14 | Layouts de admin/docente validan sesión en servidor; llamadas web pasan por BFF del mismo origen | Navegador: visitante al login, docente fuera del panel y localStorage falsificado sin efecto |
| S15 | Listado de materias filtrado por carreras; catálogo sin asociaciones de usuarios | Materia de carrera ajena ausente; catálogo sin users |
| S16 | Límites de frecuencia, verificación de email, enlaces con hash y vencimiento y contraseñas de registro de 12 caracteres | Registro sin verificación no inicia sesión; verificación de un solo uso; exceso de login 429 |
| S17 | Next 16.4.6, Multer 2.5.0, Sharp 0.35.5, Nest 11 actualizado y dependencias transitivas corregidas | `pnpm audit --prod`: sin vulnerabilidades conocidas |

Las pruebas del catálogo incluyen operaciones reales únicamente sobre registros sintéticos de PostgreSQL local. Las operaciones de R2 se simulan: no se enviaron archivos ni mensajes reales a servicios externos.

## Cambios complementarios

- Cookies `HttpOnly`, `SameSite=Strict`, `Secure` en producción, sin token devuelto al JavaScript de la web. Sesión de ocho horas, sin renovación indefinida.
- BFF con destino fijo configurado, sin reenvío de Authorization del cliente, con comprobación de Origin para mutaciones. La API también comprueba Origin cuando se usan cookies. Las llamadas de servidor tienen un cliente separado que reenvía la sesión y valida el rol.
- CSP, protección contra framing, nosniff y no-store para respuestas privadas. El endpoint de archivos permite exclusivamente framing del mismo origen para conservar el visor PDF; el panel mantiene DENY.
- Materiales: máximo 10 archivos de 20 MB por petición, cuota de 500 MB por usuario y 50 cargas pendientes. Logos: 2 MB de entrada, límite de píxeles, conversión a WebP y cuota de 100 MB/1000 imágenes por usuario y categoría. PDFs de estructura: 10 MB; worker de 15 segundos, 128 MB de heap y límites de páginas/texto.
- Las nuevas cargas abandonadas y los objetos nuevos que quedaron sin material asociado se limpian periódicamente. No se eliminan objetos históricos de R2 sin conocer su propietario y uso.
- Publicación exige estructura confirmada, temas y contenido en al menos el 30% de los temas.
- Registro de operaciones y denegaciones sin cuerpos, contraseñas, tokens ni query strings.
- .gitignore reparado; configuración de ejemplo; PostgreSQL de Docker restringido a loopback; un solo lockfile del workspace.
- Corregidos errores de compilación existentes y la carga de datos del panel en servidor, conservando los cambios visuales locales del usuario.

## Dependencia de desarrollo sin parche publicado

La auditoría completa aún identifica el aviso bajo GHSA-gcqx-w48m-w2h4 de deepmerge 4.3.1, usado por herramientas de desarrollo. No hay versión corregida publicada según el aviso. Se incluyó un parche reproducible de pnpm en `patches/deepmerge@4.3.1.patch` que sustituye asignaciones capaces de invocar el setter de __proto__ por propiedades de datos propias, en las tres distribuciones del paquete. Tres pruebas comprueban el ataque con target normal, target sin prototipo y compatibilidad de la mezcla normal.

No se ocultó ni excluyó el aviso del auditor: éste identifica la versión original y no evalúa el parche local. `pnpm audit --prod` no informa vulnerabilidades; el auditor de todo el árbol sigue mostrando ese aviso bajo mitigado localmente. El parche y su prueba deben mantenerse hasta poder sustituirlo por una versión corregida oficial.

## Pruebas repetibles

Desde la raíz:

```powershell
docker compose up -d
pnpm install
pnpm security:test
pnpm test
pnpm --filter web build
pnpm audit --prod
```

`security:test` fija su datasource a `localhost:5433/aura_security_regression`, crea esa base si hace falta, aplica migraciones locales, compila y ejecuta 108 escenarios con cuentas sintéticas. No toma DATABASE_URL de Neon. Si cambió el schema y la DLL de Prisma está cargada por otra API de Windows, detener esa API antes de regenerar el cliente.

También se ejecutaron 18 pruebas unitarias y 16 escenarios en Edge sin interfaz, incluidos login real, cookie HttpOnly, logout, replay, paneles, streaming de un PDF privado y personalización de nombre/color/imagen con dos docentes en sesiones independientes. Los artefactos de resultados están en `security-regression-results.json` y `security-browser-results.json`.

En la revisión final se endureció el límite de 72 bytes UTF-8 de bcrypt y se conservó el registro de limpieza para cargas cuyo envío a R2 falle después de que el proveedor pudiera haber aceptado el objeto. Ambos casos tienen pruebas de regresión. No se encontraron nuevas vías de escalamiento de rol ni de modificación de perfiles ajenos en las rutas revisadas. El auditor de producción siguió sin avisos.

Para repetir las pruebas de navegador: con la base local ya migrada y API compilada, ejecutar `pnpm --filter api exec node test/security-preview.cjs`, iniciar la web en localhost:3001 y ejecutar `pnpm --filter web security:browser`. La API de preview sustituye R2/correo por adaptadores de prueba y escribe credenciales sintéticas en `.temp/browser-fixture.json`. No debe utilizarse como servidor de trabajo con datos reales.

## Activación con los datos reales

La migración `apps/api/prisma/migrations/20261111000000_security_sessions_uploads/migration.sql` agrega emailVerified a User y las tablas Session, EmailToken y PendingUpload. Se aplicó a Neon correctamente, sin borrar materias ni hipertextos.

La migración adicional `20261111010000_subject_profiles` agrega SubjectProfile, con una fila por docente y materia. No modifica los valores compartidos existentes. Los campos sin personalizar heredan la base común; el formulario envía únicamente los campos que el docente cambió. El administrador sigue editando la base del catálogo. El editor y el hipertexto público utilizan la personalización de su autor, no la del visitante ni la de otro docente. Esta migración también se aplicó a Neon correctamente.

La aplicación se realizó con Prisma Migrate mediante la conexión directa de Neon. Ambas migraciones incluyen transacción y límites de espera/bloqueo. Se compararon cantidades y huellas agregadas del contenido de las tablas anteriores, excluyendo únicamente el campo nuevo emailVerified: no hubo cambios. Permanecieron los 7 usuarios, 5 materias, 3 hipertextos y 2 materiales existentes. Las cuatro tablas nuevas se crearon vacías y las 7 cuentas quedaron pendientes de verificación. No se rotaron contraseñas ni se enviaron correos reales durante la migración. Referencia: [migraciones Prisma en Neon](https://neon.com/docs/guides/prisma-migrations).

Antes de arrancar la API con esa base:

1. Las migraciones actuales ya están aplicadas. Para futuras migraciones en Neon usar su conexión directa y revisar primero el destino y el SQL; generar el cliente cuando cambie el schema.
2. Las cuentas existentes quedan sin verificar y los tokens antiguos dejan de aceptarse. Solicitar verificación en `/verify-email`; en desarrollo los enlaces aparecen en la bandeja `.temp/mail`. En producción configurar SMTP_URL, MAIL_FROM, FRONTEND_URL HTTPS y JWT_SECRET único de al menos 32 caracteres.
3. Configurar/rotar el admin mediante ADMIN_EMAIL y ADMIN_PASSWORD fuerte. Para modificar una cuenta existente se exige RESET_ADMIN_PASSWORD=true al ejecutar el seed. Retirar esas variables después. La contraseña pública antigua no se acepta.
4. Configurar API_INTERNAL_URL en la web. Las peticiones del navegador usan `/api/backend`; no necesitan un token en localStorage.
5. Arrancar con `pnpm dev`, o compilar y utilizar los scripts de producción con sus puertos configurados.

La revisión local no incluye IAM de Cloudflare, permisos del proyecto Neon, TLS/firewall del despliegue, secretos antiguos ni investigación de accesos pasados. Para varias réplicas, compartir el almacenamiento del rate limiter y el volumen de imágenes; el límite de concurrencia se aplica por proceso. Antes de publicar, revisar estos controles de infraestructura y usar una versión de Node con soporte vigente.

## Acceso durante cinco d?as (12 de noviembre de 2026)

Se aplic? `20261112000000_email_verification_grace` a Neon (11 migraciones en total). `User.emailVerificationDeadline` usa un valor por defecto de cinco d?as desde la creaci?n; las siete cuentas existentes recibieron su plazo desde la activaci?n. La comparaci?n de cantidades y huellas de las 13 tablas confirm? que los datos previos se conservaron, excluyendo ?nicamente la nueva columna. El esquema coincide con Prisma.

Registro inicia sesi?n y lleva a la configuraci?n del espacio. Login y JWT consultan el plazo del servidor en cada solicitud; entrar o reenviar un enlace no extiende el plazo. Verificar permite continuar incluso despu?s del vencimiento. Los enlaces conservan su caducidad de una hora y pueden solicitarse de nuevo. Las pantallas protegidas muestran un aviso con la fecha l?mite. SMTP sigue pendiente de configuraci?n.

Validaci?n de este cambio: 24 pruebas unitarias, compilaci?n de la API, TypeScript web y prueba de integraci?n local `node test/email-grace.cjs` (registro, plazo fijo, login, perfil, sesi?n abierta vencida, recuperaci?n por verificaci?n, rechazo de replay y de fecha enviada por cliente). La repetici?n completa de seguridad se interrumpi? en la prueba de archivo de m?s de 20 MB; por ello, los 108 resultados anteriores corresponden a la revisi?n del 11 de noviembre y no se presentan como una nueva ejecuci?n completa.

## Universidades provisionales y aprobacion administrativa

- `/teacher` usa un diseno sobrio, busqueda por nombre o siglas y un modal para universidad, siglas, facultad y carrera. Se normalizan espacios y Unicode; se validan longitudes y caracteres y se pide confirmar los nombres. Esto no certifica la existencia ni la ortografia oficial de una institucion: esa comprobacion corresponde al administrador.
- Crear una solicitud crea y vincula universidad, facultad, carrera e inscripcion en una transaccion. La nueva inscripcion se prioriza en el perfil, conservando las anteriores.
- La universidad pendiente o rechazada solo se consulta por su creador y por administracion. Los filtros se aplican a listas, detalles, facultades, carreras e inscripciones. No se pueden publicar hipertextos ni descargar sus materiales como publicos hasta la aprobacion.
- `/dashboard/requests` permite aprobar o solicitar correcciones con observaciones obligatorias. `/teacher/requests` permite corregir y reenviar conservando IDs, materias e hipertextos. Una solicitud aprobada no se puede modificar desde el perfil docente. La aprobacion publica el catalogo, sin publicar automaticamente los hipertextos.
- Las solicitudes tienen limites por frecuencia y hasta tres pendientes/rechazadas por docente. Un bloqueo transaccional serializa las revisiones y evita aprobar nombres duplicados; las comparaciones ignoran espacios, puntuacion, mayusculas y acentos.
- El cache de consultas se limpia al iniciar y cerrar sesion para no mantener catalogos privados del usuario anterior. Las rutas antiguas de seleccion y solicitud redirigen al flujo autenticado actual.

Neon: aplicada `20261112010000_provisional_universities` (12 migraciones). El esquema coincide con Prisma y todas las universidades anteriores conservan el estado aprobado. La comprobacion final encontro 8 usuarios, 1 universidad, 2 facultades, 2 carreras, 5 materias, 3 hipertextos y 2 materiales. Las cuentas de prueba y solicitudes ficticias se crearon exclusivamente en PostgreSQL local, nunca en Neon.

Validacion: 24 pruebas unitarias; 50 escenarios de API en `apps/api/test/provisional-universities.cjs`; TypeScript web; navegador con busqueda, pasos, modal, creacion privada, rechazo con observaciones, correccion, aprobacion y visualizacion publica; modal responsive comprobado en 320, 390 y 768 px.

Para repetir: aplicar migraciones a la base **local aislada** `aura_security_regression`, compilar API y ejecutar `node test/provisional-universities.cjs` desde `apps/api`. Para la prueba visual, detener la API normal y ejecutar `node test/provisional-universities-preview.cjs` desde `apps/api`; este script fija la base local, crea sus cuentas y escucha en 3000. Con web en 3001, ejecutar `node test/provisional-universities.cjs` desde `apps/web`. Escribir `stop` en el proceso de fixtures para borrar sus datos y cerrarlo. Restaurar despues la API normal. En esta revision se uso `next dev --webpack -p 3001` porque Turbopack entraba en recargas continuas en el entorno local.
