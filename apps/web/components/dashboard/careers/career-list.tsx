import { Building2 } from "lucide-react";

import { CareerCard } from "./career-card";

import type { Career } from "@/types/career";

type CareerListProps = {
  careers: Career[];
};

export function CareerList({
  careers,
}: CareerListProps) {
  if (careers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground" />

        <h3 className="mt-4 text-lg font-semibold">
          Aún no hay carreras
        </h3>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Crea la primera carrera para comenzar a organizar las materias de esta facultad.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {careers.map((career) => (
        <CareerCard
          key={career.id}
          career={career}
        />
      ))}
    </div>
  );
}