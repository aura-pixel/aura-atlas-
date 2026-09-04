import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/dashboard/layout/info-card";

import type { University } from "@/types/university";
import Link from "next/link";

type UniversityCardProps = {
  university: University;
};

export function UniversityCard({
  university,
}: UniversityCardProps) {
  return (
    <InfoCard
      footer={
  <Link
    href={`/dashboard/universities/${university.id}`}
  >
    <Button
      variant="outline"
      className="w-full"
    >
      Administrar
    </Button>
  </Link>
}
    >
      <div className="flex items-center gap-4">
        {university.logoUrl ? (
          <img
            src={`http://localhost:3000${university.logoUrl}`}
            alt={university.name}
            className="h-16 w-16 rounded-xl border bg-background object-contain p-2"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">
            {university.abbreviation}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {university.name}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        <p>🏛 0 Facultades</p>
        <p>🎓 0 Carreras</p>
      </div>
    </InfoCard>
  );
}