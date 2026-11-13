import 'reflect-metadata';
import { UniversitiesController } from './universities.controller';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../security/access';
describe('UniversitiesController permissions', () => {
  it.each(['create', 'update'])(
    'requires both session and admin role on %s',
    (method) => {
      const handler = UniversitiesController.prototype[method];
      expect(Reflect.getMetadata('adminOnly', handler)).toBe(true);
      expect(Reflect.getMetadata(GUARDS_METADATA, handler)).toEqual(
        expect.arrayContaining([JwtAuthGuard, RolesGuard]),
      );
    },
  );
});
