"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  Layers3,
} from "lucide-react";

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
  objective?: string | null;
  imageUrl?: string | null;
  topics?: Topic[];
};

type UnitViewProps = {
  unit: Unit;
  subjectName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  theme?: "LIGHT" | "DARK";
  onBack?: () => void;
  onTopicSelect?: (topic: Topic) => void;
};

export function UnitView({
  unit,
  subjectName,
  primaryColor = "#7D5DFF",
  secondaryColor = "#5EE1E6",
  onBack,
  onTopicSelect,
}: UnitViewProps) {
  /*
   * Solamente mostramos temas que tienen materiales.
   *
   * Esta regla se mantiene igual que en UnitsView:
   * si el docente no proporcionó materiales para un tema,
   * ese tema no forma parte del recorrido público.
   */
  const visibleTopics =
    unit.topics?.filter(
      (topic) =>
        topic.materials &&
        topic.materials.length > 0,
    ) ?? [];

  const materialCount = visibleTopics.reduce(
    (total, topic) =>
      total + (topic.materials?.length ?? 0),
    0,
  );

  return (
    <section className="relative overflow-hidden bg-white">
      {/* =====================================================
          HERO DE LA UNIDAD
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

        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10 md:pb-20 md:pt-12">
          {/* Regresar */}
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-[#6B7280] transition hover:bg-white/70 hover:text-[#1E2430]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

            <span>
              Volver a unidades
            </span>
          </button>

          {/* Contenido */}
          <div className="mt-10 grid items-center gap-10 md:grid-cols-[1fr_360px] md:gap-16">
            {/* Texto */}
            <div>
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

              <div className="mt-5 flex items-center gap-3">
                <span
                  className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                  }}
                >
                  Unidad {unit.number}
                </span>

                <span className="text-xs font-medium text-[#9CA3AF]">
                  {visibleTopics.length}{" "}
                  {visibleTopics.length === 1
                    ? "tema"
                    : "temas"}
                </span>
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-[#1E2430] md:text-5xl">
                {unit.title}
              </h1>

              {unit.objective && (
                <div className="mt-7 max-w-2xl">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.18em]"
                    style={{
                      color: primaryColor,
                    }}
                  >
                    Objetivo de la unidad
                  </p>

                  <p className="mt-3 text-sm leading-7 text-[#6B7280]">
                    {unit.objective}
                  </p>
                </div>
              )}

              {/* Métricas */}
              <div className="mt-8 flex flex-wrap gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/80 px-4 py-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${primaryColor}12`,
                    }}
                  >
                    <Layers3
                      className="h-4 w-4"
                      style={{
                        color: primaryColor,
                      }}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#1E2430]">
                      {visibleTopics.length}
                    </p>

                    <p className="text-[11px] text-[#9CA3AF]">
                      {visibleTopics.length === 1
                        ? "Tema disponible"
                        : "Temas disponibles"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white/80 px-4 py-3">
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
                      {materialCount}
                    </p>

                    <p className="text-[11px] text-[#9CA3AF]">
                      {materialCount === 1
                        ? "Material disponible"
                        : "Materiales disponibles"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Imagen */}
            <div className="relative">
              <div
                className="absolute inset-4 rounded-[2rem] blur-2xl opacity-20"
                style={{
                  backgroundColor: primaryColor,
                }}
              />

              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white bg-[#FAFAFB] shadow-xl">
                {unit.imageUrl ? (
                  <img
                    src={unit.imageUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full flex-col items-center justify-center"
                    style={{
                      background: `linear-gradient(
                        135deg,
                        ${secondaryColor}35,
                        ${primaryColor}10
                      )`,
                    }}
                  >
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm"
                      style={{
                        color: primaryColor,
                      }}
                    >
                      <BookOpen className="h-7 w-7" />
                    </div>

                    <p className="mt-4 text-sm font-medium text-[#6B7280]">
                      Unidad {unit.number}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          TEMAS
      ====================================================== */}

      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: `${primaryColor}12`,
              color: primaryColor,
            }}
          >
            Unidad temática {unit.number}
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1E2430] md:text-4xl">
            Explora esta unidad
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#6B7280]">
            Selecciona un tema para consultar los materiales
            disponibles.
          </p>
        </div>

        {visibleTopics.length > 0 ? (
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {visibleTopics.map((topic, index) => {
              const topicMaterialCount =
                topic.materials?.length ?? 0;

              const isFirst = index === 0;

              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() =>
                    onTopicSelect?.(topic)
                  }
                  className="group relative overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#DCD6FF] hover:shadow-xl"
                >
                  {/* Decoración */}
                  <div
                    className="absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-10 transition-transform duration-500 group-hover:scale-125"
                    style={{
                      backgroundColor:
                        isFirst
                          ? primaryColor
                          : secondaryColor,
                    }}
                  />

                  <div className="relative">
                    {/* Encabezado */}
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold"
                        style={{
                          backgroundColor: `${primaryColor}12`,
                          color: primaryColor,
                        }}
                      >
                        {topic.number}
                      </div>

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
                    </div>

                    {/* Título */}
                    <h3 className="mt-6 max-w-lg text-xl font-semibold leading-7 text-[#1E2430]">
                      {topic.title}
                    </h3>

                    {/* Información */}
                    <div className="mt-6 flex items-center gap-2 text-xs text-[#6B7280]">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: `${secondaryColor}40`,
                        }}
                      >
                        <FileText
                          className="h-3.5 w-3.5"
                          style={{
                            color: primaryColor,
                          }}
                        />
                      </div>

                      <span>
                        {topicMaterialCount}{" "}
                        {topicMaterialCount === 1
                          ? "material disponible"
                          : "materiales disponibles"}
                      </span>
                    </div>

                    {/* Línea inferior */}
                    <div className="mt-6 flex items-center justify-between border-t border-[#F0F1F3] pt-5">
                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: primaryColor,
                        }}
                      >
                        Explorar tema
                      </span>

                      <span className="text-[11px] text-[#9CA3AF]">
                        Tema {index + 1} de{" "}
                        {visibleTopics.length}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-dashed border-[#D8DCE3] bg-[#FAFAFB] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2F7]">
              <BookOpen className="h-6 w-6 text-[#9CA3AF]" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[#1E2430]">
              No hay temas disponibles
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#6B7280]">
              Esta unidad todavía no tiene temas con
              materiales disponibles.
            </p>
          </div>
        )}

        {/* Volver */}
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-medium text-[#6B7280] transition hover:border-[#D8DCE3] hover:bg-[#FAFAFB] hover:text-[#1E2430]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />

            Volver a unidades
          </button>
        </div>
      </div>
    </section>
  );
}
