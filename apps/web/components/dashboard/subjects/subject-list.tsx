import { Building2 } from "lucide-react";

import { SubjectCard } from "./subject-card";

import type { Subject } from "@/types/subject";

type SubjectListProps = {
  subjects: Subject[];
};

export function SubjectList({
  subjects,
}: SubjectListProps) {
  if (subjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">
          Aún no hay materias
        </h3>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Crea la primera materia para comenzar a organizar el contenido académico.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {subjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
        />
      ))}
    </div>
  );
}