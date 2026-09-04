import { Building2 } from "lucide-react";

import { FacultyCard } from "./faculty-card";

import type { Faculty } from "@/types/faculty";

type FacultyListProps = {
  faculties: Faculty[];
};

export function FacultyList({
  faculties,
}: FacultyListProps) {
  if (faculties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
        <Building2 className="mb-4 h-12 w-12 text-muted-foreground" />

        <h3 className="text-lg font-semibold">
          Aún no hay facultades
        </h3>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Crea la primera facultad para comenzar a organizar las carreras y materias de esta universidad.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {faculties.map((faculty) => (
        <FacultyCard
          key={faculty.id}
          faculty={faculty}
        />
      ))}
    </div>
  );
}