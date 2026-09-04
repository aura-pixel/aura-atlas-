import type { Subject } from "./subject";

export interface Career {
  id: string;

  name: string;
  abbreviation?: string;
  description?: string | null;

  logoUrl?: string | null;
  color?: string | null;

  facultyId: string;

  subjects?: Subject[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerData {
  name: string;
  abbreviation?: string;
  description?: string;
  logoUrl?: string;
  color?: string;

  facultyId: string;
}

export type UpdateCareerData =
  Partial<CreateCareerData>;