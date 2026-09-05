"use client";

import {
  ArrowDown,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Home,
} from "lucide-react";
import { useState } from "react";

import { UnitView } from "./UnitView";
import { TopicView } from "./TopicView";
import { MaterialViewer } from "./MaterialViewer";
import { UnitsView } from "@/components/teacher/hypertext/UnitsView";

type Material = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

type Subtopic = {
  id: string;
  number: string;
  title: string;
};

type Topic = {
  id: string;
  number: string;
  title: string;
  subtopics?: Subtopic[];
  materials?: Material[];
};

type Unit = {
  id: string;
  number: number;
  title: string;
  objective?: string | null;
  topics?: Topic[];
};

type HypertextRendererProps = {
  hypertext: {
    id: string;
    title: string;
    description?: string | null;
    coverImageUrl?: string | null;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    theme: "LIGHT" | "DARK";

    user: {
      name: string;
    };

    subject: {
  name: string;
  abbreviation?: string | null;
  logoUrl?: string | null;
  color?: string | null;

  career: {
    name: string;
    abbreviation?: string | null;

    faculty: {
      name: string;
      abbreviation?: string | null;

      university: {
        name: string;
        abbreviation?: string | null;
        logoUrl?: string | null;
      };
    };
  };
};

    units: Unit[];
  };

  mode?: "editor" | "public";
};

type ViewState =
  | { type: "landing" }
  | { type: "unit"; unit: Unit }
  | { type: "topic"; unit: Unit; topic: Topic }
  | {
      type: "material";
      unit: Unit;
      topic: Topic;
      material: Material;
    };

