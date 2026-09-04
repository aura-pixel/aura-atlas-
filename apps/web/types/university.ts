export interface University {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniversityData {
  name: string;
  abbreviation: string;
  logoUrl?: string;
  description?: string;
}

export type UpdateUniversityData =
  Partial<CreateUniversityData>;
