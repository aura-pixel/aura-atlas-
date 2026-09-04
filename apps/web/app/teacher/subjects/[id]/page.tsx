"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { get, patch, patchForm } from "@/lib/api";

import { SubjectHeader } from "@/components/teacher/subject/SubjectHeader";
import { SubjectTabs } from "@/components/teacher/subject/SubjectTabs";
import { SubjectOverview } from "@/components/teacher/subject/SubjectOverview";
import { SubjectInformation } from "@/components/teacher/subject/SubjectInformation";
import { SubjectStructure } from "@/components/teacher/subject/SubjectStructure";
import { SubjectContents } from "@/components/teacher/subject/SubjectContents";
import { SubjectHypertext } from "@/components/teacher/subject/SubjectHypertext";

import type {
  AcademicStructure,
  Subject,
  Tab,
} from "@/components/teacher/subject/types";

type HypertextProgress = {
  hypertextId: string;
  totalTopics: number;
  topicsWithContent: number;
  minimumTopics: number;
  percentage: number;
  canGenerate: boolean;
};

export default function SubjectPage() {
  const params = useParams();

  const subjectId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const searchParams = useSearchParams();

  // =====================================================
  // ESTADO
  // =====================================================

  const [subject, setSubject] =
    useState<Subject | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [activeTab, setActiveTab] =
  useState<Tab>(() => {
    const tab = searchParams.get("tab");

    if (
      tab === "informacion" ||
      tab === "estructura" ||
      tab === "contenidos" ||
      tab === "hipertexto"
    ) {
      return tab;
    }

    return "resumen";
  });

  const [showContentWizard, setShowContentWizard] =
    useState(false);

  const [hypertextProgress, setHypertextProgress] =
    useState<HypertextProgress | null>(null);


  // =====================================================
  // CARGAR MATERIA
  // =====================================================

  async function loadSubject() {
    if (!subjectId) {
      return;
    }

    try {
      setLoading(true);

      const data = await get<Subject>(
        `/subjects/${subjectId}`,
      );

      setSubject(data);

      // -------------------------------------------------
      // Cargar progreso del contenido
      // -------------------------------------------------

      try {
        const progress =
          await get<HypertextProgress>(
            `/materials/progress/${subjectId}`,
          );

        setHypertextProgress(progress);
      } catch (error) {
        console.error(
          "Error al cargar el progreso del hipertexto:",
          error,
        );

        setHypertextProgress(null);
      }
    } catch (error) {
      console.error(
        "Error al cargar la materia:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadSubject();
  }, [subjectId]);


  // =====================================================
  // GUARDAR INFORMACIÓN
  // =====================================================

  async function handleSaveInformation(data: {
    name: string;
    abbreviation: string;
    description: string;
    color: string;
    logo: File | null;
  }) {
    if (!subject || !data.name.trim()) {
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "name",
        data.name.trim(),
      );

      formData.append(
        "abbreviation",
        data.abbreviation.trim(),
      );

      formData.append(
        "description",
        data.description.trim(),
      );

      formData.append(
        "color",
        data.color,
      );

      if (data.logo) {
        formData.append(
          "logo",
          data.logo,
        );
      }

      await patchForm(
        `/subjects/${subject.id}`,
        formData,
      );

      await loadSubject();

      alert(
        "Los cambios se guardaron correctamente.",
      );
    } catch (error) {
      console.error(
        "Error al guardar la información:",
        error,
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "No pudimos guardar los cambios.",
        );
      }
    } finally {
      setSaving(false);
    }
  }


  // =====================================================
  // GUARDAR Y CONFIRMAR ESTRUCTURA
  // =====================================================

  async function handleStructureContinue(
    structure: AcademicStructure,
  ) {
    if (!subjectId) {
      return;
    }

    try {
      setSaving(true);

      // -------------------------------------------------
      // Guardar estructura en el hipertexto
      // -------------------------------------------------

      await patch(
        `/subjects/${subjectId}/academic-structure`,
        {
          structure,
        },
      );

      // -------------------------------------------------
      // Confirmar estructura
      // -------------------------------------------------

      await patch(
        `/subjects/${subjectId}/academic-structure/confirm`,
        {},
      );

      // -------------------------------------------------
      // Recargar materia
      // -------------------------------------------------

      await loadSubject();

      // -------------------------------------------------
      // Continuar a contenidos
      // -------------------------------------------------

      setActiveTab("contenidos");
    } catch (error) {
      console.error(
        "Error al guardar la estructura:",
        error,
      );

      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(
          "No pudimos guardar la estructura académica.",
        );
      }
    } finally {
      setSaving(false);
    }
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1E7]">

        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8AFC0]/40 text-[#4A1115]">

            <div className="h-5 w-5 animate-pulse rounded-full bg-[#4A1115]" />

          </div>

          <p className="mt-4 text-sm text-[#687584]">
            Cargando tu materia...
          </p>

        </div>

      </main>
    );
  }


  // =====================================================
  // MATERIA NO ENCONTRADA
  // =====================================================

  if (!subject) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1E7] px-6">

        <div className="max-w-md text-center">

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
            Aura Atlas
          </p>

          <h1 className="mt-3 text-2xl font-bold text-[#211719]">
            No pudimos encontrar esta materia.
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#687584]">
            Puede que no tengas acceso a ella o que ya no exista.
          </p>

        </div>

      </main>
    );
  }


  // =====================================================
  // PÁGINA
  // =====================================================

  return (
    <main className="min-h-screen bg-[#F7F1E7]">

      {/* =================================================
          HEADER DE LA MATERIA
      ================================================== */}

      <SubjectHeader
        subject={subject}
      />


      {/* =================================================
          NAVEGACIÓN
      ================================================== */}

      <SubjectTabs
        activeTab={activeTab}
        onChange={setActiveTab}
      />


      {/* =================================================
          CONTENIDO
      ================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">

        {activeTab === "resumen" && (
          <SubjectOverview
            subject={subject}
            hypertextProgress={
              hypertextProgress
            }
          />
        )}


        {activeTab === "informacion" && (
          <SubjectInformation
            subject={subject}
            saving={saving}
            onSave={handleSaveInformation}
          />
        )}


        {activeTab === "estructura" && (
          <SubjectStructure
            subject={subject}
            saving={saving}
            onContinue={
              handleStructureContinue
            }
          />
        )}


        {activeTab === "contenidos" && (
          <SubjectContents
  subject={subject}
  hypertextProgress={hypertextProgress}
  showContentWizard={showContentWizard}
  onShowContentWizard={setShowContentWizard}
  onReload={loadSubject}
  onGoToHypertext={() => setActiveTab("hipertexto")}
/>
        )}


        {activeTab === "hipertexto" && (
          <SubjectHypertext
            subject={subject}
            hypertextProgress={
              hypertextProgress
            }
          />
        )}

      </div>

    </main>
  );
}