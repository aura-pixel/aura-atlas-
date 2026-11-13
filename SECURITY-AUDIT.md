# Auditoría de seguridad de AURA ATLAS

Fecha: 11 de noviembre de 2026. Estado: diagnóstico histórico. Las correcciones posteriores y su validación están documentadas en [SECURITY-FIXES.md](SECURITY-FIXES.md).

## Resultado

La separación entre visitantes, docentes y administradores no está garantizada en la API. Se reprodujeron escalamiento a SUPER_ADMIN sin sesión, modificación de hipertextos ajenos y acceso a materiales privados. Estas pruebas no indican que haya ocurrido una intrusión real.

Se revisaron los controladores y servicios activos, autenticación, modelo Prisma, cargas y descargas, rutas web, configuración y dependencias. Las operaciones de escritura se ejecutaron exclusivamente en una base PostgreSQL local dedicada, `aura_security_audit_20261111`, con cuentas sintéticas. Neon no se modificó. R2 se sustituyó por una respuesta simulada: se comprobó qué clave pide la aplicación, sin leer ni escribir objetos reales. El archivo HTML de prueba era inerte y se eliminó después.

La revisión no garantiza ausencia de otros fallos. No cubre configuración efectiva de producción, políticas IAM del bucket, panel de Neon, secretos históricos fuera del repositorio ni un análisis forense de accesos.

## Hallazgos prioritarios

### S01 — Crítico: escalamiento anónimo a administrador por escrituras anidadas

**Evidencia:** `apps/api/src/careers/careers.controller.ts:78`, `apps/api/src/careers/careers.service.ts:36`, `apps/api/src/main.ts`.

`PATCH /careers/:id` no tiene guard. El cuerpo se copia íntegramente a `prisma.career.update`, y no hay ValidationPipe ni lista permitida de campos. Prisma admite operaciones anidadas sobre `users → user`.

**Reproducción aislada:** una petición sin Authorization modificó el rol de una cuenta de prueba mediante esa relación. Resultado HTTP 200; la base confirmó `SUPER_ADMIN`; un login posterior devolvió un JWT real con ese rol. Con el mismo defecto se podrían modificar otros campos del usuario, incluida su contraseña. No se probó sobre cuentas reales.

**Corrección:** exigir autenticación y rol SUPER_ADMIN en mutaciones del catálogo; ValidationPipe con whitelist y forbidNonWhitelisted; construir `data` con campos escalares explícitos. No aceptar tipos/objetos Prisma desde HTTP. Aplicar ambas defensas: un guard por sí solo no elimina la asignación masiva.

### S02 — Crítico: operaciones administrativas públicas y borrado en cascada

**Evidencia:** controladores `universities`, `faculties`, `careers`; `apps/api/prisma/schema.prisma` (relaciones con onDelete Cascade).

Sin sesión se puede crear y modificar universidades, facultades y carreras, y borrar facultades/carreras. Un borrado de carrera elimina también materias, hipertextos, unidades, temas y materiales relacionados en la base.

**Prueba aislada:** crear universidad: 201; editar: 200; borrar carrera: 200; se verificó que su hipertexto había desaparecido. El borrado de registros no implica que se limpien sus objetos de R2.

**Corrección:** autorización por rol en servidor, política de borrado explícita y pruebas de denegación. CORS no reemplaza autorización.

### S03 — Crítico: docente modifica y publica hipertextos privados ajenos

**Evidencia:** `apps/api/src/subjects/subject.service.ts:78` y `:106`, DTO UpdateSubjectDto.

El permiso de actualización se comprueba sobre la carrera de la materia, pero después se entrega todo el cuerpo a Prisma. La relación `hypertexts.update` permite alcanzar un hipertexto de otro docente dentro de esa materia. También quedan expuestos cambios de relaciones que no deberían ser editables mediante esa operación.

**Prueba aislada:** A no pudo consultar directamente el hipertexto de B (404, control correcto), pero pudo cambiar su título y establecer `isPublished: true` y un slug mediante `PATCH /subjects/:id` (200). Se comprobó la modificación en la base y la lectura pública posterior.

**Corrección:** lista explícita de campos editables en materias; prohibir operaciones anidadas; todas las modificaciones de hipertexto deben pasar por servicios que verifiquen propietario o coautor autorizado.

### S04 — Alto: exposición de hashes de contraseñas y datos de usuarios

