"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function TeacherTypeForm() {
  const router = useRouter();

  const [teacherType, setTeacherType] =
    useState<TeacherType>();

  const TeacherType = {
  ADJUNCT: "ADJUNCT",
  FULL_TIME: "FULL_TIME",
  OTHER: "OTHER",
} as const;

type TeacherType =
  (typeof TeacherType)[keyof typeof TeacherType];

  function handleContinue() {
    router.push("/auth/complete");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Cuéntanos un poco sobre ti
          </h1>

          <p className="mt-2 text-muted-foreground">
            Este dato únicamente se utilizará para
            personalizar tu experiencia dentro de
            Aura Atlas.
          </p>
        </div>

        <div className="space-y-4">
          <Label>Tipo de docente</Label>

          <button
            type="button"
            onClick={() =>
              setTeacherType(
                TeacherType.ADJUNCT,
              )
            }
            className={`w-full rounded-xl border p-4 text-left transition ${
              teacherType ===
              TeacherType.ADJUNCT
                ? "border-primary bg-primary/10"
                : ""
            }`}
          >
            Profesor de asignatura
          </button>

          <button
            type="button"
            onClick={() =>
              setTeacherType(
                TeacherType.FULL_TIME,
              )
            }
            className={`w-full rounded-xl border p-4 text-left transition ${
              teacherType ===
              TeacherType.FULL_TIME
                ? "border-primary bg-primary/10"
                : ""
            }`}
          >
            Profesor de tiempo completo
          </button>

          <button
            type="button"
            onClick={() =>
              setTeacherType(
                TeacherType.OTHER,
              )
            }
            className={`w-full rounded-xl border p-4 text-left transition ${
              teacherType ===
              TeacherType.OTHER
                ? "border-primary bg-primary/10"
                : ""
            }`}
          >
            Otro
          </button>
        </div>

        <Button
          className="w-full"
          disabled={!teacherType}
          onClick={handleContinue}
        >
          Continuar
        </Button>
      </div>
    </main>
  );
}
