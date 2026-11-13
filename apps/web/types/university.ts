import type { Faculty } from "./faculty";
export interface University {
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  id: string;
  name: string;
  abbreviation: string;
  logoUrl?: string | null;
  faculties?: Faculty[];
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
