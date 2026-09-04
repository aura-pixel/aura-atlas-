import { useQuery } from "@tanstack/react-query";

import { universityService } from "@/services/university/university.service";
import { queryKeys } from "@/lib/query-keys";

export function useUniversities() {
  return useQuery({
    queryKey: queryKeys.universities,
    queryFn: () =>
      universityService.getAll(),
  });
}