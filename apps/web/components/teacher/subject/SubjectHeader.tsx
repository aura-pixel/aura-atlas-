import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
} from "lucide-react";

import type { Subject } from "./types";

type SubjectHeaderProps = {
  subject: Subject;
};

export function SubjectHeader({
  subject,
}: SubjectHeaderProps) {
  const subjectColor =
    subject.color || "#4A1115";

  return (
    <header className="relative overflow-hidden border-b border-[#4A1115]/10 bg-[#FFFDF8]">

      {/* =====================================================
          DECORACIÓN
      ====================================================== */}

      <div
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full opacity-20 blur-3xl"
        style={{
          backgroundColor: subjectColor,
        }}
      />

      <div className="pointer-events-none absolute bottom-[-100px] left-1/3 h-64 w-64 rounded-full bg-[#E8AFC0]/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-8 lg:px-10">

        {/* =================================================
            REGRESAR
        ================================================== */}

        <Link
          href="/teacher/dashboard"
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#687584] transition-all hover:bg-[#F7F1E7] hover:text-[#4A1115]"
        >

          <ArrowLeft className="h-4 w-4" />

          Mis materias

        </Link>


        {/* =================================================
            INFORMACIÓN PRINCIPAL
        ================================================== */}

        <div className="mt-9 flex flex-col gap-7 sm:flex-row sm:items-center">

          {/* Imagen / icono */}

          <div
            className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.75rem] text-white shadow-lg"
            style={{
              backgroundColor: subjectColor,
            }}
          >

            {subject.logoUrl ? (
              <img
                src={subject.logoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <BookOpen className="h-8 w-8" />
            )}

          </div>


          {/* Información */}

          <div className="min-w-0 flex-1">

            {/* Contexto */}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-[#687584]">

              <span className="flex items-center gap-1.5">

                <GraduationCap className="h-3.5 w-3.5 text-[#4A1115]" />

                {subject.career.name}

              </span>

              <span className="text-[#4A1115]/30">
                /
              </span>

              <span>
                {subject.career.faculty.name}
              </span>

              <span className="text-[#4A1115]/30">
                /
              </span>

              <span>
                {subject.career.faculty.university.name}
              </span>

            </div>


            {/* Nombre */}

            <div className="mt-3 flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold tracking-[-0.04em] text-[#211719] sm:text-4xl lg:text-5xl">
                {subject.name}
              </h1>

              {subject.abbreviation && (
                <span
                  className="rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em]"
                  style={{
                    backgroundColor: `${subjectColor}12`,
                    color: subjectColor,
                  }}
                >
                  {subject.abbreviation}
                </span>
              )}

            </div>


            {/* Descripción */}

            {subject.description && (
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#687584] sm:text-base">
                {subject.description}
              </p>
            )}

          </div>


          {/* Identidad */}

          <div className="hidden shrink-0 sm:block">

            <div className="rounded-2xl border border-[#4A1115]/10 bg-[#F7F1E7] px-5 py-4 text-right">

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#687584]">
                Materia
              </p>

              <div className="mt-2 flex items-center justify-end gap-2">

                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      subjectColor,
                  }}
                />

                <span className="text-xs font-semibold text-[#4A1115]">
                  Espacio activo
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </header>
  );
}