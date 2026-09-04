import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import { careerService } from "@/services/career/career.service";

export function useCareers(
  facultyId?: string,
) {
  return useQuery({
    queryKey: queryKeys.careers(
      facultyId ?? "",
    ),

    queryFn: () =>
      careerService.getByFaculty(
        facultyId!,
      ),

    enabled: !!facultyId,
  });
}