import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EntityHero } from "@/components/shared/entity-hero";
import { SettingsSection } from "@/components/dashboard/settings/settings-section";

import { FacultyForm } from "@/components/dashboard/faculties/faculty-form";

import { CareerDialog } from "@/components/dashboard/careers/career-dialog";
import { CareerList } from "@/components/dashboard/careers/career-list";

import type { Faculty } from "@/types/faculty";
import type { Career } from "@/types/career";

type Props = {
  faculty: Faculty & {
    careers?: Career[];
  };
};

export function FacultySettingsPage({
  faculty,
}: Props) {
  return (
    <div className="space-y-8">
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
        image={faculty.logoUrl}
        title={faculty.name}
        subtitle={faculty.abbreviation ?? ""}
        description="Configura y administra el contenido de esta facultad."
      />

      <SettingsSection
        title="Información general"
        description="Modifica la información principal de esta facultad."
      >
        <FacultyForm
          mode="edit"
          universityId={faculty.universityId}
          faculty={faculty}
        />
      </SettingsSection>

      <SettingsSection
        title="Carreras"
        description="Administra las carreras de esta facultad."
      >
        <div className="space-y-6">
          <div className="flex justify-end">
            <CareerDialog
              facultyId={faculty.id}
            />
          </div>

          <CareerList
            careers={faculty.careers ?? []}
          />
        </div>
      </SettingsSection>
    </div>
  );
}