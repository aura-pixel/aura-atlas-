"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import styles from "@/components/teacher/subject/subject-workspace.module.css";
type Progress = {
  hypertextId: string;
  totalTopics: number;
  topicsWithContent: number;
  minimumTopics: number;
  percentage: number;
  canGenerate: boolean;
};
export default function SubjectPage() {
  const params = useParams();
  const subjectId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tab");
  const [subject, setSubject] = useState<Subject | null>(null);
  const activeTab: Tab = [
    "resumen",
    "informacion",
    "estructura",
    "contenidos",
    "hipertexto",
  ].includes(requested ?? "")
    ? (requested as Tab)
    : subject?.academicStructureConfirmed
      ? "contenidos"
      : "estructura";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contentBusy, setContentBusy] = useState(false);
  const [informationDirty, setInformationDirty] = useState(false);
  const [showContentWizard, setShowContentWizard] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!showContentWizard && !informationDirty && !saving) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [showContentWizard, informationDirty, saving]);
  const loadSubject = useCallback(async () => {
    if (!subjectId) return;
    const data = await get<Subject>(`/subjects/${subjectId}`);
    const ownHypertext = data.hypertexts?.[0];
    setSubject({
      ...data,
      academicStructure:
        ownHypertext?.academicStructure ?? data.academicStructure,
      academicStructureConfirmed:
        ownHypertext?.academicStructureConfirmed ??
        data.academicStructureConfirmed,
    });
    try {
      setProgress(await get<Progress>(`/materials/progress/${subjectId}`));
    } catch {
      setProgress(null);
    }
  }, [subjectId]);
  useEffect(() => {
    setLoading(true);
    setSubject(null);
    loadSubject()
      .catch(() =>
        setError(
          "No pudimos cargar la materia. Comprueba tu conexión e inténtalo de nuevo.",
        ),
      )
      .finally(() => setLoading(false));
  }, [loadSubject]);
  function navigate(tab: Tab) {
    if (saving || contentBusy || activeTab === tab) return;
    if (
      (showContentWizard || informationDirty) &&
      !window.confirm(
        "Tienes cambios sin guardar. ¿Quieres salir de esta sección?",
      )
    )
      return;
    setShowContentWizard(false);
    setError("");
    setMessage("");
    router.push(`/teacher/subjects/${subjectId}?tab=${tab}`, { scroll: false });
  }
  function leaveWorkspace() {
    if (saving || contentBusy) {
      setMessage("Espera a que termine la carga para salir de tu materia.");
      return;
    }
    if (
      (showContentWizard || informationDirty) &&
      !window.confirm(
        "Tienes material o cambios pendientes. ¿Quieres salir de esta materia?",
      )
    )
      return;
    router.push("/teacher/dashboard");
  }
  async function saveInformation(data: {
    name: string;
    abbreviation: string;
    description: string;
    color: string;
    logo: File | null;
  }) {
    if (!subject || saving || !data.name.trim()) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      if (data.name.trim() !== subject.name)
        form.append("name", data.name.trim());
      if (data.abbreviation.trim() !== (subject.abbreviation ?? ""))
        form.append("abbreviation", data.abbreviation.trim());
      if (data.description.trim() !== (subject.description ?? ""))
        form.append("description", data.description.trim());
      if (data.color !== (subject.color ?? "#4A1115"))
        form.append("color", data.color);
      if (data.logo) form.append("logo", data.logo);
      await patchForm(`/subjects/${subject.id}`, form);
      await loadSubject();
      setMessage("Cambios guardados en tu perfil.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos guardar los cambios. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function confirmStructure(structure: AcademicStructure) {
    if (!subjectId || saving) return;
    setSaving(true);
    setError("");
    try {
      await patch(`/subjects/${subjectId}/academic-structure`, { structure });
      await patch(`/subjects/${subjectId}/academic-structure/confirm`, {});
      await loadSubject();
      setMessage("Programa confirmado. Ya puedes añadir recursos a tus temas.");
      router.push(`/teacher/subjects/${subjectId}?tab=contenidos`, {
        scroll: false,
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos guardar el programa. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }
  if (loading)
    return (
      <main className={styles.workspace}>
        <div className={styles.empty} role="status">
          Preparando tu espacio de trabajo…
        </div>
      </main>
    );
  if (!subject)
    return (
      <main className={styles.workspace}>
        <div className={styles.empty}>
          <h1>No pudimos abrir la materia</h1>
          <p role="alert">
            {error || "Puede que ya no exista o que no tengas acceso."}
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              setLoading(true);
              loadSubject()
                .catch(() => setError("No pudimos cargar la materia."))
                .finally(() => setLoading(false));
            }}
          >
            Reintentar
          </button>
          <p>
            <Link href="/teacher/dashboard">Volver a mis materias</Link>
          </p>
        </div>
      </main>
    );
  return (
    <main className={styles.workspace}>
      <SubjectHeader
        subject={subject}
        onEdit={() => navigate("informacion")}
        onBack={leaveWorkspace}
      />
      <SubjectTabs activeTab={activeTab} onChange={navigate} />
      <div className={styles.body}>
        {error && (
          <p role="alert" className={styles.error} style={{ marginBottom: 20 }}>
            {error}
          </p>
        )}
        {message && (
          <p role="status" className={styles.status}>
            {message}
          </p>
        )}
        {activeTab === "resumen" && (
          <SubjectOverview subject={subject} onNavigate={navigate} />
        )}{" "}
        {activeTab === "informacion" && (
          <SubjectInformation
            subject={subject}
            saving={saving}
            onSave={saveInformation}
            onDirtyChange={setInformationDirty}
          />
        )}{" "}
        {activeTab === "estructura" && (
          <SubjectStructure
            subject={subject}
            saving={saving}
            onContinue={confirmStructure}
            onGoToContents={() => navigate("contenidos")}
          />
        )}{" "}
        {activeTab === "contenidos" && (
          <SubjectContents
            subject={subject}
            hypertextProgress={progress}
            showContentWizard={showContentWizard}
            onShowContentWizard={setShowContentWizard}
            onReload={() => {
              loadSubject().catch(() =>
                setError(
                  "No pudimos actualizar la lista. Recarga la página para revisarla.",
                ),
              );
            }}
            onGoToHypertext={() => navigate("hipertexto")}
            onGoToStructure={() => navigate("estructura")}
            onBusyChange={setContentBusy}
          />
        )}{" "}
        {activeTab === "hipertexto" && (
          <SubjectHypertext subject={subject} hypertextProgress={progress} />
        )}
      </div>
    </main>
  );
}