**Evidencia:** `apps/api/src/hypertext/hypertext.service.ts:103`, `:121`, `:28`, `:212`; `apps/api/src/university-requests/university-requests.service.ts:29` y `:43`; `apps/api/src/users/users.service.ts:58`.

`include: { user: true }` devuelve todos los escalares de User, incluido `password`. El lector público expone el hash del autor y los coautores; las solicitudes públicas exponen el usuario completo. `/users/me` también devuelve el hash propio innecesariamente.

**Prueba aislada:** los tres tipos de respuesta incluyeron `password`. No se copiaron hashes reales al informe. Un hash no es la contraseña en claro, pero permite intentos de descifrado fuera del servidor y aumenta el impacto de contraseñas débiles.

**Corrección:** `select` mínimo por caso (p. ej. id y nombre para autores públicos), DTO de respuesta y exclusión central de secretos. Si esto estuvo publicado, evaluar exposición y cambio de credenciales después de cerrar el fallo.

### S05 — Alto: solicitudes de otros usuarios sin autenticación ni dueño

**Evidencia:** `apps/api/src/university-requests/university-requests.controller.ts:16`, servicio `data: dto`.

GET lista y detalle, PATCH y DELETE no exigen sesión, rol ni propiedad. Se puede conocer, modificar, aprobar o eliminar una solicitud ajena. El POST usa `TEMP_USER_ID` en lugar del usuario autenticado; si ese usuario no existe, falla, y si existiera atribuiría solicitudes a una identidad fija. PATCH acepta campos extra y relaciones por la ausencia de validación.

**Prueba aislada:** consulta pública: 200; cambio de estado a APPROVED: 200; eliminación sin sesión: 200.

**Corrección:** derivar userId del JWT; docente sólo crea/consulta sus solicitudes; revisión y cambio de estado sólo por administrador; campos permitidos diferentes por operación.

### S06 — Alto: descarga de materiales privados sin autorización

**Evidencia:** `apps/api/src/material/material.controller.ts:96`, `apps/api/src/material/material.service.ts:358`.

`GET /materials/file/:materialId` busca por id y descarga de R2 sin verificar propietario, carrera ni publicación del hipertexto. Tener el identificador basta. Que un id sea difícil de adivinar no es control de acceso.

**Prueba aislada:** un material de un hipertexto no publicado fue servido sin sesión (200); el contenido de R2 se simuló.

**Corrección:** recorrer Material → Topic → Unit → Hypertext y autorizar. Público sólo si su publicación lo permite; privado sólo para dueño/coautores autorizados. Considerar URLs firmadas de corta duración.

### S07 — Alto: materiales pueden apuntar a claves de R2 ajenas

**Evidencia:** `apps/api/src/material/material.service.ts:260` y `:358`.

`POST /materials/save/:subjectId` acepta `url` del cliente y la almacena como clave del bucket. No comprueba que provenga de una carga de ese usuario. El backend usa después sus credenciales para descargar esa clave.

**Prueba aislada:** B vinculó una clave arbitraria a su material (201); una descarga anónima posterior solicitó esa clave al adaptador simulado (200). Para obtener un objeto ajeno real, la clave debe existir y ser conocida. No se probó contra R2 real.

**Corrección:** guardar cargas pendientes en servidor con propietario, clave, tipo y tamaño; aceptar un uploadId y consumirlo al asociar; prefijos por usuario como defensa adicional. No confiar en metadatos enviados por el cliente.

### S08 — Alto: cargas públicas de HTML y contenido activo

**Evidencia:** FileInterceptor de universidades, facultades y carreras; `apps/api/src/main.ts:13`; filtro de materias en `subject.controller.ts`.

Los logos del catálogo no tienen filtro de contenido ni límite de tamaño. Conservan la extensión enviada por el cliente y se sirven públicamente desde `/uploads`. En materias hay un límite de 2 MB y un filtro MIME, pero el MIME se puede falsificar y la extensión original sigue controlada por el cliente. Materiales tampoco restringe tipos antes de subirlos a R2; la descarga conserva Content-Type y no fuerza attachment.

**Prueba aislada:** HTML inerte subido como logo sin sesión: 201; lectura posterior: 200 con `Content-Type: text/html` y sin Content-Disposition. Confirma alojamiento de contenido activo. No se ejecutó JavaScript malicioso.

**Impacto:** phishing y scripts en el origen de la API. En desarrollo, puerto 3000 y 3001 son orígenes distintos: esto no demuestra lectura directa del localStorage de la web. Si se comparten orígenes mediante un proxy, el impacto sobre sesiones puede aumentar.

