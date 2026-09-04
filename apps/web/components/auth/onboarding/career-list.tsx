"use client";

import { Check, BookOpen } from "lucide-react";

import type { Career } from "@/types/career";
import { API_URL } from "@/lib/config";

type CareerListProps = {
  careers: Career[];
  selectedCareer: Career | null;
  onSelect: (career: Career) => void;
};

export function CareerList({
  careers,
  selectedCareer,
  onSelect,
}: CareerListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {careers.map((career) => {
        const isSelected =
          selectedCareer?.id === career.id;

        const logoUrl = career.logoUrl
  ? career.logoUrl.startsWith("http")
    ? career.logoUrl
    : `${API_URL}${career.logoUrl}`
  : null;

        return (
          <button
            key={career.id}
            type="button"
            onClick={() => onSelect(career)}
            className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all duration-200 ${
              isSelected
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border bg-card hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            }`}
          >
            {/* Indicador de selección */}
            <div
              className={`absolute right-5 top-5 flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-transparent"
              }`}
            >
              <Check className="h-4 w-4" />
            </div>

            {/* Decoración */}
            <div
              className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-all group-hover:scale-125"
              style={{
                backgroundColor: career.color
                  ? `${career.color}20`
                  : undefined,
              }}
            />

            {/* Icono / logo */}
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
              {logoUrl ? (
  <img
    src={logoUrl}
                  alt=""
                  className="h-full w-full object-contain"
                />
              ) : (
                <BookOpen className="h-7 w-7" />
              )}
            </div>

            {/* Información */}
            <div className="relative mt-5 pr-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Carrera
              </p>

              <h3 className="mt-2 text-lg font-semibold leading-7 text-foreground">
                {career.name}
              </h3>

              {career.abbreviation && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {career.abbreviation}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}