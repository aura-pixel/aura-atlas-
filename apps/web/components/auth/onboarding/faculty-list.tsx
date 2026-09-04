"use client";

import { Check, Building2 } from "lucide-react";

import type { Faculty } from "@/types/faculty";
import { API_URL } from "@/lib/config";

type FacultyListProps = {
  faculties: Faculty[];
  selectedFaculty: Faculty | null;
  onSelect: (faculty: Faculty) => void;
};

export function FacultyList({
  faculties,
  selectedFaculty,
  onSelect,
}: FacultyListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {faculties.map((faculty) => {
        const isSelected =
          selectedFaculty?.id === faculty.id;

        const logoUrl = faculty.logoUrl
  ? faculty.logoUrl.startsWith("http")
    ? faculty.logoUrl
    : `${API_URL}${faculty.logoUrl}`
  : null;

        return (
          <button
            key={faculty.id}
            type="button"
            onClick={() => onSelect(faculty)}
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
                backgroundColor: faculty.color
                  ? `${faculty.color}20`
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
                <Building2 className="h-7 w-7" />
              )}
            </div>

            {/* Información */}
            <div className="relative mt-5 pr-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Facultad
              </p>

              <h3 className="mt-2 text-lg font-semibold leading-7 text-foreground">
                {faculty.name}
              </h3>

              {faculty.abbreviation && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {faculty.abbreviation}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}