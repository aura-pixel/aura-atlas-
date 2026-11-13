import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { Role } from '@prisma/client';

export type Actor = {
  id: string;
  name: string;
  email: string;
  role: Role;
  sessionId: string;
  emailVerified: boolean;
  emailVerificationDeadline: Date;
};
export type AuthenticatedRequest = Request & { user: Actor };
export const AdminOnly = () => SetMetadata('adminOnly', true);
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    if (
      !this.reflector.getAllAndOverride('adminOnly', [
        context.getHandler(),
        context.getClass(),
      ])
    )
      return true;
    if (
      context.switchToHttp().getRequest<{ user?: Actor }>().user?.role !==
      Role.SUPER_ADMIN
    )
      throw new ForbiddenException('Sólo administradores.');
    return true;
  }
}
export const publicAuthor = { id: true, name: true } as const;
export const privateUser = {
  emailVerified: true,
  emailVerificationDeadline: true,
  id: true,
  name: true,
  email: true,
  role: true,
  teacherType: true,
  createdAt: true,
} as const;
