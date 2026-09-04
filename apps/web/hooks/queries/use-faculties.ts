import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import { facultyService } from "@/services/faculty/faculty.service";

export function useFaculties(
  universityId?: string,
) {
  return useQuery({
    queryKey: queryKeys.faculties(
      universityId ?? "",
    ),

    queryFn: () =>
      facultyService.getByUniversity(
        universityId!,
      ),

    enabled: !!universityId,
  });
}