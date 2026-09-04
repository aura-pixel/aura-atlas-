import { get } from "@/lib/api";

import { createCrudService } from "../base/crud.service";

import type {
  Faculty,
  CreateFacultyData,
  UpdateFacultyData,
} from "@/types/faculty";

export const facultyService = {
  ...createCrudService<
    Faculty,
    CreateFacultyData,
    UpdateFacultyData
  >("/faculties"),

  getByUniversity(
    universityId: string,
  ) {
    return get<Faculty[]>(
      `/faculties?universityId=${universityId}`,
    );
  },
};