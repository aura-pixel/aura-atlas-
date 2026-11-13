import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, MaterialType, Material } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../storage/r2.service';
import { ContentMatcher } from '../academic-structure/classifiers/content-matcher';
import { PdfHypertextExtractor } from './extractor/pdf-hypertext.extractor';
import { inspectMaterial } from '../security/uploads';
import { SaveMaterialDto } from '../security/dto';
@Injectable()
export class MaterialService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly prisma: PrismaService,
    private readonly matcher: ContentMatcher,
    private readonly extractor: PdfHypertextExtractor,
    private readonly r2: R2Service,
  ) {}
  private timer?: NodeJS.Timeout;
  onModuleInit() {
    this.timer = setInterval(() => {
      void this.cleanup().catch(() => undefined);
    }, 15 * 60_000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  async cleanup() {
    const old = await this.prisma.pendingUpload.findMany({
      where: { expiresAt: { lt: new Date() } },
      orderBy: { expiresAt: 'asc' },
      take: 50,
    });
    for (const row of old) {
      // Re-read under the same lock used by a concurrent claim. Never delete
      // an object which became attached after the cleanup scan started.
      const attached = await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "PendingUpload" WHERE id = ${row.id} FOR UPDATE`;
        const current = await tx.pendingUpload.findUnique({
          where: { id: row.id },
        });
        if (!current) return true;
        if (
          await tx.material.findFirst({
            where: { url: row.key },
            select: { id: true },
          })
        ) {
          await tx.pendingUpload.update({
            where: { id: row.id },
            data: { expiresAt: new Date(Date.now() + 86400000) },
          });
          return true;
        }
        // An expired unclaimed upload cannot subsequently be saved.
        return false;
      });
      if (attached) continue;
      await this.r2.deleteFile(row.key);
      await this.prisma.pendingUpload.deleteMany({ where: { id: row.id } });
    }
  }
  async prepareFiles(
    subjectId: string,
    userId: string,
    files: Express.Multer.File[],
  ) {
    if (!files?.length)
      throw new BadRequestException('No se recibieron archivos.');
    const hyper = await this.prisma.hypertext.findFirst({
      where: { subjectId, userId },
      include: {
        units: { include: { topics: { include: { subtopics: true } } } },
      },
    });
    if (!hyper) throw new NotFoundException('Hipertexto no encontrado.');
    const topics = hyper.units.flatMap((u) => u.topics);
    if (!topics.length)
      throw new BadRequestException(
        'Confirma la estructura antes de subir materiales.',
      );
    const results: Array<
      {
        uploadId: string;
        name: string;
        mimeType: string;
        size: number;
        textLength: number;
        extractionError: string | null;
      } & ReturnType<ContentMatcher['match']>
    > = [];
    for (const file of files) {
      const format = await inspectMaterial(file);
      const id = randomUUID();
      const key = `users/${userId}/${id}.${format.ext}`;
      // Serialize quota reservations for each user across API processes.
      await this.prisma.$transaction(
        async (tx) => {
          await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
          const quota = await tx.pendingUpload.aggregate({
            where: { userId },
            _sum: { size: true },
          });
          const pending = await tx.pendingUpload.count({
            where: { userId, consumed: false },
          });
          if (
            (quota._sum.size || 0) + file.size > 500 * 1024 * 1024 ||
            pending >= 1000
          )
            throw new BadRequestException('Se alcanzó la cuota de archivos.');
          const usedFiles = await tx.material.count({
            where: {
              topic: { unit: { hypertextId: hyper.id } },
              url: { startsWith: 'users/' },
            },
          });
          const reservedFiles = await tx.pendingUpload.count({
            where: {
              userId,
              subjectId,
              consumed: false,
              expiresAt: { gt: new Date() },
            },
          });
          if (usedFiles + reservedFiles >= topics.length) {
            throw new BadRequestException(
              `Tu programa permite hasta ${topics.length} archivos: uno por tema. Los videos y enlaces se añaden por separado.`,
            );
          }
          await tx.pendingUpload.create({
            data: {
              id,
              userId,
              subjectId,
              key,
              name: file.originalname.slice(0, 250),
              mimeType: format.mime,
              size: file.size,
              expiresAt: new Date(Date.now() + 3600000),
            },
          });
        },
        { maxWait: 10_000, timeout: 30_000 },
      );
      try {
        await this.r2.uploadFile(key, file.buffer, format.mime);
      } catch (error) {
        // A network failure can occur after R2 accepted the object. Retain the
        // server-owned key so cleanup can remove it and release the quota.
        await this.prisma.pendingUpload.update({
          where: { id },
          data: { expiresAt: new Date() },
        });
        throw error;
      }
      let text = '';
      let extractionError: string | null = null;
      try {
        if (format.mime === 'application/pdf')
          text = (await this.extractor.extract(file.buffer)).text;
      } catch {
        extractionError =
          'No se pudo extraer el texto. Puedes asignar el tema manualmente.';
      }
      const match = this.matcher.match(file.originalname, text, topics);
      results.push({
        uploadId: id,
        name: file.originalname.slice(0, 250),
        mimeType: format.mime,
        size: file.size,
        textLength: text.length,
        ...match,
        extractionError,
      });
    }
    return {
      hypertextId: hyper.id,
      subjectId,
      totalFiles: files.length,
      totalTopics: topics.length,
      files: results,
    };
  }
  async getHypertextProgress(subjectId: string, userId: string) {
    const hyper = await this.prisma.hypertext.findFirst({
      where: { subjectId, userId },
      include: {
        units: { include: { topics: { include: { materials: true } } } },
      },
    });
    const topics = hyper?.units.flatMap((u) => u.topics) || [];
    const covered = topics.filter((t) => t.materials.length).length;
    return {
      hypertextId: hyper?.id || null,
      totalTopics: topics.length,
      topicsWithContent: covered,
      minimumTopics: Math.ceil(topics.length * 0.3),
      percentage: topics.length
        ? Math.round((covered / topics.length) * 100)
        : 0,
      canGenerate:
        !!hyper?.academicStructureConfirmed &&
        topics.length > 0 &&
        covered >= Math.ceil(topics.length * 0.3),
    };
  }
  async saveMaterials(
    subjectId: string,
    userId: string,
    files: SaveMaterialDto[],
  ) {
    const hyper = await this.prisma.hypertext.findFirst({
      where: { subjectId, userId },
      include: { units: { include: { topics: true } } },
    });
    if (!hyper) throw new NotFoundException();
    const topics = new Map(
      hyper.units.flatMap((u) => u.topics).map((t) => [t.number, t.id]),
    );
    const materials = await this.prisma.$transaction(
      async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
        const rows: Prisma.MaterialCreateManyInput[] = [];
        const created: Material[] = [];
        for (const file of files) {
          const topicId = topics.get(file.topicNumber);
          if (!topicId) throw new BadRequestException('Tema no válido.');
          if (file.uploadId) {
            await tx.$queryRaw`SELECT id FROM "PendingUpload" WHERE id = ${file.uploadId} FOR UPDATE`;
            if (file.url)
              throw new BadRequestException(
                'No envíes una URL para un archivo cargado.',
              );
            const upload = await tx.pendingUpload.findFirst({
              where: {
                id: file.uploadId,
                userId,
                subjectId,
              },
            });
            if (!upload)
              throw new BadRequestException(
                'La carga no existe, ya se utilizó o venció.',
              );
            if (upload.consumed) {
              const existing = await tx.material.findFirst({
                where: {
                  url: upload.key,
                  topic: { unit: { hypertextId: hyper.id } },
                },
              });
              if (!existing)
                throw new BadRequestException('La carga ya se utilizó.');
              // An interrupted response can be retried without duplicating it.
              created.push(existing);
              continue;
            }
            if (upload.expiresAt <= new Date())
              throw new BadRequestException(
                'La carga venció. Vuelve a seleccionar el archivo.',
              );
            const occupied = await tx.material.count({
              where: { topicId, url: { startsWith: 'users/' } },
            });
            if (
              occupied ||
              rows.some(
                (row) =>
                  row.topicId === topicId && row.url?.startsWith('users/'),
              )
            ) {
              throw new BadRequestException(
                'Este tema ya tiene un archivo. Elige otro tema; puedes añadir videos y enlaces por separado.',
              );
            }
            const claimed = await tx.pendingUpload.updateMany({
              where: { id: upload.id, consumed: false },
              data: { consumed: true },
            });
            if (claimed.count !== 1)
              throw new BadRequestException('La carga ya se utilizó.');
            const type: MaterialType =
              upload.mimeType === 'application/pdf'
                ? 'PDF'
                : upload.mimeType.startsWith('image/')
                  ? 'IMAGE'
                  : upload.mimeType.startsWith('video/')
                    ? 'VIDEO'
                    : upload.mimeType.startsWith('audio/')
                      ? 'AUDIO'
                      : 'DOCUMENT';
            rows.push({
              name: upload.name,
              type,
              mimeType: upload.mimeType,
              size: upload.size,
              url: upload.key,
              topicId,
            });
          } else {
            if (!['LINK', 'ARTICLE', 'VIDEO'].includes(file.type))
              throw new BadRequestException(
                'Este material requiere una carga propia.',
              );
            let url: URL;
            try {
              url = new URL(file.url || '');
            } catch {
              throw new BadRequestException('URL inválida.');
            }
            if (
              !['https:', 'http:'].includes(url.protocol) ||
              url.username ||
              url.password
            )
              throw new BadRequestException(
                'Sólo se permiten enlaces HTTP o HTTPS.',
              );
            const duplicate = await tx.material.findFirst({
              where: {
                topicId,
                name: file.name,
                type: file.type,
                url: url.href,
              },
            });
            if (duplicate) {
              created.push(duplicate);
              continue;
            }
            rows.push({
              name: file.name,
              type: file.type,
              mimeType:
                file.type === 'VIDEO' ? 'video/external' : 'text/uri-list',
              size: 0,
              url: url.href,
              topicId,
            });
          }
        }
        for (const row of rows)
          created.push(await tx.material.create({ data: row }));
        return created;
      },
      { maxWait: 10_000, timeout: 30_000 },
    );
    return {
      message: 'Materiales guardados correctamente.',
      total: materials.length,
      materials,
    };
  }
  async getWorkspace(subjectId: string, userId: string) {
    const hyper = await this.prisma.hypertext.findFirst({
      where: { subjectId, userId },
      include: {
        units: {
          orderBy: { number: 'asc' },
          include: { topics: { include: { materials: true } } },
        },
      },
    });
    if (!hyper?.academicStructureConfirmed)
      throw new BadRequestException(
        'Primero confirma tu programa de estudios.',
      );
    const topics = hyper.units.flatMap((unit) => unit.topics);
    const pending = await this.prisma.pendingUpload.findMany({
      where: {
        subjectId,
        userId,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'asc' },
    });
    const resources = topics.flatMap((topic) =>
      topic.materials.map((material) => ({
        id: material.id,
        name: material.name,
        kind: material.url?.startsWith('users/')
          ? 'FILE'
          : material.type === 'VIDEO'
            ? 'VIDEO'
            : 'LINK',
        mimeType: material.mimeType,
        size: material.size ?? 0,
        topicNumber: topic.number,
        topicTitle: topic.title,
        status: 'SAVED',
        ...(material.url?.startsWith('http') ? { url: material.url } : {}),
      })),
    );
    const pendingResources = pending.map((file) => {
      const match = this.matcher.match(file.name, '', topics);
      return {
        id: file.id,
        uploadId: file.id,
        name: file.name,
        kind: 'FILE',
        mimeType: file.mimeType,
        size: file.size,
        topicNumber: null,
        status: 'PENDING',
        suggestedTopic: match.suggestedTopic,
        confidence: match.confidence,
      };
    });
    return {
      resources: [...resources, ...pendingResources],
      limits: {
        maxFiles: topics.length,
        usedFiles: resources.filter((r) => r.kind === 'FILE').length,
        pendingFiles: pending.length,
        maxFileSize: 20 * 1024 * 1024,
      },
    };
  }

  async assignTopic(id: string, userId: string, topicNumber: string) {
    const material = await this.prisma.material.findFirst({
      where: { id, topic: { unit: { hypertext: { userId } } } },
      include: { topic: { include: { unit: true } } },
    });
    if (!material) throw new NotFoundException('Material no encontrado.');
    const topic = await this.prisma.topic.findFirst({
      where: {
        number: topicNumber,
        unit: { hypertextId: material.topic.unit.hypertextId },
      },
    });
    if (!topic)
      throw new BadRequestException('El tema debe pertenecer a esta materia.');
    if (material.url?.startsWith('users/')) {
      return this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
        const occupied = await tx.material.count({
          where: {
            id: { not: id },
            topicId: topic.id,
            url: { startsWith: 'users/' },
          },
        });
        if (occupied)
          throw new BadRequestException(
            'Este tema ya tiene un archivo. Elige otro tema.',
          );
        return tx.material.update({
          where: { id },
          data: { topicId: topic.id },
        });
      });
    }
    return this.prisma.material.update({
      where: { id },
      data: { topicId: topic.id },
    });
  }

  async discardPending(id: string, userId: string) {
    const upload = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "PendingUpload" WHERE id = ${id} FOR UPDATE`;
      const row = await tx.pendingUpload.findFirst({ where: { id, userId } });
      if (!row) throw new NotFoundException('Carga no encontrada.');
      if (row.consumed)
        throw new ConflictException(
          'El archivo ya está guardado. Actualiza la página para verlo.',
        );
      await tx.pendingUpload.update({
        where: { id },
        data: { expiresAt: new Date() },
      });
      return row;
    });
    // Expiry prevents a concurrent save; cleanup can retry a failed deletion.
    await this.r2.deleteFile(upload.key);
    await this.prisma.pendingUpload.deleteMany({
      where: { id, userId, consumed: false },
    });
    return { message: 'Carga descartada.' };
  }

  async getMaterialById(id: string, userId?: string) {
    const row = await this.prisma.material.findFirst({
      where: {
        id,
        topic: {
          unit: {
            hypertext: {
              OR: [
                {
                  isPublished: true,
                  subject: {
                    career: {
                      faculty: {
                        approvalStatus: 'APPROVED',
                        university: { approvalStatus: 'APPROVED' },
                      },
                    },
                  },
                },
                ...(userId ? [{ userId }] : []),
              ],
            },
          },
        },
      },
    });
    if (!row) throw new NotFoundException('Material no encontrado.');
    return row;
  }
}
