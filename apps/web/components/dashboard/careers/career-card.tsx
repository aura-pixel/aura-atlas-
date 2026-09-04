"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InfoCard } from "@/components/dashboard/layout/info-card";

import { CareerDialog } from "./career-dialog";
import { CareerDeleteDialog } from "./career-delete-dialog";

import type { Career } from "@/types/career";

type CareerCardProps = {
  career: Career;
};

export function CareerCard({
  career,
}: CareerCardProps) {
  const careerColor = career.color ?? "#7D5DFF";

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  const logoSrc = career.logoUrl
    ? career.logoUrl.startsWith("http")
      ? career.logoUrl
      : `${baseUrl}${career.logoUrl}`
    : null;

  return (
    <InfoCard
      className="overflow-hidden p-0"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <CareerDialog
              mode="edit"
              facultyId={career.facultyId}
              career={career}
            />

            <CareerDeleteDialog
              career={career}
            />
          </div>

          <Link href={`/dashboard/careers/${career.id}`}>
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
          backgroundColor: `${careerColor}33`,
        }}
      />

      <div className="flex items-start gap-4 px-6 pt-6">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl border"
          style={{
            backgroundColor: `${careerColor}20`,
            borderColor: careerColor,
          }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={career.name}
              className="h-10 w-10 object-contain"
            />
          ) : (
            <Building2
              className="h-7 w-7"
              style={{
                color: careerColor,
              }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">
            {career.name}
          </h2>

          {career.abbreviation && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {career.abbreviation}
            </p>
          )}

          {career.description && (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {career.description}
            </p>
          )}
        </div>
      </div>
    </InfoCard>
  );
}