export function HypertextRenderer({
  hypertext,
  mode = "editor",
}: HypertextRendererProps) {
  const [view, setView] = useState<ViewState>({
    type: "landing",
  });

  const university =
    hypertext.subject.career.faculty.university;

  const faculty =
    hypertext.subject.career.faculty;

  const career =
    hypertext.subject.career;

  const subject =
    hypertext.subject;

  const isDark = hypertext.theme === "DARK";

  const themeColors = {
    background: isDark
      ? "#15171C"
      : "#FFFFFF",

    foreground: isDark
      ? "#F4F6F9"
      : "#1E2430",

    muted: isDark
      ? "#A7AFBC"
      : "#687584",

    surface: isDark
      ? "#1D2027"
      : "#FFFFFF",

    softSurface: isDark
      ? "#20242C"
      : "#F8F9FB",

    border: isDark
      ? "#303540"
      : "#E5E7EB",
  };

  const visibleUnits = hypertext.units.filter((unit) =>
  (unit.topics ?? []).some(
    (topic) => (topic.materials?.length ?? 0) > 0,
  ),
);

  const getVisibleTopics = (unit: Unit) => {
  return (unit.topics ?? []).filter(
    (topic) => (topic.materials?.length ?? 0) > 0,
  );
};

  const scrollToSection = (
    sectionId: string,
  ) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const openUnit = (unit: Unit) => {
    setView({
      type: "unit",
      unit,
    });

    scrollToTop();
  };

  const openTopic = (
    unit: Unit,
    topic: Topic,
  ) => {
    setView({
      type: "topic",
      unit,
      topic,
    });

    scrollToTop();
  };

  const openMaterial = (
    unit: Unit,
    topic: Topic,
    material: Material,
  ) => {
    setView({
      type: "material",
      unit,
      topic,
      material,
    });

    scrollToTop();
  };

  const goToLanding = () => {
    setView({
      type: "landing",
    });

    scrollToTop();
  };

  const goToLandingSection = (
    sectionId: string,
  ) => {
    if (view.type === "landing") {
      scrollToSection(sectionId);
      return;
    }

    setView({
      type: "landing",
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToSection(sectionId);
      });
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: hypertext.fontFamily,
        backgroundColor:
          themeColors.background,
        color:
          themeColors.foreground,
      }}
    >
      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <nav
        className="sticky top-0 z-50 border-b backdrop-blur"
        style={{
          backgroundColor: isDark
            ? "rgba(21, 23, 28, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          borderColor:
            `${hypertext.primaryColor}20`,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <button
            type="button"
            onClick={goToLanding}
            className="flex items-center gap-3"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor:
                  `${hypertext.primaryColor}15`,
                color:
                  hypertext.primaryColor,
              }}
            >
              {subject.logoUrl ? (
                <img
                  src={subject.logoUrl}
                  alt=""
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <BookOpen className="h-5 w-5" />
              )}
            </div>

            <div className="hidden text-left sm:block">
              <p
                className="text-xs font-semibold uppercase tracking-[0.15em]"
                style={{
                  color:
                    themeColors.muted,
                }}
              >
                Hipertexto
              </p>

              <p
                className="text-sm font-bold"
                style={{
                  color:
                    themeColors.foreground,
                }}
              >
                {subject.name}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToLanding}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
              style={{
                color:
                  themeColors.foreground,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor =
                  themeColors.softSurface;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor =
                  "transparent";
              }}
            >
              <Home className="h-4 w-4" />

              <span className="hidden md:inline">
                Inicio
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                goToLandingSection(
                  "como-funciona",
                )
              }
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
              style={{
                color:
                  themeColors.foreground,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor =
                  themeColors.softSurface;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor =
                  "transparent";
              }}
            >
              <CircleHelp className="h-4 w-4" />

              <span className="hidden md:inline">
                Cómo funciona
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                goToLandingSection("unidades")
              }
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition"
              style={{
                color:
                  themeColors.foreground,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.backgroundColor =
                  themeColors.softSurface;
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.backgroundColor =
                  "transparent";
              }}
            >
              <BookOpen className="h-4 w-4" />

              <span className="hidden md:inline">
                Unidades
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* =====================================================
          MATERIAL
      ====================================================== */}

      {view.type === "material" && (
        <MaterialViewer
          material={view.material}
          onBack={() =>
            setView({
              type: "topic",
              unit: view.unit,
              topic: view.topic,
            })
          }
          primaryColor={
            hypertext.primaryColor
          }
          secondaryColor={
            hypertext.secondaryColor
          }
          theme={hypertext.theme}
        />
      )}

      {/* =====================================================
          TEMA
      ====================================================== */}

      {view.type === "topic" && (
  <TopicView
    topic={view.topic}
    unit={view.unit}
    subjectName={subject.name}
    onBack={() =>
      setView({
        type: "unit",
        unit: view.unit,
      })
    }
    onMaterialSelect={(material) =>
      openMaterial(
        view.unit,
        view.topic,
        material,
      )
    }
    primaryColor={
      hypertext.primaryColor
    }
    secondaryColor={
      hypertext.secondaryColor
    }
  />
)}

      {/* =====================================================
          UNIDAD
      ====================================================== */}

      {view.type === "unit" && (
        <UnitView
          unit={{
            ...view.unit,
            topics: getVisibleTopics(
              view.unit,
            ),
          }}
          subjectName={subject.name}
          onBack={() =>
            goToLandingSection("unidades")
          }
          onTopicSelect={(topic) =>
            openTopic(
              view.unit,
              topic,
            )
          }
          primaryColor={
            hypertext.primaryColor
          }
          secondaryColor={
            hypertext.secondaryColor
          }
          theme={hypertext.theme}
        />
      )}

      {/* =====================================================
          LANDING
      ====================================================== */}

      {view.type === "landing" && (
        <>
          {/* =====================================================
              HERO
          ====================================================== */}

          <section
            id="inicio"
            className="scroll-mt-20"
          >
            <div
              className="relative overflow-hidden"
              style={{
                background: `linear-gradient(
                  135deg,
                  ${hypertext.primaryColor}18,
                  ${hypertext.secondaryColor}20
                )`,
              }}
            >
              <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-28">
                <div className="flex flex-col justify-center">
                  <div
                    className="flex flex-wrap items-center gap-2 text-sm"
                    style={{
                      color:
                        themeColors.muted,
                    }}
                  >
                    <span>
                      {university.name}
                    </span>

                    <ChevronRight className="h-4 w-4" />

                    <span>
                      {faculty.name}
                    </span>

                    <ChevronRight className="h-4 w-4" />

                    <span>
                      {career.name}
                    </span>
                  </div>

                  <p
                    className="mt-8 text-sm font-bold uppercase tracking-[0.18em]"
                    style={{
                      color:
                        hypertext.primaryColor,
                    }}
                  >
                    {subject.abbreviation ??
                      "Materia"}
                  </p>

                  <h1
                    className="mt-3 text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl"
                    style={{
                      color:
                        themeColors.foreground,
                    }}
                  >
                    {hypertext.title}
                  </h1>

                  {hypertext.description && (
                    <p
                      className="mt-6 max-w-2xl text-base leading-8"
                      style={{
                        color:
                          themeColors.muted,
                      }}
                    >
                      {hypertext.description}
                    </p>
                  )}

                  <p
                    className="mt-6 text-sm"
                    style={{
                      color:
                        themeColors.muted,
                    }}
                  >
                    Elaborado por:{" "}
                    <span
                      className="font-semibold"
                      style={{
                        color:
                          themeColors.foreground,
                      }}
                    >
                      {hypertext.user.name}
                    </span>
                  </p>

                  <div className="mt-8">
                    <button
                      type="button"
                      onClick={() =>
                        scrollToSection(
                          "unidades",
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      style={{
                        backgroundColor:
                          hypertext.primaryColor,
                      }}
                    >
                      Comenzar

                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <div
                    className="aspect-[4/3] w-full max-w-xl overflow-hidden rounded-[2rem] border shadow-sm"
                    style={{
                      backgroundColor:
                        themeColors.surface,
                      borderColor:
                        `${hypertext.primaryColor}20`,
                    }}
                  >
                    {hypertext.coverImageUrl ? (
                      <img
                        src={
                          hypertext.coverImageUrl
                        }
                        alt={`Portada de ${hypertext.title}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full min-h-[300px] items-center justify-center"
                        style={{
                          background: `linear-gradient(
                            135deg,
                            ${hypertext.primaryColor}20,
                            ${hypertext.secondaryColor}30
                          )`,
                        }}
                      >
                        <BookOpen
                          className="h-16 w-16"
                          style={{
                            color:
                              hypertext.primaryColor,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              CÓMO FUNCIONA
          ====================================================== */}

          <section
            id="como-funciona"
            className="scroll-mt-20"
          >
            <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <p
                    className="text-sm font-bold uppercase tracking-[0.18em]"
                    style={{
                      color:
                        hypertext.primaryColor,
                    }}
                  >
                    Cómo funciona
                  </p>

                  <h2
                    className="mt-3 text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
                    style={{
                      color:
                        themeColors.foreground,
                    }}
                  >
                    Explora tu materia de una forma diferente.
                  </h2>

                  <p
                    className="mt-6 max-w-xl text-base leading-8"
                    style={{
                      color:
                        themeColors.muted,
                    }}
                  >
                    Este hipertexto organiza los
                    contenidos de la materia en una
                    experiencia visual, para que puedas
                    recorrer las unidades, consultar
                    los temas y acceder a sus
                    materiales.
                  </p>
                </div>

                <div
                  className="rounded-[2rem] p-8"
                  style={{
                    backgroundColor:
                      `${hypertext.secondaryColor}18`,
                  }}
                >
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{
                      backgroundColor:
                        themeColors.surface,
                    }}
                  >
                    <CircleHelp
                      className="h-6 w-6"
                      style={{
                        color:
                          hypertext.primaryColor,
                      }}
                    />
                  </div>

                  <h3
                    className="mt-6 text-xl font-bold"
                    style={{
                      color:
                        themeColors.foreground,
                    }}
                  >
                    Conoce cómo funciona
                  </h3>

                  <p
                    className="mt-2 text-sm leading-7"
                    style={{
                      color:
                        themeColors.muted,
                    }}
                  >
                    Aprende rápidamente cómo navegar
                    por este hipertexto y aprovechar sus
                    recursos.
                  </p>

                  <button
                    type="button"
                    className="mt-6 rounded-xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
                    style={{
                      backgroundColor:
                        themeColors.surface,
                      color:
                        hypertext.primaryColor,
                    }}
                  >
                    Ver explicación
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              UNIDADES / RECORRIDO
          ====================================================== */}

          <section
  id="unidades"
  className="scroll-mt-20"
>
  <UnitsView
    hypertextId={hypertext.id}
    units={hypertext.units}
    subjectName={subject.name}
    primaryColor={
      hypertext.primaryColor
    }
    secondaryColor={
      hypertext.secondaryColor
    }
    onUnitSelect={openUnit}
  />
</section>

          {/* =====================================================
              FOOTER
          ====================================================== */}

          <footer
            className="border-t"
            style={{
              borderColor:
                `${hypertext.primaryColor}20`,
            }}
          >
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-2 lg:px-10">
              <div>
                <p
                  className="text-sm font-bold"
                  style={{
                    color:
                      themeColors.foreground,
                  }}
                >
                  {university.name}
                </p>

                <p
                  className="mt-2 text-sm"
                  style={{
                    color:
                      themeColors.muted,
                  }}
                >
                  {faculty.name}
                </p>

                <p
                  className="text-sm"
                  style={{
                    color:
                      themeColors.muted,
                  }}
                >
                  {career.name}
                </p>

                <p
                  className="mt-4 text-sm"
                  style={{
                    color:
                      themeColors.muted,
                  }}
                >
                  {subject.name}
                </p>

                <p
                  className="mt-1 text-sm"
                  style={{
                    color:
                      themeColors.muted,
                  }}
                >
                  Elaborado por{" "}
                  {hypertext.user.name}
                </p>
              </div>

              <div className="md:text-right">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color:
                      themeColors.foreground,
                  }}
                >
                  Navegación
                </p>

                <div className="mt-3 flex flex-wrap gap-4 md:justify-end">
                  <button
                    type="button"
                    onClick={goToLanding}
                    className="text-sm transition"
                    style={{
                      color:
                        themeColors.muted,
                    }}
                  >
                    Inicio
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      goToLandingSection(
                        "como-funciona",
                      )
                    }
                    className="text-sm transition"
                    style={{
                      color:
                        themeColors.muted,
                    }}
                  >
                    Cómo funciona
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      goToLandingSection(
                        "unidades",
                      )
                    }
                    className="text-sm transition"
                    style={{
                      color:
                        themeColors.muted,
                    }}
                  >
                    Unidades
                  </button>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
