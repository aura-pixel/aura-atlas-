import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EntityHero } from "@/components/shared/entity-hero";
import { SettingsSection } from "@/components/dashboard/settings/settings-section";
import { UniversityForm } from "@/components/dashboard/universities/university-form";
import { FacultyDialog } from "../faculties/faculty-dialog";
import { FacultyList } from "../faculties/faculty-list";

import type { University } from "@/types/university";

type Props = {
  university: University;
};

export function UniversitySettingsPage({
  university,
}: Props) {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Link href="/dashboard/universities">
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a universidades
        </Button>
      </Link>

      <EntityHero
        image={university.logoUrl ?? undefined}
        title={university.name}
        subtitle={university.abbreviation}
        description="Configura y administra el contenido de esta universidad."
      />

      <SettingsSection
        title="Información general"
        description="Modifica la información principal de esta universidad."
      >
        <UniversityForm
          mode="edit"
          university={university}
        />
      </SettingsSection>

      <SettingsSection
        title="Facultades"
        description="Administra las facultades de esta universidad."
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <FacultyDialog
              universityId={university.id}
            />
          </div>

          <FacultyList
            faculties={university.faculties ?? []}
          />
        </div>
      </SettingsSection>
    </div>
  );
}
