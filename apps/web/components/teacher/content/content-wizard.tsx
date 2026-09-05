"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileUp,
  Link2,
  Check,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  X,
  FileText,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { postForm, post } from "@/lib/api";
import {
  AddContent,
  type AddedLink,
  type AddedVideo,
} from "./add-content";


type SuggestedTopic = {
  number: string;
  title: string;
  score: number;
  signals: {
    numberMatch: boolean;
    titleScore: number;
    contentScore: number;
  };
};

type ContentMatchFile = {
  name: string;
  mimeType: string;
  size: number;
  url: string;
  textLength: number;
  suggestedTopic: SuggestedTopic | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  margin: number;
  candidates: SuggestedTopic[];
};

type UploadResponse = {
  hypertextId: string;
  subjectId: string;
  totalFiles: number;
  totalTopics: number;
  files: ContentMatchFile[];
};

type ContentWizardProps = {
  subjectId: string;
  initialStructure?: unknown | null;
  onContinue?: () => void;
  onClose: () => void;
};

type WizardStep = 1 | 2 | 3;

const steps = [
  {
    number: 1,
    title: "Material",
    description: "Sube tus archivos",
  },
  {
    number: 2,
    title: "Organización",
    description: "Asigna cada material",
  },
  {
    number: 3,
    title: "Revisión",
    description: "Confirma el contenido",
  },
];

export function ContentWizard({
  subjectId,
  initialStructure,
  onContinue,
  onClose,
}: ContentWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);

  const [files, setFiles] = useState<File[]>([]);
  const [videos, setVideos] = useState<AddedVideo[]>([]);
  const [links, setLinks] = useState<AddedLink[]>([]);

  const [results, setResults] =
    useState<ContentMatchFile[]>([]);

  const [selectedTopics, setSelectedTopics] =
    useState<Record<string, SuggestedTopic | null>>({});

  const [editingFile, setEditingFile] =
    useState<string | null>(null);

  const [uploading, setUploading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  async function handleNext() {
    if (step === 1) {
  if (
  files.length === 0 &&
  videos.length === 0 &&
  links.length === 0
) {
  return;
}

  try {
    setUploading(true);

    if (files.length > 0) {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const result =
        await postForm<UploadResponse>(
          `/materials/upload/${subjectId}`,
          formData,
        );

      setResults(result.files);

      const initialSelections: Record<
        string,
        SuggestedTopic | null
      > = {};

      result.files.forEach((file) => {
        initialSelections[file.name] =
          file.suggestedTopic;
      });

      setSelectedTopics(initialSelections);
    }

    setStep(2);
  } catch (error) {
    console.error(
      "Error al procesar los archivos:",
      error,
    );
  } finally {
    setUploading(false);
  }

  return;
}

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      const unassignedFiles =
        results.filter(
          (file) =>
            !selectedTopics[file.name],
        );

      if (unassignedFiles.length > 0) {
        console.warn(
          "Hay archivos sin tema asignado:",
          unassignedFiles,
        );

        return;
      }

      try {
        setSaving(true);

       const fileMaterials = results.map(
  (file) => {
    const topic =
      selectedTopics[file.name];

    return {
      name: file.name,
      mimeType: file.mimeType,
      size: file.size,
      url: file.url,
      topicNumber: topic!.number,
      type:
  file.mimeType === "application/pdf"
    ? "PDF"
    : file.mimeType.startsWith("image/")
    ? "IMAGE"
    : "OTHER",
    };
  },
);

const videoMaterials = videos.map(
  (video) => ({
    name: video.name,
    mimeType: "video/external",
    size: 0,
    url: video.url,
    topicNumber: video.topicNumber,
    type: "VIDEO",
  }),
);

const linkMaterials = links.map(
  (link) => ({
    name: link.name,
    mimeType: "text/uri-list",
    size: 0,
    url: link.url,
    topicNumber: link.topicNumber,
    type: "LINK",
  }),
);

const materials = [
  ...fileMaterials,
  ...videoMaterials,
  ...linkMaterials,
];

        const result =
          await post<{
            message: string;
            total: number;
            materials: unknown[];
          }>(
            `/materials/save/${subjectId}`,
            {
              files: materials,
            },
          );

        console.log(
          "Materiales guardados:",
          result,
        );

        onContinue?.();

        onClose();
      } catch (error) {
        console.error(
          "Error al guardar materiales:",
          error,
        );
      } finally {
        setSaving(false);
      }

      return;
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(
        (current) =>
          (current - 1) as WizardStep,
      );

      return;
    }

    onClose();
  }

  function getConfidenceLabel(
    confidence: ContentMatchFile["confidence"],
  ) {
    switch (confidence) {
      case "HIGH":
        return "Alta confianza";

      case "MEDIUM":
        return "Confianza media";

      case "LOW":
        return "Requiere revisión";
    }
  }

  function removeFile(index: number) {
    setFiles((current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index,
      ),
    );
  }

  const assignedCount =
  results.filter(
    (file) =>
      selectedTopics[file.name],
  ).length;

