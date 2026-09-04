"use client";

import Image from "next/image";
import { Check, GraduationCap } from "lucide-react";

import type { University } from "@/types/university";
import { API_URL } from "@/lib/config";

type UniversityListProps = {
  universities: University[];
  selectedUniversity: University | null;
  onSelect: (university: University) => void;
};

export function UniversityList({
  universities,
  selectedUniversity,
  onSelect,
}: UniversityListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {universities.map((university) => {
        const isSelected = selectedUniversity?.id === university.id;

        const logoUrl = university.logoUrl
          ? university.logoUrl.startsWith("http")
            ? university.logoUrl
            : `${API_URL}${university.logoUrl}`
          : null;

        return (
          <button
            key={university.id}
            type="button"
            onClick={() => onSelect(university)}
            aria-pressed={isSelected}
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
            <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />

            {/* Logo */}
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`Logo de ${university.name}`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              ) : (
                <GraduationCap className="h-7 w-7" />
              )}
            </div>

            {/* Información */}
            <div className="relative mt-5 pr-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Universidad
              </p>

              <h3 className="mt-2 text-lg font-semibold leading-7 text-foreground">
                {university.name}
              </h3>

              {university.abbreviation && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {university.abbreviation}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}