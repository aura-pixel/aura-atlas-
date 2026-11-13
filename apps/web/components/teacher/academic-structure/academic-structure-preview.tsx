"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Layers3,
  Sparkles,
} from "lucide-react";

import type { AcademicStructure } from "@/components/teacher/subject/types";
import { Button } from "@/components/ui/button";

interface AcademicStructurePreviewProps {
  structure: AcademicStructure;
  onContinue: () => void;
  onBack: () => void;
}

export function AcademicStructurePreview({
  structure,
  onContinue,
  onBack,
}: AcademicStructurePreviewProps) {
  const totalTopics = structure.units.reduce(
    (total, unit) =>
      total + unit.topics.length,
    0,
  );

  const totalSubtopics = structure.units.reduce(
    (total, unit) =>
      total +
      unit.topics.reduce(
        (topicTotal, topic) =>
          topicTotal + topic.subtopics.length,
        0,
      ),
    0,
  );

  return (
    <section className="w-full">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>

          <div className="flex items-center gap-2">

            <Sparkles className="h-4 w-4 text-[#4A1115]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
              Revisión
            </span>

          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#211719] sm:text-3xl">
            Esta es la estructura que encontramos.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#687584]">
            Revisa el resultado del análisis antes de continuar.
            Después podrás trabajar el contenido de cada tema.
          </p>

        </div>


        {/* Resumen */}

        <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[#4A1115]/10 bg-[#FFFDF8] px-4 py-3 shadow-sm">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115]">
            <Layers3 className="h-4 w-4" />
          </div>

          <div>

            <p className="text-sm font-bold text-[#211719]">
              {structure.units.length}{" "}
              {structure.units.length === 1
                ? "unidad"
                : "unidades"}
            </p>

            <p className="text-[11px] text-[#687584]">
              {totalTopics} temas · {totalSubtopics} subtemas
            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          OBJETIVO DE LA MATERIA
      ====================================================== */}

      {structure.subjectObjective && (
        <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#4A1115] p-7 text-[#FFFDF8] shadow-lg shadow-[#4A1115]/10">

          {/* Decoración */}

          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#E8AFC0]/20 blur-3xl" />

          <div className="relative">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#E8AFC0]">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8AFC0]">
                  Objetivo de la materia
                </p>

                <h3 className="mt-2 text-xl font-bold">
                  ¿Qué busca lograr esta unidad de aprendizaje?
                </h3>

              </div>

            </div>

            <p className="mt-6 max-w-4xl text-sm leading-7 text-white/70">
              {structure.subjectObjective}
            </p>

          </div>

        </div>
      )}


      {/* =====================================================
          UNIDADES
      ====================================================== */}

      <div className="space-y-4">

        {structure.units.map((unit) => (
          <details
            key={unit.number}
            open
            className="group overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] shadow-sm"
          >

            {/* =================================================
                UNIT HEADER
            ================================================== */}

            <summary className="flex cursor-pointer list-none items-center gap-4 p-5 transition-colors hover:bg-[#F7F1E7]/60 sm:p-6">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#4A1115] text-sm font-bold text-[#FFFDF8] shadow-md shadow-[#4A1115]/10">
                {unit.number}
              </div>


              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4A1115]">
                    Unidad {unit.number}
                  </span>

                  <span className="hidden h-1 w-1 rounded-full bg-[#C9829B] sm:block" />

                  <span className="hidden text-[10px] text-[#687584] sm:block">
                    {unit.topics.length}{" "}
                    {unit.topics.length === 1
                      ? "tema"
                      : "temas"}
                  </span>

                </div>

                <h3 className="mt-1 truncate text-lg font-bold text-[#211719]">
                  {unit.title}
                </h3>

              </div>


              <ChevronDown className="h-5 w-5 shrink-0 text-[#687584] transition-transform duration-300 group-open:rotate-180" />

            </summary>


            {/* =================================================
                UNIT CONTENT
            ================================================== */}

            <div className="border-t border-[#4A1115]/10 bg-[#F7F1E7]/40 px-5 pb-6 pt-5 sm:px-6">

              {/* Objetivo */}

              {unit.objective && (
                <div className="rounded-2xl border border-[#4A1115]/10 bg-[#FFFDF8] p-5">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4A1115]">
                    Objetivo de la unidad
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#687584]">
                    {unit.objective}
                  </p>

                </div>
              )}


              {/* Temas */}

              {unit.topics.length > 0 && (
                <div className={unit.objective ? "mt-6" : ""}>

                  <div className="mb-3 flex items-center justify-between">

                    <p className="text-sm font-bold text-[#211719]">
                      Temas
                    </p>

                    <span className="text-xs text-[#687584]">
                      {unit.topics.length}{" "}
                      {unit.topics.length === 1
                        ? "tema"
                        : "temas"}
                    </span>

                  </div>


                  <div className="space-y-2">

                    {unit.topics.map(
                      (topic) => (
                        <div
                          key={topic.number}
                          className="group/topic rounded-2xl border border-[#4A1115]/10 bg-[#FFFDF8] p-4 transition-all duration-200 hover:border-[#4A1115]/20 hover:shadow-sm"
                        >

                          <div className="flex items-start gap-3">

                            {/* Número */}

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E8AFC0]/30 text-[10px] font-bold text-[#4A1115]">
                              {topic.number}
                            </div>


                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-3">

                                <p className="text-sm font-semibold leading-6 text-[#211719]">
                                  {topic.title}
                                </p>

                                {topic.subtopics.length >
                                  0 && (
                                  <span className="hidden shrink-0 rounded-full bg-[#F7F1E7] px-2.5 py-1 text-[10px] font-medium text-[#687584] sm:block">
                                    {
                                      topic
                                        .subtopics
                                        .length
                                    }{" "}
                                    subtemas
                                  </span>
                                )}

                              </div>


                              {/* Subtemas */}

                              {topic.subtopics.length >
                                0 && (
                                <div className="mt-4 space-y-1.5 border-l border-[#C9829B]/30 pl-4">

                                  {topic.subtopics.map(
                                    (
                                      subtopic,
                                    ) => (
                                      <div
                                        key={
                                          subtopic.number
                                        }
                                        className="flex items-start gap-2"
                                      >

                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9829B]" />

                                        <p className="text-xs leading-6 text-[#687584]">
                                          <span className="font-medium text-[#4A1115]">
                                            {
                                              subtopic.number
                                            }
                                          </span>{" "}
                                          {
                                            subtopic.title
                                          }
                                        </p>

                                      </div>
                                    ),
                                  )}

                                </div>
                              )}

                            </div>

                          </div>

                        </div>
                      ),
                    )}

                  </div>

                </div>
              )}

            </div>

          </details>
        ))}

      </div>


      {/* =====================================================
          CONFIRMACIÓN
      ====================================================== */}

      <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-7 shadow-sm">

        <div className="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-[#C7D8D0]/30 blur-3xl" />

        <div className="relative">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C7D8D0]/50 text-[#4A1115]">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]">
                Último vistazo
              </p>

              <h3 className="mt-2 text-xl font-bold text-[#211719]">
                ¿La estructura se ve correcta?
              </h3>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687584]">
                Al continuar guardaremos esta estructura y podrás comenzar
                a agregar contenido a los temas de tu materia.
              </p>

            </div>

          </div>


          {/* Acciones */}

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#4A1115]/10 pt-6 sm:flex-row sm:justify-end">

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-11 rounded-xl border-[#4A1115]/15 bg-[#FFFDF8] px-5 text-[#4A1115] hover:bg-[#F7F1E7]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a revisar
            </Button>


            <Button
              type="button"
              onClick={onContinue}
              className="h-11 rounded-xl bg-[#4A1115] px-5 text-[#FFFDF8] shadow-lg shadow-[#4A1115]/15 hover:bg-[#5D171D]"
            >
              Confirmar estructura
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

          </div>

        </div>

      </div>

    </section>
  );
}
