import type { SubjectProfile } from '@prisma/client';

type SubjectFields = {
  name: string;
  abbreviation?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  color?: string | null;
};
type DisplayOverrides = Pick<
  SubjectProfile,
  'name' | 'abbreviation' | 'description' | 'logoUrl' | 'color'
>;

// Explicit fields prevent profile IDs, ownership or relation data from leaking
// into a Subject response. Empty strings intentionally override a shared value.
export function applySubjectProfile<T extends SubjectFields>(
  subject: T,
  profile: DisplayOverrides | null | undefined,
): T {
  return {
    ...subject,
    name: profile?.name ?? subject.name,
    abbreviation: profile?.abbreviation ?? subject.abbreviation,
    description: profile?.description ?? subject.description,
    logoUrl: profile?.logoUrl ?? subject.logoUrl,
    color: profile?.color ?? subject.color,
  };
}

export const subjectProfileFields = {
  name: true,
  abbreviation: true,
  description: true,
  logoUrl: true,
  color: true,
} as const;
