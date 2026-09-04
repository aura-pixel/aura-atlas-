"use client";

import { Building2 } from "lucide-react";

import { InfoCard } from "@/components/dashboard/layout/info-card";

import { SubjectDialog } from "./subject-dialog";
import { SubjectDeleteDialog } from "./subject-delete-dialog";

import type { Subject } from "@/types/subject";

type SubjectCardProps = {
  subject: Subject;
};

export function SubjectCard({
  subject,
}: SubjectCardProps) {
  const subjectColor = subject.color ?? "#7D5DFF";

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  const logoSrc = subject.logoUrl
    ? subject.logoUrl.startsWith("http")
      ? subject.logoUrl
      : `${baseUrl}${subject.logoUrl}`
    : null;

  return (
    <InfoCard
      className="overflow-hidden p-0"
      footer={
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <SubjectDialog
              mode="edit"
              careerId={subject.careerId}
              subject={subject}
            />

            <SubjectDeleteDialog
              subject={subject}
            />
          </div>
        </div>
      }
    >
      {/* Barra superior de color */}
      <div
        className="h-2 w-full"
        style={{
          backgroundColor: `${subjectColor}33`,
        }}
      />

      <div className="flex items-start gap-4 px-6 pt-6">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl border"
          style={{
            backgroundColor: `${subjectColor}20`,
            borderColor: subjectColor,
          }}
        >
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={subject.name}
              className="h-10 w-10 object-contain"
            />
          ) : (
            <Building2
              className="h-7 w-7"
              style={{
                color: subjectColor,
              }}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">
            {subject.name}
          </h2>

          {subject.abbreviation && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              {subject.abbreviation}
            </p>
          )}

          {subject.description && (
            <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
              {subject.description}
            </p>
          )}
        </div>
      </div>
    </InfoCard>
  );
}