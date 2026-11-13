import type { Prisma } from '@prisma/client';

export type CatalogActor = { id: string; role: string };
export function visibleUniversities(
  user?: CatalogActor,
): Prisma.UniversityWhereInput {
  if (user?.role === 'SUPER_ADMIN') return {};
  return {
    OR: [
      { approvalStatus: 'APPROVED' },
      ...(user ? [{ createdById: user.id }] : []),
    ],
  };
}
export const normalizedName = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');

export function visibleFaculties(
  user?: CatalogActor,
): Prisma.FacultyWhereInput {
  if (user?.role === 'SUPER_ADMIN') return {};
  return {
    university: visibleUniversities(user),
    OR: [
      { approvalStatus: 'APPROVED' },
      ...(user ? [{ createdById: user.id }] : []),
    ],
  };
}
