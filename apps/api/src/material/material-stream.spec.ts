import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Readable } from 'node:stream';
import request from 'supertest';
import { MaterialController } from './material.controller';
import { MaterialService } from './material.service';
import { R2Service } from '../storage/r2.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';

describe('Mobile material streaming', () => {
  const material = { url: 'users/teacher/materials/video.mp4' };
  const service = { getMaterialById: jest.fn() };
  const storage = { getFile: jest.fn(), headFile: jest.fn() };
  const bytes = Buffer.from('0123456789');
  let app: any;
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [MaterialController],
      providers: [
        { provide: MaterialService, useValue: service },
        { provide: R2Service, useValue: storage },
        { provide: JwtService, useValue: {} },
        { provide: JwtStrategy, useValue: {} },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => app.close());
  beforeEach(() => {
    jest.resetAllMocks();
    service.getMaterialById.mockResolvedValue(material);
    storage.headFile.mockResolvedValue({
      ContentLength: bytes.length,
      ETag: '"version-1"',
    });
    storage.getFile.mockImplementation((_key, range) => {
      const partial = range === 'bytes=2-5';
      const data = partial ? bytes.subarray(2, 6) : bytes;
      return Promise.resolve({
        Body: Readable.from([data]),
        ContentType: 'video/mp4',
        ContentLength: data.length,
        ContentRange: partial ? 'bytes 2-5/10' : undefined,
        ETag: '"version-1"',
      });
    });
  });
  it('streams a byte range with matching headers for mobile seeking', async () => {
    const response = await request(app.getHttpServer())
      .get('/materials/file/video')
      .set('Range', 'bytes=2-5')
      .expect(206)
      .expect('Content-Range', 'bytes 2-5/10')
      .expect('Content-Length', '4')
      .expect('Accept-Ranges', 'bytes');
    expect(response.body).toEqual(bytes.subarray(2, 6));
    expect(storage.getFile).toHaveBeenCalledWith(material.url, 'bytes=2-5');
  });
  it('returns the full stream without a range', async () => {
    await request(app.getHttpServer())
      .get('/materials/file/video')
      .expect(200)
      .expect('Content-Length', '10');
    expect(storage.getFile).toHaveBeenCalledWith(material.url, undefined);
  });
  it('forwards suffix ranges and ignores unsupported multiple ranges', async () => {
    await request(app.getHttpServer())
      .get('/materials/file/video')
      .set('Range', 'bytes=-4')
      .expect(200);
    expect(storage.getFile).toHaveBeenLastCalledWith(material.url, 'bytes=-4');
    await request(app.getHttpServer())
      .get('/materials/file/video')
      .set('Range', 'bytes=0-1,4-5')
      .expect(200);
    expect(storage.getFile).toHaveBeenLastCalledWith(material.url, undefined);
  });
  it('honors If-Range and falls back to the full stream when the version differs', async () => {
    await request(app.getHttpServer())
      .get('/materials/file/video')
      .set('Range', 'bytes=2-5')
      .set('If-Range', '"version-1"')
      .expect(206);
    await request(app.getHttpServer())
      .get('/materials/file/video')
      .set('Range', 'bytes=2-5')
      .set('If-Range', '"old-version"')
      .expect(200);
    expect(storage.getFile).toHaveBeenLastCalledWith(material.url, undefined);
  });
  it('reports an unsatisfiable range without crashing the stream', async () => {
    storage.getFile.mockRejectedValue({ name: 'InvalidRange' });
    await request(app.getHttpServer())
      .get('/materials/file/video')
      .set('Range', 'bytes=100-')
      .expect(416)
      .expect('Content-Range', 'bytes */10');
  });
  it('checks access before reading any file', async () => {
    service.getMaterialById.mockRejectedValue(new NotFoundException());
    await request(app.getHttpServer())
      .get('/materials/file/private')
      .set('Range', 'bytes=0-1')
      .expect(404);
    expect(storage.getFile).not.toHaveBeenCalled();
  });
  it('keeps document extensions in mobile downloads', async () => {
    service.getMaterialById.mockResolvedValue({
      ...material,
      name: 'Programa sesión 1',
    });
    storage.getFile.mockResolvedValue({
      Body: Readable.from([bytes]),
      ContentType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ContentLength: bytes.length,
    });
    const response = await request(app.getHttpServer())
      .get('/materials/file/document')
      .expect(200);
    expect(response.headers['content-disposition']).toContain(
      'attachment; filename="material.docx"',
    );
    expect(response.headers['content-disposition']).toContain(
      "filename*=UTF-8''Programa%20sesi%C3%B3n%201.docx",
    );
  });
});
