import { createCrudService } from "../base/crud.service";

import type {
  Subject,
  CreateSubjectData,
  UpdateSubjectData,
} from "@/types/subject";

export const subjectService =
  createCrudService<
    Subject,
    CreateSubjectData,
    UpdateSubjectData
  >("/subjects");