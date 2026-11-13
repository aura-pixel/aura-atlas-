import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto';
import { LoginDto } from './login.dto';

describe('bcrypt password byte boundary', () => {
  it.each([RegisterDto, LoginDto])(
    'rejects a password below 72 characters but over 72 UTF-8 bytes',
    async (Dto) => {
      const dto = plainToInstance(Dto, {
        name: 'Teacher',
        email: 'teacher@example.com',
        password: 'é'.repeat(40),
      });
      const errors = await validate(dto);
      expect(
        errors.some(
          (error) =>
            error.property === 'password' && !!error.constraints?.isByteLength,
        ),
      ).toBe(true);
    },
  );
  it('accepts a valid 72-byte password without truncation', async () => {
    const dto = plainToInstance(RegisterDto, {
      name: 'Teacher',
      email: 'teacher@example.com',
      password: 'é'.repeat(36),
    });
    expect(await validate(dto)).toEqual([]);
  });
});
