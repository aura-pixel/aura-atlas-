export interface Subject {
  id: string;

  name: string;
  abbreviation?: string;
  description?: string | null;

  logoUrl?: string | null;
  color?: string | null;

  careerId: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectData {
  name: string;
  abbreviation?: string;
  description?: string;
  logoUrl?: string;
  color?: string;

  careerId: string;
}

export type UpdateSubjectData =
  Partial<CreateSubjectData>;