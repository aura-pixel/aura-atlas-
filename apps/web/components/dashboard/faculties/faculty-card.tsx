"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/dashboard/layout/info-card";

import { FacultyDialog } from "./faculty-dialog";
import { FacultyDeleteDialog } from "./faculty-delete-dialog";

import type { Faculty } from "@/types/faculty";

type FacultyCardProps = {
  faculty: Faculty;
};

export function FacultyCard({
  faculty,
}: FacultyCardProps) {
  const facultyColor = faculty.color ?? "#7D5DFF";

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  const logoSrc = faculty.logoUrl
    ? faculty.logoUrl.startsWith("http")
      ? faculty.logoUrl
      : `${baseUrl}${faculty.logoUrl}`
    : null;

  return (
    <InfoCard
      className="overflow-hidden p-0"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <FacultyDialog
              mode="edit"
              universityId={faculty.universityId}
              faculty={faculty}
            />

            <FacultyDeleteDialog
              faculty={faculty}
            />
          </div>

          <Link href={`/dashboard/faculties/${faculty.id}`}>
            <Button variant="ghost">
              Administrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      }
    >
      {/* Barra superior de color */}
      <div
        className="h-2 w-full"
        style={{
          backgroundColor: `${facultyColor}33`,
        }}
      />

      <div className="flex items-start gap-4 px-6 pt-6">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl border"
          style={{
            backgroundColor: `${facultyColor}20`,
            borderColor: facultyColor,
          }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={faculty.name}
              className="h-10 w-10 object-contain"
            />
          ) : (
            <Building2
              className="h-7 w-7"
              style={{
                color: facultyColor,
              }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">
            {faculty.name}
          </h2>

          {faculty.abbreviation && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {faculty.abbreviation}
            </p>
          )}

          {faculty.description && (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {faculty.description}
            </p>
          )}
        </div>
      </div>
    </InfoCard>
  );
}