const totalMaterials =
  results.length +
  videos.length +
  links.length;

const allAssigned =
  totalMaterials > 0 &&
  assignedCount + videos.length + links.length ===
    totalMaterials;

  return (
    <section className="relative max-w-5xl pb-8">

      {/* =====================================================
          DECORACIÓN
      ====================================================== */}

      <div className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-[#E8AFC0]/20 blur-3xl" />

      <div className="pointer-events-none absolute -left-32 bottom-40 h-72 w-72 rounded-full bg-[#8EA0B5]/10 blur-3xl" />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="relative">

        <button
          type="button"
          onClick={onClose}
          className="group mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#687584] transition-colors hover:text-[#4A1115]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#4A1115]/10 bg-[#FFFDF8] transition-transform group-hover:-translate-x-1">
            <ArrowLeft className="h-4 w-4" />
          </span>

          Volver a contenidos
        </button>

        <div className="max-w-3xl">

          <div className="flex items-center gap-2">

            <Sparkles className="h-4 w-4 text-[#4A1115]" />

            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A1115]">
              Nuevo contenido
            </span>

          </div>

          <h2 className="mt-3 text-4xl font-bold tracking-[-0.045em] text-[#211719]">
            Dale contenido
            <br />

            <span className="text-[#4A1115]">
              a tu hipertexto.
            </span>
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#687584]">
            Sube tus materiales y deja que Aura Atlas
            te ayude a encontrar dónde pertenece cada uno.
          </p>

        </div>
      </div>


      {/* =====================================================
          STEPPER
      ====================================================== */}

      <div className="relative mt-10 rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-4 shadow-sm sm:p-5">

        <div className="flex items-center">

          {steps.map((item, index) => {

            const active =
              step === item.number;

            const completed =
              step > item.number;

            return (
              <div
                key={item.number}
                className="flex min-w-0 flex-1 items-center"
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`
                      flex h-10 w-10 shrink-0 items-center justify-center
                      rounded-xl text-sm font-bold transition-all
                      ${
                        active
                          ? "bg-[#4A1115] text-[#FFFDF8] shadow-lg shadow-[#4A1115]/20"
                          : completed
                          ? "bg-[#E8AFC0]/40 text-[#4A1115]"
                          : "border border-[#4A1115]/10 bg-[#F7F1E7] text-[#687584]"
                      }
                    `}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      item.number
                    )}
                  </div>

                  <div className="hidden min-w-0 sm:block">

                    <p
                      className={`
                        text-sm font-semibold
                        ${
                          active
                            ? "text-[#211719]"
                            : "text-[#687584]"
                        }
                      `}
                    >
                      {item.title}
                    </p>

                    <p className="mt-0.5 text-[11px] text-[#687584]">
                      {item.description}
                    </p>

                  </div>

                </div>

                {index <
                  steps.length - 1 && (
                  <div
                    className={`
                      mx-3 h-px flex-1 sm:mx-5
                      ${
                        step >
                        item.number
                          ? "bg-[#4A1115]/40"
                          : "bg-[#4A1115]/10"
                      }
                    `}
                  />
                )}

              </div>
            );
          })}

        </div>
      </div>


      {/* =====================================================
          PASO 1 — MATERIAL
      ====================================================== */}

      {step === 1 && (
  <div className="mt-8">
    <AddContent
  files={files}
  setFiles={setFiles}
  initialStructure={initialStructure}
  onVideosChange={setVideos}
  onLinksChange={setLinks}
/>
  </div>
)}


      {/* =====================================================
          PASO 2 — ORGANIZACIÓN
      ====================================================== */}

      {step === 2 && (
        <div className="mt-8 space-y-6">

          {/* Resumen */}

          <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6 shadow-sm sm:p-7">

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A1115]">
                  Organización automática
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#211719]">
                  Encontramos posibles coincidencias.
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687584]">
                  Revisa las sugerencias y cambia
                  cualquier asignación que necesite
                  una segunda mirada.
                </p>

              </div>

              <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#F7F1E7] px-4 py-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8AFC0]/35 text-[#4A1115]">
                  <FileText className="h-4 w-4" />
                </div>

                <div>

                  <p className="text-3xl font-bold text-[#211719]">
  {results.length + videos.length}
