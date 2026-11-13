import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Readable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { readdir, rmdir, unlink } from 'node:fs/promises';
import sharp from 'sharp';
import { PublicImagesController } from './public-images.controller';
import { R2Service } from './r2.service';
import { persistLogo } from '../security/uploads';

describe('Persistent public images', () => {
  const storage = { uploadFile: jest.fn(), getFile: jest.fn() };
  let app: any;
  let image: Buffer;
  const filename = `${randomUUID()}.webp`;
  beforeAll(async () => {
    image = await sharp({
      create: { width: 12, height: 12, channels: 3, background: '#aaccbb' },
    })
      .webp()
      .toBuffer();
    const module = await Test.createTestingModule({
      controllers: [PublicImagesController],
      providers: [{ provide: R2Service, useValue: storage }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });
  afterAll(async () => app.close());
  beforeEach(() => jest.resetAllMocks());

  it('serves an image from R2 without a local file', async () => {
    storage.getFile.mockResolvedValue({
      Body: Readable.from([image]),
      ContentLength: image.length,
    });
    const response = await request(app.getHttpServer())
      .get(`/uploads/subjects/teacher/${filename}`)
      .expect(200)
      .expect('Content-Type', /image\/webp/);
    expect(response.body).toEqual(image);
    expect(storage.getFile).toHaveBeenCalledWith(
      `public/uploads/subjects/teacher/${filename}`,
    );
  });
  it('rejects paths that could address private material', async () => {
    await request(app.getHttpServer())
      .get(`/uploads/users/teacher/${filename}`)
      .expect(400);
    await request(app.getHttpServer())
      .get('/uploads/subjects/teacher/private.pdf')
      .expect(400);
    expect(storage.getFile).not.toHaveBeenCalled();
  });
  it('serves older logo URLs after their files are migrated', async () => {
    storage.getFile.mockResolvedValue({
      Body: Readable.from([image]),
      ContentLength: image.length,
    });
    await request(app.getHttpServer())
      .get('/uploads/subjects/1790231359806-242375097.jpeg')
      .expect(200)
      .expect('Content-Type', /image\/webp/);
    expect(storage.getFile).toHaveBeenCalledWith(
      'public/uploads/subjects/1790231359806-242375097.jpeg',
    );
  });
  it('returns 404 for a missing public image', async () => {
    storage.getFile.mockRejectedValue({ name: 'NoSuchKey' });
    await request(app.getHttpServer())
      .get(`/uploads/subjects/teacher/${filename}`)
      .expect(404);
  });
  it('stores optimized logos in R2 and preserves their existing public URL format', async () => {
    const owner = randomUUID();
    const url = await persistLogo(
      { buffer: image } as Express.Multer.File,
      'subjects',
      owner,
      storage as any,
    );
    const file = join(process.cwd(), url!);
    try {
      const [key, bytes, type] = storage.uploadFile.mock.calls[0];
      expect(key).toBe(`public${url}`);
      expect(type).toBe('image/webp');
      expect((await sharp(bytes).metadata()).format).toBe('webp');
    } finally {
      await unlink(file);
      await rmdir(join(process.cwd(), 'uploads', 'subjects', owner));
    }
  });
  it('cleans up the local copy when persistent storage fails', async () => {
    const owner = randomUUID();
    const dir = join(process.cwd(), 'uploads', 'subjects', owner);
    storage.uploadFile.mockRejectedValue(new Error('Storage unavailable'));
    try {
      await expect(
        persistLogo(
          { buffer: image } as Express.Multer.File,
          'subjects',
          owner,
          storage as any,
        ),
      ).rejects.toThrow('Storage unavailable');
      expect(await readdir(dir)).toEqual([]);
    } finally {
      await rmdir(dir);
    }
  });
});