**Corrección:** validar firma y decodificar/recrear imágenes, generar extensión segura, rechazar HTML/SVG activo, aislar origen de archivos y aplicar CSP/nosniff y attachment según el tipo. [Guía OWASP](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html).

### S09 — Alto: agotamiento de memoria, disco, procesamiento y almacenamiento

**Evidencia:** `material.controller.ts:49`, `academic-structure.controller.ts:29`, interceptores de logos del catálogo, extractores PDF.

Materiales acepta 50 archivos en memoria sin fileSize; análisis PDF tampoco limita tamaño. Logos públicos pueden llenar disco. No hay cuotas por usuario, límites de concurrencia ni aislamiento/tiempo máximo del procesamiento PDF. Los materiales se suben a R2 antes de completar la clasificación; cargas abandonadas no tienen seguimiento/limpieza visibles.

**Validación:** revisión de configuración; no se hicieron pruebas de saturación.

**Corrección:** límites de bytes/archivos/campos, cuotas por usuario, control de concurrencia, procesamiento en trabajos aislados y expiración de cargas pendientes. Autorizar antes de persistir archivos; actualmente el interceptor de materia escribe antes de que el servicio rechace acceso a una materia ajena.

### S10 — Alto: validación declarada pero no ejecutada

**Evidencia:** `apps/api/src/main.ts`, DTOs y cuerpos definidos como tipos inline en controladores.

No hay ValidationPipe global/local. Los decoradores IsEmail, MinLength e IsEnum no se ejecutan automáticamente. Los tipos TypeScript no validan peticiones en ejecución. Esto permite S01/S03 y registros con contraseñas débiles, además de errores internos y estructuras descontroladas.

**Prueba aislada:** registro con email inválido y contraseña de un carácter: 201. El intento directo de inyectar role en registro sí quedó limitado a TEACHER porque UsersService.create enumera sus campos explícitamente (control correcto).

