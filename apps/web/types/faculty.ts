import type { Career } from "./career";

export interface Faculty {
  id: string;

  name: string;
  abbreviation?: string;
  description?: string | null;

  logoUrl?: string | null;
  color?: string | null;

  universityId: string;

  careers?: Career[];

  createdAt: string;
  updatedAt: string;
}

export interface CreateFacultyData {
  name: string;
  abbreviation?: string;
  description?: string;
  logoUrl?: string;
  color?: string;
  universityId: string;
}

export type UpdateFacultyData =
  Partial<CreateFacultyData>;