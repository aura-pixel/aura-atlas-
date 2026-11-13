import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import sharp from 'sharp';
import { R2Service } from '../src/storage/r2.service';
import { publicLogoKey } from '../src/storage/public-logo-key';

async function main() {
  const db = new PrismaClient();
  const apply = process.argv.includes('--apply');
  const storage = new R2Service();
  const result = {
    dryRun: !apply,
    copied: 0,
    alreadyStored: 0,
    recoverable: 0,
    missing: 0,
  };
  try {
    const rows = (
      await Promise.all([
        db.university.findMany({ select: { logoUrl: true } }),
        db.faculty.findMany({ select: { logoUrl: true } }),
        db.career.findMany({ select: { logoUrl: true } }),
        db.subject.findMany({ select: { logoUrl: true } }),
        db.subjectProfile.findMany({ select: { logoUrl: true } }),
      ])
    ).flat();
    const urls = new Set(
      rows
        .map((row) => row.logoUrl)
        .filter((url): url is string => !!url?.startsWith('/uploads/')),
    );
    const root = resolve(process.cwd(), 'uploads') + sep;
    for (const url of urls) {
      const parts = url.split('/');
      if (![4, 5].includes(parts.length))
        throw new Error('Unexpected legacy image path');
      const key = publicLogoKey(parts[2], parts[3], parts[4]);
      const exists = await storage
        .getFile(key)
        .then((image) => {
          const body = image.Body;
          if (body && 'destroy' in body && typeof body.destroy === 'function')
            body.destroy();
          return true;
        })
        .catch(
          (error: {
            name?: string;
            $metadata?: { httpStatusCode?: number };
          }) => {
            if (
              error.name === 'NoSuchKey' ||
              error.name === 'NotFound' ||
              error.$metadata?.httpStatusCode === 404
            )
              return false;
            throw error;
          },
        );
      if (exists) {
        result.alreadyStored++;
        continue;
      }
      const path = resolve(process.cwd(), `.${url}`);
      if (!path.startsWith(root)) throw new Error('Invalid local image path');
      const image = await readFile(path).catch(
        (error: NodeJS.ErrnoException) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        },
      );
      if (!image) {
        result.missing++;
        continue;
      }
      const input = sharp(image, { limitInputPixels: 16_000_000 });
      if (
        !['jpeg', 'png', 'webp'].includes((await input.metadata()).format ?? '')
      )
        throw new Error('Unexpected legacy image format');
      const optimized = await input
        .rotate()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
      result.recoverable++;
      if (apply) {
        await storage.uploadFile(key, optimized, 'image/webp');
        result.copied++;
      }
    }
    console.log(JSON.stringify(result));
  } finally {
    await db.$disconnect();
  }
}
main().catch(
  (error: {
    name?: string;
    code?: string;
    $metadata?: { httpStatusCode?: number };
  }) => {
    console.error(
      'Image migration failed. Check database and storage configuration.',
    );
    console.error(
      JSON.stringify({
        name: error.name,
        code: error.code,
        status: error.$metadata?.httpStatusCode,
      }),
    );
    process.exitCode = 1;
  },
);