</p>

                  <p className="text-[11px] text-[#687584]">
                    materiales

                  </p>

                </div>

              </div>

            </div>


            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              <div className="rounded-2xl bg-[#F7F1E7] p-4">

                <p className="text-3xl font-bold text-[#211719]">
  {totalMaterials}
</p>

                <p className="mt-1 text-xs text-[#687584]">
                  Archivos
                </p>

              </div>

              <div className="rounded-2xl bg-[#E8AFC0]/20 p-4">

                <p className="text-2xl font-bold text-[#4A1115]">
                  {
                    results.filter(
                      (file) =>
                        file.confidence ===
                        "HIGH",
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-[#687584]">
                  Alta confianza
                </p>

              </div>

              <div className="rounded-2xl bg-[#F7F1E7] p-4">

                <p className="text-2xl font-bold text-[#211719]">
                  {
                    results.filter(
                      (file) =>
                        file.confidence !==
                        "HIGH",
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs text-[#687584]">
                  Para revisar
                </p>

              </div>

            </div>

          </div>


          {/* Archivos */}

          <div className="space-y-4">

            {results.map(
              (file, index) => {

                const currentTopic =
                  selectedTopics[
                    file.name
                  ];

                const isEditing =
                  editingFile ===
                  file.name;

                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] shadow-sm"
                  >

                    <div className="p-6 sm:p-7">

                      {/* Archivo */}

                      <div className="flex items-start gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate font-bold text-[#211719]">
                            {file.name}
                          </p>

                          <p className="mt-1 text-xs text-[#687584]">
                            {(
                              file.size /
                              1024 /
                              1024
                            ).toFixed(2)}{" "}
                            MB
                          </p>

                        </div>

                        <div
                          className={`
                            flex shrink-0 items-center gap-2
                            rounded-full px-3 py-1.5
                            text-[11px] font-semibold
                            ${
                              file.confidence ===
                              "HIGH"
                                ? "bg-[#E8AFC0]/25 text-[#4A1115]"
                                : file.confidence ===
                                  "MEDIUM"
                                ? "bg-[#F7F1E7] text-[#687584]"
                                : "bg-[#4A1115]/5 text-[#4A1115]"
                            }
                          `}
                        >
                          {file.confidence ===
                          "LOW" ? (
                            <AlertCircle className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}

                          {getConfidenceLabel(
                            file.confidence,
                          )}
                        </div>

                      </div>


                      {/* Tema asignado */}

                      {currentTopic &&
                      !isEditing ? (

                        <div className="mt-6 rounded-[1.5rem] border border-[#4A1115]/10 bg-[#F7F1E7]/55 p-5">

                          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4A1115]">
                                Tema asignado
                              </p>

                              <div className="mt-3 flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4A1115] text-xs font-bold text-[#FFFDF8]">
                                  {currentTopic.number}
                                </div>

                                <div>

                                  <p className="text-sm font-bold text-[#211719]">
                                    {currentTopic.title}
                                  </p>

                                  <p className="mt-0.5 text-xs text-[#687584]">
                                    Sugerido por Aura Atlas
                                  </p>

                                </div>

                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setEditingFile(
                                  file.name,
                                )
                              }
                              className="rounded-xl border border-[#4A1115]/10 bg-[#FFFDF8] px-4 py-2 text-sm font-semibold text-[#4A1115] transition-colors hover:bg-[#4A1115] hover:text-[#FFFDF8]"
                            >
                              Cambiar tema
                            </button>

                          </div>

                        </div>

                      ) : file.candidates
                          .length > 0 ? (

                        <div className="mt-6 rounded-[1.5rem] border border-[#4A1115]/15 bg-[#E8AFC0]/10 p-5">

                          <p className="text-sm font-bold text-[#211719]">
                            ¿Dónde pertenece este material?
                          </p>

                          <p className="mt-1 text-sm text-[#687584]">
                            Selecciona el tema que
                            mejor corresponda.
                          </p>

                          <div className="mt-4 space-y-2">

                            {file.candidates.map(
                              (candidate) => (
                                <button
                                  key={`${candidate.number}-${candidate.title}`}
                                  type="button"
                                  onClick={() => {
                                    setSelectedTopics(
                                      (
                                        previous,
                                      ) => ({
                                        ...previous,
                                        [file.name]:
                                          candidate,
                                      }),
                                    );

                                    setEditingFile(
                                      null,
                                    );
                                  }}
                                  className="group flex w-full items-center gap-4 rounded-2xl border border-[#4A1115]/10 bg-[#FFFDF8] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[#4A1115]/25 hover:shadow-md"
                                >

                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E8AFC0]/25 text-xs font-bold text-[#4A1115]">
                                    {candidate.number}
                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <p className="text-sm font-semibold text-[#211719]">
                                      {candidate.title}
                                    </p>

                                    <p className="mt-1 text-xs text-[#687584]">
                                      Coincidencia{" "}
                                      {Math.round(
                                        candidate.score *
                                          100,
                                      )}
                                      %
                                    </p>

                                  </div>

                                  <ArrowRight className="h-4 w-4 text-[#687584] transition-transform group-hover:translate-x-1 group-hover:text-[#4A1115]" />

                                </button>
                              ),
                            )}

                          </div>

                        </div>

                      ) : (

                        <div className="mt-6 rounded-[1.5rem] border border-[#4A1115]/15 bg-[#4A1115]/5 p-5">

                          <div className="flex items-start gap-3">

                            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#4A1115]" />

                            <div>

                              <p className="font-semibold text-[#211719]">
                                No encontramos una coincidencia clara
                              </p>

                              <p className="mt-1 text-sm leading-6 text-[#687584]">
                                Este archivo necesita
                                que selecciones
                                manualmente un tema.
                              </p>

                            </div>

                          </div>

                        </div>

                      )}


                      {/* Otras coincidencias */}

                      {file.candidates.length >
                        1 && (
                        <details className="group mt-4">

                          <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-[#687584] transition-colors hover:text-[#4A1115]">

                            Ver otras coincidencias

                            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />

                          </summary>

                          <div className="mt-3 space-y-2">

                            {file.candidates
                              .slice(1)
                              .map(
                                (
                                  candidate,
                                ) => (
                                  <div
                                    key={`${candidate.number}-${candidate.title}`}
                                    className="flex items-center justify-between rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7]/40 p-4"
                                  >

                                    <div className="flex items-center gap-3">

                                      <span className="text-xs font-bold text-[#4A1115]">
                                        {
                                          candidate.number
                                        }
                                      </span>

                                      <span className="text-sm text-[#211719]">
                                        {
                                          candidate.title
                                        }
                                      </span>

                                    </div>

                                    <span className="text-xs text-[#687584]">
                                      {Math.round(
                                        candidate.score *
                                          100,
                                      )}
                                      %
                                    </span>

                                  </div>
                                ),
                              )}

                          </div>

                        </details>
                      )}

                    </div>

                  </div>
                );
              },
            )}

          </div>

        </div>
      )}


      {/* =====================================================
          PASO 3 — REVISIÓN
      ====================================================== */}

      {step === 3 && (
        <div className="mt-8 space-y-6">

          <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6 shadow-sm sm:p-8">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A1115]">
                  Último paso
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#211719]">
                  Todo listo para guardar.
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687584]">
                  Revisa que cada material esté
                  asociado al tema correcto antes
                  de incorporarlo a tu hipertexto.
                </p>

              </div>

            </div>


            <div className="mt-7 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl bg-[#F7F1E7] p-5">

                <p className="text-3xl font-bold text-[#211719]">
                  {results.length}
                </p>

                <p className="mt-1 text-xs text-[#687584]">
                  Materiales preparados
                </p>

              </div>

              <div
                className={`
                  rounded-2xl p-5
                  ${
                    allAssigned
                      ? "bg-[#E8AFC0]/20"
                      : "bg-[#4A1115]/5"
                  }
                `}
              >

                <p
  className={`
    text-3xl font-bold
    ${
      allAssigned
        ? "text-[#4A1115]"
        : "text-[#211719]"
    }
  `}
>
  {assignedCount + videos.length + links.length}
</p>

                <p className="mt-1 text-xs text-[#687584]">
                  Con tema asignado
                </p>

              </div>

            </div>

          </div>


          {/* Resumen de archivos */}

          <div className="space-y-3">

            {results.map(
              (file, index) => {

                const topic =
                  selectedTopics[
                    file.name
                  ];

                return (
                  <div
                    key={`${file.name}-${index}`}
                    className="rounded-[1.5rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-5 shadow-sm"
                  >

                    <div className="flex items-center gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8AFC0]/25 text-[#4A1115]">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-bold text-[#211719]">
                          {file.name}
                        </p>

                        <p className="mt-1 text-xs text-[#687584]">
                          {(
                            file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>

                      </div>

                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4A1115]" />

                    </div>


                    {topic ? (

                      <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F7F1E7] p-3.5">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4A1115] text-[10px] font-bold text-[#FFFDF8]">
                          {topic.number}
                        </div>

                        <div>

                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A1115]">
                            Tema asignado
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-[#211719]">
                            {topic.title}
                          </p>

                        </div>

                      </div>

                    ) : (

                      <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#4A1115]/5 p-3.5">

                        <AlertCircle className="h-5 w-5 text-[#4A1115]" />

                        <div>

                          <p className="text-sm font-semibold text-[#211719]">
                            Sin tema asignado
                          </p>

                          <p className="mt-0.5 text-xs text-[#687584]">
                            Regresa al paso anterior
                            para seleccionar uno.
                          </p>

                        </div>

                      </div>

                    )}

                  </div>
                );
              },
            )}

            {videos.map((video) => {
  const videoTopic = initialStructure &&
    typeof initialStructure === "object"
      ? (
          initialStructure as {
            units?: {
              number: number;
              title: string;
              topics?: {
                number: string;
                title: string;
              }[];
            }[];
          }
        ).units
          ?.flatMap((unit) => unit.topics ?? [])
          .find(
            (topic) =>
              topic.number === video.topicNumber,
          )
      : null;

  return (
    <div
      key={video.id}
      className="rounded-[1.5rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-5 shadow-sm"
    >
      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8AFC0]/25 text-[#4A1115]">
          <Video className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <p className="truncate text-sm font-bold text-[#211719]">
            {video.name}
          </p>

          <p className="mt-1 truncate text-xs text-[#687584]">
            {video.url}
          </p>

        </div>

        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4A1115]" />

      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F7F1E7] p-3.5">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4A1115] text-[10px] font-bold text-[#FFFDF8]">
          {video.topicNumber}
        </div>

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A1115]">
            Tema asignado
          </p>

          <p className="mt-0.5 text-sm font-semibold text-[#211719]">
            {videoTopic?.title ?? "Tema seleccionado"}
          </p>

          <p className="mt-1 text-xs text-[#687584]">
            Asignado por el docente
          </p>

        </div>

      </div>

    </div>
  );
})}

{links.map((link) => {
  const linkTopic =
    initialStructure &&
    typeof initialStructure === "object"
      ? (
          initialStructure as {
            units?: {
              number: number;
              title: string;
              topics?: {
                number: string;
                title: string;
              }[];
            }[];
          }
        ).units
          ?.flatMap((unit) => unit.topics ?? [])
          .find(
            (topic) =>
              topic.number === link.topicNumber,
          )
      : null;

  return (
    <div
      key={link.id}
      className="rounded-[1.5rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-5 shadow-sm"
    >
      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8AFC0]/25 text-[#4A1115]">
          <Link2 className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">

          <p className="truncate text-sm font-bold text-[#211719]">
            {link.name}
          </p>

          <p className="mt-1 truncate text-xs text-[#687584]">
            {link.url}
          </p>

        </div>

        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#4A1115]" />

      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F7F1E7] p-3.5">

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4A1115] text-[10px] font-bold text-[#FFFDF8]">
          {link.topicNumber}
        </div>

        <div>

          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4A1115]">
            Tema asignado
          </p>

          <p className="mt-0.5 text-sm font-semibold text-[#211719]">
            {linkTopic?.title ?? "Tema seleccionado"}
          </p>

          <p className="mt-1 text-xs text-[#687584]">
            Asignado por el docente
          </p>

        </div>

      </div>

    </div>
  );
})}

          </div>

        </div>
      )}


      {/* =====================================================
          NAVEGACIÓN
      ====================================================== */}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="h-11 rounded-xl border-[#4A1115]/15 bg-[#FFFDF8] px-5 text-[#4A1115] hover:bg-[#F7F1E7]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />

          {step === 1
            ? "Cancelar"
            : "Atrás"}
        </Button>


        {step < 3 ? (

          <Button
  type="button"
  onClick={handleNext}
  disabled={
    uploading ||
    (step === 1 &&
      files.length === 0 &&
      videos.length === 0 &&
      links.length === 0)
  }
  className="h-11 rounded-xl bg-[#4A1115] px-6 font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/15 hover:bg-[#5D171D]"
>
  {uploading ? (
    <>
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#FFFDF8]/30 border-t-[#FFFDF8]" />
      Analizando materiales...
    </>
  ) : (
    <>
      Continuar
      <ArrowRight className="ml-2 h-4 w-4" />
    </>
  )}
</Button>

        ) : (

          <Button
            type="button"
            onClick={handleNext}
            disabled={
              saving ||
              !allAssigned
            }
            className="h-11 rounded-xl bg-[#4A1115] px-6 font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/15 hover:bg-[#5D171D]"
          >
            {saving ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#FFFDF8]/30 border-t-[#FFFDF8]" />
                Guardando...
              </>
            ) : (
              <>
                Guardar contenido

                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

        )}

      </div>

    </section>
  );
}
