"use client";

import {
  ChevronDown,
  ChevronRight,
  FileText,
  FolderOpen,
  Plus,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ContentWizard } from "@/components/teacher/content/content-wizard";

import type {
  ContentUnit,
  Subject,
} from "./types";

type HypertextProgress = {
  hypertextId: string;
  totalTopics: number;
  topicsWithContent: number;
  minimumTopics: number;
  percentage: number;
  canGenerate: boolean;
};

type SubjectContentsProps = {
  subject: Subject;
  hypertextProgress: HypertextProgress | null;
  showContentWizard: boolean;
  onShowContentWizard: (
    value: boolean,
  ) => void;
  onReload: () => void;
  onGoToHypertext: () => void;
};

export function SubjectContents({
  subject,
  hypertextProgress,
  showContentWizard,
  onShowContentWizard,
  onReload,
  onGoToHypertext,
}: SubjectContentsProps) {
  const [openUnits, setOpenUnits] =
    useState<Record<string, boolean>>({});

  const hypertext =
    subject.hypertexts?.[0];

  const units: ContentUnit[] =
    hypertext?.units ?? [];

  function toggleUnit(id: string) {
    setOpenUnits((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  /*
   * Cuando el wizard termina:
   *
   * 1. Cerramos el wizard.
   * 2. Recargamos la información de la materia.
   *
   * Así los materiales recién guardados aparecen
   * inmediatamente en la interfaz.
   */
  function handleWizardClose() {
    onShowContentWizard(false);
    onReload();
  }

  /*
   * Si el wizard está abierto, lo mostramos
   * en lugar del listado normal de contenidos.
   *
   * Esto evita tener el listado y el wizard
   * compitiendo visualmente en la misma pantalla.
   */
  if (showContentWizard) {
    return (
      <section className="space-y-6">

        <ContentWizard
  subjectId={subject.id}
  initialStructure={{ units }}
  onClose={handleWizardClose}
/>

      </section>
    );
  }

  return (
    <section className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

        <div>

          <div className="flex items-center gap-2">

            <Sparkles className="h-4 w-4 text-[#4A1115]" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]">
              Contenido
            </span>

          </div>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
            Construye tu materia.
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#687584]">
            Agrega recursos y materiales a cada tema para darle contenido
            a tu hipertexto.
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-3">

  {hypertextProgress?.canGenerate && (
    <Button
      type="button"
      onClick={onGoToHypertext}
      variant="outline"
      className="rounded-xl border-[#4A1115]/15 bg-[#FFFDF8] text-[#4A1115] hover:bg-[#F7F1E7]"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Ir al hipertexto
    </Button>
  )}

  <Button
    type="button"
    onClick={() =>
      onShowContentWizard(true)
    }
    className="rounded-xl bg-[#4A1115] text-[#FFFDF8] shadow-lg shadow-[#4A1115]/15 hover:bg-[#5D171D]"
  >
    <Plus className="mr-2 h-4 w-4" />
    Agregar contenido
  </Button>

</div>

      </div>


      {/* =====================================================
          PROGRESO
      ====================================================== */}

      {hypertextProgress && (
        <div className="rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-5 shadow-sm">

          <div className="flex items-center justify-between gap-4">

            <div>

              <p className="text-xs font-semibold text-[#211719]">
                Progreso de contenido
              </p>

              <p className="mt-1 text-xs text-[#687584]">
                {hypertextProgress.topicsWithContent} de{" "}
                {hypertextProgress.totalTopics} temas con contenido
              </p>

            </div>

            <span className="text-sm font-bold text-[#4A1115]">
              {hypertextProgress.percentage}%
            </span>

          </div>

          <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#F0E8DC]">

            <div
              className="h-full rounded-full transition-all"
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
          UNIDADES
      ====================================================== */}

      {units.length === 0 ? (

        <div className="rounded-[2rem] border border-dashed border-[#4A1115]/15 bg-[#FFFDF8] px-6 py-16 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">

            <FolderOpen className="h-6 w-6" />

          </div>

          <h3 className="mt-5 text-xl font-bold">
            Todavía no hay contenido.
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#687584]">
            Primero construye la estructura académica de tu materia y después
            podrás agregar materiales.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {units.map((unit) => {

            const isOpen =
              openUnits[unit.id] ??
              false;

            const unitMaterials =
              unit.topics.reduce(
                (total, topic) =>
                  total +
                  topic.materials.length,
                0,
              );

            return (
              <div
                key={unit.id}
                className="overflow-hidden rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] shadow-sm"
              >

                {/* Unidad */}

                <button
                  type="button"
                  onClick={() =>
                    toggleUnit(unit.id)
                  }
                  className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-[#F7F1E7]/60"
                >

                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{
                      backgroundColor:
                        subject.color ||
                        "#4A1115",
                    }}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#687584]">
                      Unidad {unit.number}
                    </p>

                    <h3 className="mt-1 truncate text-lg font-bold">
                      {unit.title}
                    </h3>

                  </div>

                  <div className="hidden text-right sm:block">

                    <p className="text-sm font-semibold text-[#4A1115]">
                      {unit.topics.length}
                    </p>

                    <p className="text-[10px] text-[#687584]">
                      temas
                    </p>

                  </div>

                  <div className="hidden text-right sm:block">

                    <p className="text-sm font-semibold text-[#4A1115]">
                      {unitMaterials}
                    </p>

                    <p className="text-[10px] text-[#687584]">
                      materiales
                    </p>

                  </div>

                </button>


                {/* Temas */}

                {isOpen && (
                  <div className="border-t border-[#4A1115]/10 bg-[#F7F1E7]/40 p-4 sm:p-5">

                    <div className="space-y-2">

                      {unit.topics.map(
                        (topic) => (
                          <div
                            key={topic.id}
                            className="flex items-center gap-4 rounded-xl bg-[#FFFDF8] px-4 py-4"
                          >

                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                              style={{
                                backgroundColor:
                                  subject.color ||
                                  "#4A1115",
                              }}
                            >
                              {topic.number}
                            </span>

                            <div className="min-w-0 flex-1">

                              <p className="truncate text-sm font-semibold">
                                {topic.title}
                              </p>

                            </div>

                            <div className="flex shrink-0 items-center gap-2 text-xs text-[#687584]">

                              <FileText className="h-3.5 w-3.5" />

                              {topic.materials.length}

                            </div>

                          </div>
                        ),
                      )}

                    </div>

                  </div>
                )}

              </div>
            );
          })}

        </div>

      )}

    </section>
  );
}