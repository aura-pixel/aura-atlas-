import { PageHeader } from "@/components/dashboard/layout/page-header";

import { UniversityDialog } from "./university-dialog";
import { UniversityCard } from "./university-card";

import type { University } from "@/types/university";

type UniversityPageProps = {
  universities: University[];
};

export function UniversityPage({
  universities,
}: UniversityPageProps) {
  return (
    <>
      <PageHeader
        title="Universidades"
        description="Administra las universidades registradas en Aura Atlas."
        action={<UniversityDialog />}
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {universities.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
            <h3 className="text-lg font-semibold">
              No hay universidades registradas
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Crea tu primera universidad para comenzar a administrar Aura Atlas.
            </p>
          </div>
        ) : (
          universities.map((university) => (
            <UniversityCard
              key={university.id}
              university={university}
            />
          ))
        )}
      </div>
    </>
  );
}