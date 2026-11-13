import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EntityHero } from "@/components/shared/entity-hero";

import { SettingsSection } from "@/components/dashboard/settings/settings-section";

import { CareerForm } from "./career-form";
import { SubjectDialog } from "../subjects/subject-dialog";
import { SubjectList } from "../subjects/subject-list";

import type { Career } from "@/types/career";

type Props = {
  career: Career;
};

export function CareerSettingsPage({
  career,
}: Props) {
  return (
    <div className="space-y-8">
      <Link href="/dashboard/faculties">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a facultades
        </Button>
      </Link>

      <EntityHero
        image={career.logoUrl ?? undefined}
        title={career.name}
        subtitle={career.abbreviation ?? ""}
        description="Configura y administra el contenido de esta carrera."
      />

      <SettingsSection
        title="Información general"
        description="Modifica la información principal de esta carrera."
      >
        <CareerForm
          mode="edit"
          facultyId={career.facultyId}
          career={career}
        />
      </SettingsSection>

      <SettingsSection
        title="Materias"
        description="Administra las materias de esta carrera."
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <SubjectDialog
              careerId={career.id}
            />
          </div>

          <SubjectList
            subjects={career.subjects ?? []}
          />
        </div>
      </SettingsSection>
    </div>
  );
}