**Corrección:** ValidationPipe con whitelist, forbidNonWhitelisted y transform; DTOs reales con validación anidada y límites de longitud/cantidad; límites de profundidad y tamaño para estructuras académicas. [Documentación NestJS](https://docs.nestjs.com/techniques/validation).

### S11 — Alto: tokens válidos tras eliminar una cuenta y roles obsoletos

**Evidencia:** `apps/api/src/auth/strategies/jwt.strategy.ts:18`, `auth.module.ts:26`, logout en frontend.

La estrategia confía en sub/email/role del token firmado sin consultar al usuario actual. El token dura siete días; JWT_EXPIRES_IN no se usa. Borrar la cuenta, cambiar contraseña o degradar un rol no revoca el token. Logout sólo elimina la copia local. El token se guarda en localStorage y queda expuesto a JavaScript que ejecute en el origen web.

**Prueba aislada:** después de eliminar A, su JWT siguió siendo aceptado por `/auth/me` (200). Esto no permite falsificar firmas: se necesita un token válido emitido previamente.

**Corrección:** comprobar existencia/estado y rol actual; versionar/revocar sesiones, access tokens cortos y renovación controlada; definir almacenamiento seguro y logout real. Si se usan cookies, añadir protección CSRF adecuada.

### S12 — Alto condicionado: administrador con contraseña fija en seed

**Evidencia:** `apps/api/prisma/seed.ts:18`.

El seed crea un SUPER_ADMIN con correo y contraseña constantes incluidos en el repositorio. Si ese seed se ejecutó en un ambiente accesible y la contraseña sigue igual, cualquiera con ese dato puede iniciar sesión. No se intentó autenticar esa cuenta en Neon ni se comprobó que exista.

**Corrección:** credencial de bootstrap única mediante configuración segura, cambio obligatorio y sin contraseña fija en código. No se reproduce aquí la contraseña.

### S13 — Alto si se requiere aislamiento institucional: autoasignación a cualquier carrera

**Evidencia:** `apps/api/src/users/users.service.ts:82`, `subjects/subject.service.ts:39`.

`PATCH /users/me/career` sólo verifica que la carrera exista. Cualquier cuenta puede agregarse a cualquier carrera, y la API usa precisamente esa relación como permiso para crear/editar materias. No hay aprobación, invitación ni comprobación institucional.

**Prueba aislada:** A recibió 403 antes de autoasignarse; después pudo modificar una materia de la carrera de B (200).

**Decisión de producto:** si el registro en carreras debe ser libre y los datos de materia son colaborativos, esa parte puede ser intencional. Aun así, no debe conceder acceso a hipertextos privados ni operaciones administrativas. Si hay aislamiento por universidad, esta relación no sirve como autorización sin aprobación.

### S14 — Medio: rutas web administrativas sin protección

**Evidencia:** `apps/web/app/dashboard/layout.tsx`, `components/dashboard/layout/sidebar.tsx`, ausencia de middleware/proxy de autorización.

Una visita sin sesión a `/dashboard` y `/dashboard/universities` devuelve 200 y muestra el panel administrativo. El Sidebar sólo lee identidad de localStorage. AuthProvider no impone roles sobre sus hijos.

**Corrección:** proteger layouts/rutas con sesión validada, redirigir según rol y no confiar en el role manipulable de localStorage. Siempre mantener autorización en API: ocultar pantallas no corrige S01/S02.

### S15 — Medio: catálogo y asociaciones enumerables fuera de su ámbito

**Evidencia:** `careers/careers.service.ts:44` y `:62`, `subjects/subject.controller.ts:133`, `subjects/subject.service.ts:311`.

GET /careers y detalle públicos incluyen `users: true`, exponiendo ids de usuarios y asociaciones institucionales. GET /subjects sólo exige JWT y devuelve todas las materias sin filtrar por carrera del usuario, aunque las rutas específicas sí hacen ese control. Esto facilita descubrir relaciones e identificadores para los otros fallos.

**Corrección:** catálogo público mínimo y paginado, sin membresías; rutas administrativas separadas; filtrar materias por ámbito permitido. Si todo el catálogo es intencionalmente público, documentarlo, pero no publicar asociaciones personales.

### S16 — Alto: autenticación y registro sin controles contra abuso

**Evidencia:** AuthController, AuthService, AppModule y main.ts; no hay throttler/rate limiter ni equivalente en el repositorio.

Login, registro y procesamiento de archivos carecen de límites de frecuencia propios. Registro distingue correo existente (409); no verifica propiedad del correo. Junto con contraseñas de un carácter y hashes expuestos aumenta el riesgo de fuerza bruta y creación masiva de cuentas.

**Validación:** revisión estática; no se hizo fuerza bruta ni carga. Un proxy de producción podría añadir límites, pero no fue inspeccionado.

**Corrección:** límites por IP y cuenta, observación de fallos, verificación de email, política de contraseña efectiva y controles adicionales para administradores.

### S17 — Alto/crítico según plataforma: dependencias con avisos conocidos

`pnpm audit --prod --json` informó 105 entradas: 6 críticas, 43 altas, 46 moderadas y 10 bajas; afectan 23 nombres de paquetes. Son avisos/ocurrencias de dependencias, no 105 ataques confirmados sobre esta aplicación. Incluye dependencias transitivas de herramientas como shadcn; su presencia no implica que todas se ejecuten en peticiones web.

Next instalado: 16.2.10. Existe un aviso crítico de ejecución remota en servidores Windows, rango >=16.0.0 <16.3.3, relevante para el entorno actual; no se intentó explotar. Otros avisos de imágenes dependen de plataforma/uso (p. ej. glibc Linux), y los de Server Actions, proxy, cache u OG necesitan analizar si esas funciones se utilizan. Multer instalado 2.2.0 aparece en seis avisos, especialmente denegación de servicio; las cargas sí están expuestas.

**Corrección:** actualizar y probar el conjunto de dependencias y lockfiles; con los avisos de esta fecha, Next >=16.4.1 y Multer >=2.5.0 cubren los rangos señalados para esos paquetes, pero hay que volver a ejecutar audit para todo el árbol. No se actualizaron versiones durante el diagnóstico.

Fuentes: [aviso de Windows](https://github.com/advisories/GHSA-p293-qw3h-jr36), [aviso SVG y condiciones Linux](https://github.com/advisories/GHSA-2464-fhr4-w9xw). Reporte completo de npm guardado en `apps/api/.temp/dependency-audit.json`.

## Matriz de permisos observada

| Operación | Visitante | Docente | Observación |
| --- | --- | --- | --- |
| Crear/editar universidades | Permitido | Permitido | Debe exigir administrador |
| Crear/editar/borrar facultades y carreras | Permitido | Permitido | Cascadas y escrituras anidadas |
| Leer/modificar/eliminar solicitudes | Permitido | Permitido | Sin filtro de propietario |
| Descargar material por id | Permitido | Permitido | También de hipertexto privado |
| Leer hipertexto publicado | Permitido | Permitido | Es intencional, pero devuelve secretos |
| Leer hipertexto privado por su ruta directa | 401 | Sólo propietario | Control directo correcto; bypass por materias |
| Editar configuración/imagen/publicar hipertexto por su ruta directa | 401 | Sólo propietario | Filtro userId presente |
| Listar todas las materias | 401 | Permitido | No filtra carreras |
| Consultar/editar materia específica | 401 | Según UserCareer | Usuario puede autoasignarse; update acepta relaciones |
| Borrar materia por su ruta directa | 401 | 403 | Comprobación SUPER_ADMIN presente |
| Abrir panel /dashboard | Permitido | Permitido | Sin control de acceso web |

## Otros pendientes y límites

- `publish()` no impone en servidor estructura confirmada ni mínimo de contenido; el umbral del 30% se calcula aparte. Con cero temas, la comparación 0 >= 0 puede producir canGenerate=true. Es una regla de publicación a definir, además del bypass S03.
- No hay headers de seguridad configurados (CSP, anti framing y nosniff) en web/API; el endpoint /auth muestra X-Powered-By y no envía Cache-Control. Las respuestas personales deben usar una política como private/no-store. No se demostró una fuga a través de un caché compartido.
- MaterialViewer escribe datos de materiales en console.log. No hay trazabilidad explícita de cambios administrativos/roles que facilite detectar abusos.
- El .gitignore raíz contiene un fragmento de PowerShell en lugar de sólo patrones. Los .env actuales sí están ignorados por reglas efectivas; no están versionados y no apareció historial de esos dos archivos. Esto no equivale a un escaneo completo de secretos de toda la historia.
- `apps/api/test-material.ts` escribe una contraseña en texto plano y no fija un datasource de pruebas. Si se ejecuta con la configuración habitual, usa la base configurada. No se ejecutó durante esta auditoría. Las pruebas deben usar base aislada y hashing coherente.
- Los tests existentes son principalmente de creación de clases/Hello World; no contienen una matriz de autorización ni pruebas entre usuarios.
- Hay módulos `material` y `materials` duplicados; AppModule registra el singular. Los hallazgos se refieren a rutas activas, no a una ruta antigua que no esté montada.
- No se encontraron consultas SQL raw, eval/exec con entradas del usuario ni dangerouslySetInnerHTML en las rutas revisadas. Esto no descarta todas las formas de inyección; la inyección de operaciones Prisma sí quedó demostrada.
- CORS restringido a localhost no es un firewall ni control de rol. HTTPS, firewall, exposición de puertos y protección de PostgreSQL en producción quedan pendientes de revisión del despliegue. El compose local publica PostgreSQL con credenciales de desarrollo conocidas.

## Orden de corrección

1. Cerrar mutaciones anónimas y escrituras anidadas; filtrar respuestas para eliminar secretos.
2. Definir y aplicar permisos por rol, propietario/coautor y ámbito institucional, incluyendo archivos.
3. Validación estricta de todos los cuerpos y vinculación de cargas a su propietario.
4. Actualizar dependencias vulnerables, endurecer cargas y limitar consumo/abuso.
5. Revocación de sesiones, bootstrap de administrador, protección de rutas web y cabeceras.
6. Pruebas permanentes de visitante/docente A/docente B/admin para cada operación; sólo después reabrir exposición pública.

## Artefactos de comprobación

- `apps/api/test/security-audit.cjs`: reproducción con base local dedicada, cuentas sintéticas y R2 simulado. No usa Neon.
- `security-audit-results.json`: resultados HTTP y comprobaciones de las 23 peticiones/escenarios aislados, incluidos controles que deben seguir denegando acceso.
- `apps/api/.temp/dependency-audit.json`: salida detallada de dependencias.

Para repetir: crear una base local vacía llamada exactamente `aura_security_audit_20261111`, aplicar las migraciones con DATABASE_URL apuntando a localhost:5433 y ejecutar el script desde apps/api después de compilar la API. El script fija la URL local y un secreto JWT de prueba antes de cargar AppModule. Requiere que R2Service pueda construirse con las variables habituales, pero reemplaza la única operación de almacenamiento utilizada; no llama al bucket real. La base temporal se eliminó al finalizar esta revisión.
