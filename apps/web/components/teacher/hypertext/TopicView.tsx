"use client";

import {
  ArrowLeft,
  ArrowRight,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  ExternalLink,
  Presentation,
} from "lucide-react";

import { ImageMaterial } from "@/components/teacher/content/ImageMaterial";

type Material = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  mimeType?: string | null;
};

type Topic = {
  id: string;
  number: string;
  title: string;
  materials?: Material[];
};

type Unit = {
  id: string;
  number: number;
  title: string;
};

type TopicViewProps = {
  unit: Unit;
  topic: Topic;
  subjectName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  onBack?: () => void;
  onMaterialSelect?: (
    material: Material,
  ) => void;
};

function getMaterialIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return FileVideo;

    case "AUDIO":
      return FileAudio;

    case "IMAGE":
      return FileImage;

    case "PRESENTATION":
      return Presentation;

    case "LINK":
    case "ARTICLE":
      return ExternalLink;

    default:
      return FileText;
  }
}

function getMaterialLabel(type: string) {
  switch (type) {
    case "PDF":
      return "Documento PDF";

    case "DOCUMENT":
      return "Documento";

    case "PRESENTATION":
      return "Presentación";

    case "VIDEO":
      return "Video";

    case "AUDIO":
      return "Audio";

    case "IMAGE":
      return "Imagen";

    case "ARTICLE":
      return "Artículo";

    case "LINK":
      return "Enlace externo";

    default:
      return "Material";
  }
}

export function TopicView({
  unit,
  topic,
  subjectName,
  primaryColor = "#7D5DFF",
  secondaryColor = "#5EE1E6",
  onBack,
  onMaterialSelect,
}: TopicViewProps) {
  const materials = topic.materials ?? [];
  const visualMaterials = materials.filter(
  (material) => material.type?.toUpperCase() === "IMAGE",
);

const regularMaterials = materials.filter(
  (material) => material.type?.toUpperCase() !== "IMAGE",
);

  return (
    <section className="relative overflow-hidden bg-white">
      {/* =====================================================
          HERO DEL TEMA
      ====================================================== */}

      <div
        className="relative overflow-hidden border-b border-[#E5E7EB]"
        style={{
          background: `linear-gradient(
            135deg,
            ${secondaryColor}22,
            ${primaryColor}0A
          )`,
        }}
      >
        {/* Decoraciones */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-20"
          style={{
            backgroundColor: secondaryColor,
          }}
        />

        <div
          className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full opacity-10"
          style={{
            backgroundColor: primaryColor,
          }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-10 md:pb-20 md:pt-12">
          {/* Volver */}
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-[#6B7280] transition hover:bg-white/70 hover:text-[#1E2430]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

            <span>
              Volver a Unidad {unit.number}
            </span>
          </button>

          {/* Breadcrumb académico */}
          <div className="mt-10">
            {subjectName && (
              <p
                className="text-sm font-medium"
                style={{
                  color: primaryColor,
                }}
              >
                {subjectName}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#9CA3AF]">
              <span>Unidad {unit.number}</span>

              <span>•</span>

              <span
                className="font-semibold"
                style={{
                  color: primaryColor,
                }}
              >
                Tema {topic.number}
              </span>
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-tight text-[#1E2430] md:text-5xl">
              {topic.title}
            </h1>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#6B7280]">
              Explora los materiales disponibles para
              este tema y consulta cada recurso desde
              el hipertexto.
            </p>

            {/* Resumen */}
            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/80 px-4 py-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${secondaryColor}45`,
                }}
              >
                <FileText
                  className="h-4 w-4"
                  style={{
                    color: primaryColor,
                  }}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#1E2430]">
                  {materials.length}
                </p>

                <p className="text-[11px] text-[#9CA3AF]">
                  {materials.length === 1
                    ? "material disponible"
                    : "materiales disponibles"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MATERIALES
      ====================================================== */}

      <div className="mx-auto max-w-5xl px-6 py-20 md:py-24">
        <div className="max-w-2xl">
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: `${primaryColor}12`,
              color: primaryColor,
            }}
          >
            Recursos del tema
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1E2430] md:text-4xl">
            Materiales disponibles
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#6B7280]">
            Consulta los recursos proporcionados por el
            docente para complementar este tema.
          </p>
        </div>

        {regularMaterials.length > 0 ? (
  <div className="mt-12 space-y-4">
    {regularMaterials.map((material, index) => {
              const Icon =
                getMaterialIcon(material.type);

              const label =
                getMaterialLabel(material.type);

              return (
                <button
                  key={material.id}
                  type="button"
                  onClick={() =>
                    onMaterialSelect?.(material)
                  }
                  className="group relative flex w-full items-center gap-5 overflow-hidden rounded-3xl border border-[#E5E7EB] bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#DCD6FF] hover:shadow-lg md:p-6"
                >
                  {/* Número */}
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold"
                    style={{
                      backgroundColor: `${primaryColor}12`,
                      color: primaryColor,
                    }}
                  >
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </div>

                  {/* Icono */}
                  <div
                    className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl sm:flex"
                    style={{
                      backgroundColor: `${secondaryColor}40`,
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{
                        color: primaryColor,
                      }}
                    />
                  </div>

                  {/* Información */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      {label}
                    </p>

                    <h3 className="mt-1.5 truncate text-base font-semibold text-[#1E2430] md:text-lg">
                      {material.name}
                    </h3>

                    <p className="mt-1 text-xs text-[#9CA3AF]">
                      Recurso {index + 1}
                    </p>
                  </div>

                  {/* Acción */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F8F9FB] transition-all duration-300 group-hover:bg-[#F3F0FF]"
                  >
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      style={{
                        color: primaryColor,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 rounded-3xl border border-dashed border-[#D8DCE3] bg-[#FAFAFB] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2F7]">
              <FileText className="h-6 w-6 text-[#9CA3AF]" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[#1E2430]">
              No hay materiales disponibles
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
              Este tema todavía no tiene materiales
              disponibles.
            </p>
          </div>
        )}

        <ImageMaterial
  materials={visualMaterials}
  primaryColor={primaryColor}
/>

        {/* Regresar */}
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-medium text-[#6B7280] transition hover:border-[#D8DCE3] hover:bg-[#FAFAFB] hover:text-[#1E2430]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

            Volver a Unidad {unit.number}
          </button>
        </div>
      </div>
    </section>
  );
}