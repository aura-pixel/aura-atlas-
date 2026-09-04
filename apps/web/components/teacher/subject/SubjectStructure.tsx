import {
  ArrowRight,
  Layers3,
  Sparkles,
} from "lucide-react";

import type {
  AcademicStructure,
  Subject,
} from "./types";

import { AcademicStructureBuilder } from "@/components/teacher/academic-structure/academic-structure-builder";

type SubjectStructureProps = {
  subject: Subject;
  saving: boolean;
  onContinue: (
    structure: AcademicStructure,
  ) => void;
};

export function SubjectStructure({
  subject,
  saving,
  onContinue,
}: SubjectStructureProps) {
  return (
    <section className="space-y-6">

      {/* =====================================================
          ENCABEZADO
      ====================================================== */}

      <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-7 shadow-sm">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">
              <Layers3 className="h-5 w-5" />
            </div>

            <div>

              <div className="flex items-center gap-2">

                <Sparkles className="h-3.5 w-3.5 text-[#4A1115]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]">
                  Estructura académica
                </span>

              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">
                Dale forma a tu materia.
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687584]">
                Organiza las unidades, temas y subtemas que formarán parte
                de tu hipertexto.
              </p>

            </div>

          </div>

          <div className="rounded-xl bg-[#F7F1E7] px-4 py-3 text-xs text-[#687584]">

            <span className="font-semibold text-[#4A1115]">
              {subject.name}
            </span>

          </div>

        </div>

      </div>


      {/* =====================================================
          BUILDER
      ====================================================== */}

      <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-5 shadow-sm sm:p-7">

        <AcademicStructureBuilder
          initialStructure={
            subject.academicStructure ??
            undefined
          }
          onContinue={onContinue}
          saving={saving}
        />

      </div>


      {/* =====================================================
          AYUDA
      ====================================================== */}

      <div className="flex items-start gap-3 rounded-2xl border border-[#4A1115]/10 bg-[#F7F1E7] p-5">

        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#4A1115]" />

        <p className="text-xs leading-6 text-[#687584]">
          Una vez confirmada la estructura podrás comenzar a agregar
          materiales a cada tema y construir el contenido de tu hipertexto.
        </p>

      </div>

    </section>
  );
}