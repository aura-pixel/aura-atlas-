"use client";

import { useState } from "react";
import {
  ArrowRight,
  FileText,
  FileUp,
  Loader2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import { postForm } from "@/lib/api";
import { Button } from "@/components/ui/button";

import { AcademicStructurePreview } from "./academic-structure-preview";

import type {
  AcademicStructure,
} from "@/components/teacher/subject/types";

type AcademicStructureResponse = {
  totalPages: number;
  structure: AcademicStructure;
};

type Props = {
  initialStructure?: AcademicStructure | null;

  onContinue: (
    structure: AcademicStructure,
  ) => void;

  saving?: boolean;
};

export function AcademicStructureBuilder({
  initialStructure,
  onContinue,
  saving = false,
}: Props) {
  const [file, setFile] =
    useState<File | null>(null);

  const [structure, setStructure] =
    useState<AcademicStructure | null>(
      initialStructure ?? null,
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  // =====================================================
  // ANALIZAR PROGRAMA
  // =====================================================

  async function handleAnalyze() {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const result =
        await postForm<AcademicStructureResponse>(
          "/academic-structure/analyze",
          formData,
        );

      setStructure(
        result.structure,
      );
    } catch (err: unknown) {
      console.error(
        "Error al analizar el programa:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "No pudimos analizar el documento.",
      );
    } finally {
      setLoading(false);
    }
  }


  // =====================================================
  // ELIMINAR ARCHIVO
  // =====================================================

  function handleRemoveFile() {
    setFile(null);
    setError(null);
  }


  // =====================================================
  // ESTADO: ANALIZANDO
  // =====================================================

  if (loading) {
    return (
      <section className="w-full">

        <div className="relative overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] px-6 py-16 text-center shadow-sm sm:px-10">

          {/* Decoración */}

          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-[#E8AFC0]/30 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[#C7D8D0]/40 blur-3xl" />


          <div className="relative">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#4A1115] text-[#FFFDF8] shadow-lg shadow-[#4A1115]/15">

              <Loader2 className="h-7 w-7 animate-spin" />

            </div>


            <div className="mx-auto mt-7 max-w-xl">

              <div className="flex items-center justify-center gap-2">

                <Sparkles className="h-4 w-4 text-[#4A1115]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
                  Aura Atlas está trabajando
                </span>

              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#211719] sm:text-3xl">
                Analizando tu programa
              </h2>

              <p className="mt-4 text-sm leading-7 text-[#687584]">
                Estamos identificando las unidades,
                objetivos, temas y subtemas de tu
                programa de estudios.
              </p>

              <div className="mx-auto mt-7 flex w-fit items-center gap-2 rounded-full bg-[#F7F1E7] px-4 py-2 text-xs text-[#687584]">

                <span className="h-2 w-2 animate-pulse rounded-full bg-[#4A1115]" />

                Esto puede tardar unos segundos...

              </div>

            </div>

          </div>

        </div>

      </section>
    );
  }


  // =====================================================
  // ESTADO: PREVIEW
  // =====================================================

  if (structure) {
    return (
      <AcademicStructurePreview
        structure={structure}
        onContinue={() =>
          onContinue(structure)
        }
        onBack={() =>
          setStructure(null)
        }
      />
    );
  }


  // =====================================================
  // ESTADO: SUBIR DOCUMENTO
  // =====================================================

  return (
    <section className="w-full">

      {/* =================================================
          ENCABEZADO
      ================================================== */}

      <div className="mb-7">

        <div className="flex items-center gap-2">

          <Sparkles className="h-4 w-4 text-[#4A1115]" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
            Estructura académica
          </span>

        </div>

        <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em] text-[#211719] sm:text-3xl">
          Construye la estructura de tu materia.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#687584]">
          Sube el programa oficial de tu unidad de
          aprendizaje y deja que Aura Atlas identifique
          su estructura académica.
        </p>

      </div>


      {/* =================================================
          ZONA DE CARGA
      ================================================== */}

      {!file && (
        <label
          htmlFor="academic-program"
          className="group relative flex min-h-[310px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-[#4A1115]/20 bg-[#FFFDF8] px-6 py-12 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#4A1115]/40 hover:shadow-lg hover:shadow-[#4A1115]/5"
        >

          {/* Decoraciones */}

          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-[#E8AFC0]/20 blur-3xl transition-all duration-500 group-hover:bg-[#E8AFC0]/35" />

          <div className="pointer-events-none absolute -bottom-20 -right-16 h-44 w-44 rounded-full bg-[#C7D8D0]/25 blur-3xl transition-all duration-500 group-hover:bg-[#C7D8D0]/40" />


          <div className="relative">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#F7F1E7] text-[#4A1115] transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-2 group-hover:bg-[#E8AFC0]/30">

              <FileUp className="h-7 w-7" />

            </div>


            <h3 className="mt-6 text-xl font-bold text-[#211719]">
              Sube tu programa de estudios
            </h3>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#687584]">
              Utiliza el programa oficial de la unidad
              de aprendizaje en formato PDF.
            </p>


            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#4A1115] px-5 py-3 text-sm font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/15 transition-all group-hover:-translate-y-0.5">

              <Upload className="h-4 w-4" />

              Seleccionar PDF

            </div>


            <p className="mt-4 text-[11px] text-[#687584]">
              PDF · Programa oficial de la materia
            </p>

          </div>

        </label>
      )}


      <input
        id="academic-program"
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(event) => {
          const selected =
            event.target.files?.[0] ??
            null;

          setFile(selected);
          setError(null);
        }}
      />


      {/* =================================================
          ARCHIVO SELECCIONADO
      ================================================== */}

      {file && (
        <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6 shadow-sm">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

            <div className="flex min-w-0 flex-1 items-center gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">

                <FileText className="h-6 w-6" />

              </div>


              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-[#211719]">
                  {file.name}
                </p>

                <p className="mt-1 text-xs text-[#687584]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

              </div>

            </div>


            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={
                  handleRemoveFile
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#687584] transition-colors hover:bg-[#F7F1E7] hover:text-[#4A1115]"
                aria-label="Eliminar archivo"
              >

                <X className="h-4 w-4" />

              </button>


              <Button
                type="button"
                onClick={
                  handleAnalyze
                }
                className="h-11 rounded-xl bg-[#4A1115] px-5 text-sm font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/15 hover:bg-[#5D171D]"
              >

                Analizar programa

                <ArrowRight className="ml-2 h-4 w-4" />

              </Button>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">

          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />

          <div>

            <p className="text-sm font-semibold text-red-800">
              No pudimos analizar el programa.
            </p>

            <p className="mt-1 text-xs leading-5 text-red-700">
              {error}
            </p>

          </div>

        </div>
      )}


      {/* =================================================
          AYUDA
      ================================================== */}

      {!file && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#F7F1E7] p-4">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFFDF8] text-[#4A1115]">

            <FileText className="h-4 w-4" />

          </div>

          <div>

            <p className="text-xs font-semibold text-[#211719]">
              ¿Qué documento debo subir?
            </p>

            <p className="mt-1 text-xs leading-5 text-[#687584]">
              El programa oficial de la unidad de
              aprendizaje. Aura Atlas utilizará su contenido
              para identificar automáticamente la estructura
              académica.

            </p>

          </div>

        </div>
      )}

    </section>
  );
}
