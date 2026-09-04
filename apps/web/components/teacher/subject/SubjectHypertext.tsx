import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Globe2,
  Sparkles,
} from "lucide-react";

import type { Subject } from "./types";

type HypertextProgress = {
  hypertextId: string;
  totalTopics: number;
  topicsWithContent: number;
  minimumTopics: number;
  percentage: number;
  canGenerate: boolean;
};

type SubjectHypertextProps = {
  subject: Subject;
  hypertextProgress: HypertextProgress | null;
};

export function SubjectHypertext({
  subject,
  hypertextProgress,
}: SubjectHypertextProps) {
  const hypertext =
    subject.hypertexts?.[0];

  if (!hypertext) {
    return (
      <section className="rounded-[2rem] border border-dashed border-[#4A1115]/15 bg-[#FFFDF8] px-6 py-20 text-center">

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">

          <Sparkles className="h-6 w-6" />

        </div>

        <h2 className="mt-5 text-2xl font-bold">
          Tu hipertexto todavía no está listo.
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#687584]">
          Agrega contenido a tu materia para comenzar a construir la experiencia
          que compartirás con tus estudiantes.
        </p>

      </section>
    );
  }

  const isPublished =
    hypertext.isPublished;

  const publicUrl =
  hypertext.slug
    ? `/${subject.career.faculty.university.abbreviation.toLowerCase()}/${subject.career.abbreviation?.toLowerCase()}/${hypertext.slug}`
    : null;

  return (
    <section className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#4A1115] p-8 text-[#FFFDF8] shadow-lg shadow-[#4A1115]/10">

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center">

          <div>

            <div className="flex items-center gap-2">

              <Globe2 className="h-4 w-4 text-[#E8AFC0]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8AFC0]">
                Hipertexto
              </span>

            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-[-0.04em]">
              {hypertext.title}
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              {hypertext.description ??
                "Este es el espacio que compartirás con tus estudiantes."}
            </p>

          </div>


          <div className="shrink-0">

            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold">

              <span
                className={`h-2 w-2 rounded-full ${
                  isPublished
                    ? "bg-[#E8AFC0]"
                    : "bg-white/30"
                }`}
              />

              {isPublished
                ? "Publicado"
                : "En construcción"}

            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          PROGRESO
      ====================================================== */}

      {hypertextProgress && (
        <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-7 shadow-sm">

          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]">
                Preparación
              </p>

              <h3 className="mt-2 text-xl font-bold">
                {hypertextProgress.canGenerate
                  ? "Tu contenido está listo."
                  : "Todavía hay contenido por construir."}
              </h3>

              <p className="mt-2 text-sm text-[#687584]">
                {hypertextProgress.topicsWithContent} de{" "}
                {hypertextProgress.totalTopics} temas cuentan con contenido.
              </p>

            </div>

            <div className="text-right">

              <span className="text-3xl font-bold text-[#4A1115]">
                {hypertextProgress.percentage}%
              </span>

            </div>

          </div>

          <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#F0E8DC]">

            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(
                  hypertextProgress.percentage,
                  100,
                )}%`,
                backgroundColor:
                  subject.color ||
                  "#4A1115",
              }}
            />

          </div>

        </div>
      )}


      {/* =====================================================
          ACCIONES
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2">

        <Link
          href={`/teacher/hypertexts/${hypertext.id}`}
          className="group rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >

          <div className="flex items-center justify-between">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115]">
              <Sparkles className="h-5 w-5" />
            </div>

            <ArrowRight className="h-5 w-5 text-[#687584] transition-transform group-hover:translate-x-1 group-hover:text-[#4A1115]" />

          </div>

          <h3 className="mt-6 text-lg font-bold">
            Editar hipertexto
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#687584]">
            Personaliza y revisa la experiencia antes de compartirla.
          </p>

        </Link>


        {isPublished && publicUrl ? (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-[1.75rem] border border-[#4A1115]/10 bg-[#4A1115] p-6 text-[#FFFDF8] shadow-lg shadow-[#4A1115]/10 transition-all hover:-translate-y-1"
          >

            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                <ExternalLink className="h-5 w-5 text-[#E8AFC0]" />
              </div>

              <ArrowRight className="h-5 w-5 text-white/50 transition-transform group-hover:translate-x-1 group-hover:text-[#E8AFC0]" />

            </div>

            <h3 className="mt-6 text-lg font-bold">
              Ver hipertexto público
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/60">
              Abre la versión que recibirán tus estudiantes.
            </p>

          </a>
        ) : (
          <div className="rounded-[1.75rem] border border-dashed border-[#4A1115]/15 bg-[#F7F1E7] p-6">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFFDF8] text-[#4A1115]">
              <Globe2 className="h-5 w-5" />
            </div>

            <h3 className="mt-6 text-lg font-bold">
              Aún no está publicado
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#687584]">
              Cuando esté listo podrás generar y compartir su enlace público.
            </p>

          </div>
        )}

      </div>

    </section>
  );
}