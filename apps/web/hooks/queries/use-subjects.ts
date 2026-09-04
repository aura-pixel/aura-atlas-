import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";

import { subjectService } from "@/services/subject/subject.service";

export function useSubjects(
  careerId?: string,
) {
  return useQuery({
    queryKey: queryKeys.subjects(
      careerId ?? "",
    ),

    queryFn: () =>
      subjectService.getAll(),

    enabled: !!careerId,
  });
}