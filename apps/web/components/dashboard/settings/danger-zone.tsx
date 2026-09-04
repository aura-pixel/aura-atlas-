import { Button } from "@/components/ui/button";

export function DangerZone() {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h2 className="text-lg font-semibold text-red-700">
        Zona de peligro
      </h2>

      <p className="mt-2 text-sm text-red-600">
        Eliminar una universidad es una acción irreversible.
      </p>

      <Button
        variant="destructive"
        className="mt-6"
      >
        Eliminar universidad
      </Button>
    </div>
  );
}