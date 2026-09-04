import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Layers3,
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

type SubjectOverviewProps = {
  subject: Subject;
  hypertextProgress: HypertextProgress | null;
};

export function SubjectOverview({
  subject,
  hypertextProgress,
}: SubjectOverviewProps) {
  const hypertext =
    subject.hypertexts?.[0];

  const units =
    hypertext?.units ?? [];

  const topics = units.reduce(
    (total, unit) =>
      total + unit.topics.length,
    0,
  );

  const materials = units.reduce(
    (total, unit) =>
      total +
      unit.topics.reduce(
        (topicTotal, topic) =>
          topicTotal +
          topic.materials.length,
        0,
      ),
    0,
  );

  const percentage =
    hypertextProgress?.percentage ?? 0;

  const isPublished =
    hypertext?.isPublished ?? false;

  return (
    <section className="space-y-6">

      {/* =====================================================
          INTRO
      ====================================================== */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>

          <div className="flex items-center gap-2">

            <Sparkles className="h-4 w-4 text-[#4A1115]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
              Resumen de la materia
            </span>

          </div>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-[#211719]">
            {subject.name}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#687584]">
            Aquí puedes ver cómo va tomando forma tu espacio educativo.
          </p>

        </div>

        <div
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor:
              subject.color || "#4A1115",
          }}
        />

      </div>


      {/* =====================================================
          ESTADO PRINCIPAL
      ====================================================== */}

      <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">

        {/* Progreso */}

        <div className="relative overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-7 shadow-sm">

          <div
            className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full opacity-10 blur-3xl"
            style={{
              backgroundColor:
                subject.color || "#4A1115",
            }}
          />

          <div className="relative">

            <div className="flex items-start justify-between gap-5">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#687584]">
                  Progreso del contenido
                </p>

                <h3 className="mt-2 text-2xl font-bold text-[#211719]">
                  Tu hipertexto está tomando forma.
                </h3>

              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">
                <Layers3 className="h-5 w-5" />
              </div>

            </div>


            <div className="mt-8">

              <div className="flex items-end justify-between">

                <span className="text-sm text-[#687584]">
                  Contenido organizado
                </span>

                <span className="text-2xl font-bold text-[#4A1115]">
                  {percentage}%
                </span>

              </div>

              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#F0E8DC]">

                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      percentage,
                      100,
                    )}%`,
                    backgroundColor:
                      subject.color ||
                      "#4A1115",
                  }}
                />

              </div>

              <p className="mt-3 text-xs text-[#687584]">
                {hypertextProgress
                  ? `${hypertextProgress.topicsWithContent} de ${hypertextProgress.totalTopics} temas tienen contenido.`
                  : "Comienza agregando contenido a tus temas."}
              </p>

            </div>

          </div>

        </div>


        {/* Estado */}

        <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#4A1115] p-7 text-[#FFFDF8] shadow-lg shadow-[#4A1115]/10">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">

            {isPublished ? (
              <CheckCircle2 className="h-5 w-5 text-[#E8AFC0]" />
            ) : (
              <Sparkles className="h-5 w-5 text-[#E8AFC0]" />
            )}

          </div>

          <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8AFC0]">
            Estado
          </p>

          <h3 className="mt-2 text-xl font-bold">
            {isPublished
              ? "Publicado"
              : "En construcción"}
          </h3>

          <p className="mt-2 text-sm leading-6 text-white/65">
            {isPublished
              ? "Tu hipertexto ya está disponible para compartir."
              : "Continúa agregando contenido para preparar tu hipertexto."}
          </p>

        </div>

      </div>


      {/* =====================================================
          MÉTRICAS
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-3">

        <Metric
          icon={Layers3}
          label="Unidades"
          value={units.length}
        />

        <Metric
          icon={BookOpen}
          label="Temas"
          value={topics}
        />

        <Metric
          icon={FileText}
          label="Materiales"
          value={materials}
        />

      </div>


      {/* =====================================================
          ACCESO RÁPIDO
      ====================================================== */}

      <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-7 shadow-sm">

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]">
          Siguiente paso
        </p>

        <div className="mt-4 flex flex-col justify-between gap-5 md:flex-row md:items-center">

          <div>

            <h3 className="text-xl font-bold text-[#211719]">
              {materials === 0
                ? "Comienza agregando contenido."
                : percentage < 100
                  ? "Continúa construyendo tu materia."
                  : "Tu materia está lista para compartir."}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#687584]">
              Puedes navegar entre las secciones para continuar trabajando.
            </p>

          </div>

          <Link
            href="#"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#4A1115] px-5 py-3 text-sm font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/15 transition-all hover:-translate-y-0.5"
          >
            Ver contenidos
            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

      </div>

    </section>
  );
}


function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers3;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[#4A1115]/10 bg-[#FFFDF8] p-5 shadow-sm">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F7F1E7] text-[#4A1115]">
        <Icon className="h-5 w-5" />
      </div>

      <div>

        <p className="text-2xl font-bold text-[#211719]">
          {value}
        </p>

        <p className="text-xs text-[#687584]">
          {label}
        </p>

      </div>

    </div>
  );
}