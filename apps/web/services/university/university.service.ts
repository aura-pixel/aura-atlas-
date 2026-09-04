import { createCrudService } from "../base/crud.service";

import type {
  University,
  CreateUniversityData,
  UpdateUniversityData,
} from "@/types/university";

export const universityService =
  createCrudService<
    University,
    CreateUniversityData,
    UpdateUniversityData
  >("/universities");