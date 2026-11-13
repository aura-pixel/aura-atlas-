import { Logger } from '@nestjs/common';
import { configureSecurity } from './configure';

describe('Production startup and public origin', () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it('starts without SMTP and accepts only the configured public origin', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'a'.repeat(64);
    process.env.FRONTEND_URL = 'https://aura-atlas.netlify.app/';
    delete process.env.SMTP_URL;
    delete process.env.MAIL_FROM;
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const app = {
      disable: jest.fn(),
      use: jest.fn(),
      useGlobalPipes: jest.fn(),
      enableCors: jest.fn(),
    };
    expect(() => configureSecurity(app as any)).not.toThrow();
    expect(warn).toHaveBeenCalled();
    const csrf = app.use.mock.calls[1][0];
    const next = jest.fn();
    const response = {
      setHeader: jest.fn(),
      on: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    csrf(
      { method: 'POST', headers: { origin: 'https://aura-atlas.netlify.app' } },
      response,
      next,
    );
    expect(next).toHaveBeenCalledTimes(1);
    next.mockClear();
    csrf(
      { method: 'POST', headers: { origin: 'https://untrusted.example' } },
      response,
      next,
    );
    expect(next).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(403);
  });

  it('still rejects a JWT secret shorter than 32 characters', () => {
    process.env.NODE_ENV = 'production';
    process.env.JWT_SECRET = 'a'.repeat(20);
    expect(() => configureSecurity({} as any)).toThrow(
      'JWT_SECRET debe tener al menos 32 caracteres.',
    );
  });
});
