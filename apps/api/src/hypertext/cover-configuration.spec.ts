import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ConfigurationDto } from '../security/dto';

describe('Hypertext cover configuration', () => {
  it.each([
    '/hypertext/covers/1.png',
    '/hypertext/covers/8.png',
    '/hypertext/covers/minimal-lavender.svg',
    '/hypertext/covers/minimal-night.svg',
    null,
  ])(
    'accepts a catalog cover or the default cover: %s',
    async (coverImageUrl) => {
      expect(
        await validate(plainToInstance(ConfigurationDto, { coverImageUrl })),
      ).toHaveLength(0);
    },
  );
  it.each([
    'data:image/svg+xml,<svg/>',
    'javascript:alert(1)',
    'https://example.org/cover.svg',
    '/hypertext/covers/9.png',
    '/hypertext/covers/../../secret.svg',
    '/hypertext/covers/minimal-unknown.svg',
  ])('rejects non-catalog images: %s', async (coverImageUrl) => {
    expect(
      await validate(plainToInstance(ConfigurationDto, { coverImageUrl })),
    ).not.toHaveLength(0);
  });
});
