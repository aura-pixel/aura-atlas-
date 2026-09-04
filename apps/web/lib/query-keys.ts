export const queryKeys = {
  universities: ["universities"] as const,

  faculties: (
    universityId: string,
  ) =>
    [
      "faculties",
      universityId,
    ] as const,

  careers: (
    facultyId: string,
  ) =>
    [
      "careers",
      facultyId,
    ] as const,

  subjects: (
    careerId: string,
  ) =>
    [
      "subjects",
      careerId,
    ] as const,

  me: ["me"] as const,
};