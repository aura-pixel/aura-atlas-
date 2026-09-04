import type { University } from "@/types/university";

type UniversitySettingsFormProps = {
  university: University;
};

export function UniversitySettingsForm({
  university,
}: UniversitySettingsFormProps) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <h2 className="text-lg font-semibold">
        Información general
      </h2>

      <p className="mt-2 text-sm text-muted-foreground">
        Aquí podrás editar la información de la universidad.
      </p>
    </div>
  );
}