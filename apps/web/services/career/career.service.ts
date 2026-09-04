import { get } from "@/lib/api";

import { createCrudService } from "../base/crud.service";

import type {
  Career,
  CreateCareerData,
  UpdateCareerData,
} from "@/types/career";

export const careerService = {
  ...createCrudService<
    Career,
    CreateCareerData,
    UpdateCareerData
  >("/careers"),

  getByFaculty(
    facultyId: string,
  ) {
    return get<Career[]>(
      `/careers?facultyId=${facultyId}`,
    );
  },
};