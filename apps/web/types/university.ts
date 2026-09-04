export interface University {
  id: string;
  name: string;
  abbreviation: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUniversityData {
  name: string;
  abbreviation: string;
  description?: string;
}

export type UpdateUniversityData =
  Partial<CreateUniversityData>;