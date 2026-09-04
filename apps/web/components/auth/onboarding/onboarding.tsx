"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  Link2,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/onboarding/use-onboardings";
import { patch } from "@/lib/api";

import { UniversityList } from "./university-list";
import { FacultyList } from "./faculty-list";
import { CareerList } from "./career-list";

export function Onboarding() {
  const router = useRouter();

  const {
    loading,
    universities,
    faculties,
    careers,
    selectedUniversity,
    selectedFaculty,
    selectedCareer,
    setSelectedUniversity,
    setSelectedFaculty,
    setSelectedCareer,
  } = useOnboarding();

  const [universitySearch, setUniversitySearch] = useState("");

  const currentStep = !selectedUniversity
    ? 1
    : !selectedFaculty
      ? 2
      : 3;

  const canContinue =
    !!selectedUniversity &&
    !!selectedFaculty &&
    !!selectedCareer;

  /**
   * Filtrado en tiempo real de universidades.
   *
   * No modificamos el hook ni la información original:
   * solamente filtramos lo que se muestra.
   */
  const filteredUniversities = useMemo(() => {
    const search = universitySearch.trim().toLowerCase();

    if (!search) {
      return universities;
    }

    return universities.filter((university) =>
      university.name.toLowerCase().includes(search)
    );
  }, [universities, universitySearch]);

  function handleBack() {
    if (currentStep === 3) {
      setSelectedCareer(null);
      return;
    }

    if (currentStep === 2) {
      setSelectedFaculty(null);
      return;
    }

    router.push("/welcome");
  }

  async function handleContinue() {
    if (!selectedCareer) return;

    try {
      await patch("/users/me/career", {
        careerId: selectedCareer.id,
      });

      router.push("/teacher/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F1E8] px-6">
        <BackgroundDecoration />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-[#5A1118]/10 bg-[#FFFDF9] shadow-xl shadow-[#5A1118]/10">
            <Loader2 className="h-7 w-7 animate-spin text-[#5A1118]" />
          </div>

          <p className="mt-5 text-sm font-medium text-[#718096]">
            Preparando tu espacio...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F1E8] text-[#21191B]">
      <BackgroundDecoration />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-7 lg:px-10 lg:py-9">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}

        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#718096] transition-all hover:bg-[#FFFDF9]/80 hover:text-[#5A1118]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Atrás
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5A1118]/10 bg-[#FFFDF9] shadow-sm">
              <img
                src="/aura-atlas.png"
                alt="Aura Atlas"
                className="h-7 w-7 object-contain"
              />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none text-[#21191B]">
                Aura Atlas
              </p>

              <p className="mt-1 text-[10px] leading-none text-[#718096]">
                by Tzalli Studio
              </p>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Intro                                                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="mx-auto mt-12 max-w-3xl text-center lg:mt-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-[#5A1118]/10 bg-[#FFFDF9] text-[#5A1118] shadow-lg shadow-[#5A1118]/10">
            <Sparkles className="h-6 w-6" />
          </div>

          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#5A1118]/10 bg-[#FFFDF9]/80 px-4 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D99AAA]" />

            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5A1118]">
              Configura tu espacio
            </span>
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-[-0.035em] text-[#21191B] sm:text-5xl lg:text-[3.65rem] lg:leading-[1.02]">
            Cuéntanos dónde{" "}
            <span className="relative inline-block text-[#5A1118]">
              enseñas.
              <span className="absolute -bottom-1 left-0 h-2 w-full -rotate-1 rounded-full bg-[#E8B4C2]" />
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#718096] sm:text-lg">
            Selecciona tu universidad, facultad y carrera para construir
            tu espacio académico dentro de Aura Atlas.
          </p>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Stepper                                                          */}
        {/* ---------------------------------------------------------------- */}

        <div className="mx-auto mt-11 max-w-xl">
          <div className="flex items-start justify-center">
            <StepIndicator
              number={1}
              label="Universidad"
              active={currentStep === 1}
              completed={currentStep > 1}
            />

            <StepConnector completed={currentStep > 1} />

            <StepIndicator
              number={2}
              label="Facultad"
              active={currentStep === 2}
              completed={currentStep > 2}
            />

            <StepConnector completed={currentStep > 2} />

            <StepIndicator
              number={3}
              label="Carrera"
              active={currentStep === 3}
              completed={false}
            />
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Content                                                          */}
        {/* ---------------------------------------------------------------- */}

        <section className="mx-auto mt-12 max-w-4xl lg:mt-14">
          {currentStep === 1 && (
            <StepSection
              icon={GraduationCap}
              step="Paso 1"
              title="Selecciona tu universidad"
              description="Busca y selecciona la institución a la que perteneces."
            >
              {/* Search */}
              <div className="mb-5">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8A929E]" />

                  <input
                    type="search"
                    value={universitySearch}
                    onChange={(event) =>
                      setUniversitySearch(event.target.value)
                    }
                    placeholder="Buscar universidad..."
                    aria-label="Buscar universidad"
                    className="h-13 w-full rounded-2xl border border-[#DED8D0] bg-[#FFFDF9] pl-11 pr-12 text-sm text-[#21191B] shadow-sm outline-none transition-all placeholder:text-[#A0A6AF] focus:border-[#5A1118]/40 focus:ring-4 focus:ring-[#5A1118]/[0.06]"
                  />

                  {universitySearch && (
                    <button
                      type="button"
                      onClick={() => setUniversitySearch("")}
                      aria-label="Limpiar búsqueda"
                      className="absolute right-4 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#8A929E] transition-colors hover:bg-[#F1E9E0] hover:text-[#5A1118]"
                    >
                      ×
                    </button>
                  )}
                </div>

                {universitySearch && (
                  <p className="mt-2 px-1 text-xs text-[#718096]">
                    {filteredUniversities.length === 0
                      ? "No encontramos coincidencias."
                      : filteredUniversities.length === 1
                        ? "1 universidad encontrada."
                        : `${filteredUniversities.length} universidades encontradas.`}
                  </p>
                )}
              </div>

              {/* University list */}
              {filteredUniversities.length > 0 ? (
                <UniversityList
                  universities={filteredUniversities}
                  selectedUniversity={selectedUniversity}
                  onSelect={setSelectedUniversity}
                />
              ) : (
                <EmptySearchState search={universitySearch} />
              )}

              {/* Secondary action */}
              <div className="mt-6 text-center">
                <a
                  href="/request-university"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A1118] underline decoration-[#D99AAA] decoration-1 underline-offset-4 transition-colors hover:text-[#3E0B10] hover:decoration-[#5A1118]"
                >
                  ¿No encuentras tu universidad?
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </StepSection>
          )}

          {currentStep === 2 && (
            <StepSection
              icon={Building2}
              step="Paso 2"
              title="Selecciona tu facultad"
              description={
                <>
                  Estas son las facultades disponibles en{" "}
                  <span className="font-medium text-[#21191B]">
                    {selectedUniversity?.name}
                  </span>
                  .
                </>
              }
            >
              {faculties.length > 0 ? (
                <FacultyList
                  faculties={faculties}
                  selectedFaculty={selectedFaculty}
                  onSelect={setSelectedFaculty}
                />
              ) : (
                <EmptyState
                  title="No encontramos facultades"
                  description="Todavía no hay facultades disponibles para esta universidad."
                />
              )}
            </StepSection>
          )}

          {currentStep === 3 && (
            <StepSection
              icon={GraduationCap}
              step="Paso 3"
              title="Selecciona tu carrera"
              description="Elige la carrera en la que impartes clases."
            >
              {careers.length > 0 ? (
                <CareerList
                  careers={careers}
                  selectedCareer={selectedCareer}
                  onSelect={setSelectedCareer}
                />
              ) : (
                <EmptyState
                  title="No encontramos carreras"
                  description="Todavía no hay carreras disponibles para esta facultad."
                />
              )}
            </StepSection>
          )}
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Action footer                                                    */}
        {/* ---------------------------------------------------------------- */}

        <footer className="mx-auto mt-10 flex max-w-4xl items-center justify-between gap-4 border-t border-[#DED8D0]/80 pt-6">
          <div className="hidden items-center gap-2.5 text-sm text-[#718096] sm:flex">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                canContinue
                  ? "bg-[#5A1118] text-white shadow-md shadow-[#5A1118]/15"
                  : "border border-[#DED8D0] bg-[#FFFDF9] text-[#A0A6AF]"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
            </div>

            <span>
              {canContinue
                ? "Tu espacio está listo"
                : "Completa los tres pasos"}
            </span>
          </div>

          {currentStep === 3 && (
            <Button
              size="lg"
              disabled={!canContinue}
              onClick={handleContinue}
              className="ml-auto h-12 rounded-xl bg-[#5A1118] px-7 text-white shadow-lg shadow-[#5A1118]/15 transition-all hover:-translate-y-0.5 hover:bg-[#470C12] hover:shadow-xl hover:shadow-[#5A1118]/20 disabled:translate-y-0 disabled:bg-[#5A1118]/40 disabled:shadow-none"
            >
              Guardar y continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </footer>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

type StepSectionProps = {
  icon: typeof GraduationCap;
  step: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
};

function StepSection({
  icon: Icon,
  step,
  title,
  description,
  children,
}: StepSectionProps) {
  return (
    <div>
      <div className="mb-7">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#5A1118]/10 bg-[#FFFDF9]/80 px-3 py-1.5 shadow-sm">
          <Icon className="h-3.5 w-3.5 text-[#5A1118]" />

          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#5A1118]">
            {step}
          </span>
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-[-0.025em] text-[#21191B] sm:text-3xl">
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#718096] sm:text-base">
          {description}
        </p>
      </div>

      {children}
    </div>
  );
}

type StepIndicatorProps = {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
};

function StepIndicator({
  number,
  label,
  active,
  completed,
}: StepIndicatorProps) {
  return (
    <div className="flex min-w-[76px] flex-col items-center gap-2">
      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold transition-all ${
          completed
            ? "border-[#5A1118] bg-[#5A1118] text-white shadow-md shadow-[#5A1118]/20"
            : active
              ? "border-[#5A1118]/30 bg-[#F4E2E4] text-[#5A1118] shadow-md shadow-[#5A1118]/10"
              : "border-[#DED8D0] bg-[#FFFDF9] text-[#8A929E]"
        }`}
      >
        {completed ? <Check className="h-4 w-4" /> : number}

        {active && (
          <span className="absolute inset-[-5px] rounded-full border border-[#D99AAA]/40" />
        )}
      </div>

      <span
        className={`text-[11px] font-medium ${
          active || completed
            ? "text-[#21191B]"
            : "text-[#8A929E]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function StepConnector({ completed }: { completed: boolean }) {
  return (
    <div
      className={`mt-[22px] h-px w-12 transition-colors sm:w-20 ${
        completed ? "bg-[#5A1118]/45" : "bg-[#DED8D0]"
      }`}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Empty states                                                               */
/* -------------------------------------------------------------------------- */

type EmptySearchStateProps = {
  search: string;
};

function EmptySearchState({ search }: EmptySearchStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-[#D8CFC7] bg-[#FFFDF9]/70 px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4E2E4] text-[#5A1118]">
        <Search className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-[#21191B]">
        No encontramos esa universidad
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718096]">
        No hay resultados para{" "}
        <span className="font-medium text-[#21191B]">
          “{search}”
        </span>
        . Prueba con otro nombre o revisa la lista completa.
      </p>
    </div>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
};

function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-[#D8CFC7] bg-[#FFFDF9]/70 px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1E9E0] text-[#718096]">
        <GraduationCap className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-[#21191B]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#718096]">
        {description}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Background                                                                 */
/* -------------------------------------------------------------------------- */

function BackgroundDecoration() {
  return (
    <>
      {/* Warm pink glow */}
      <div className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-[#E8B4C2]/20 blur-3xl" />

      {/* Burgundy glow */}
      <div className="pointer-events-none absolute -right-48 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[#5A1118]/[0.035] blur-3xl" />

      {/* Center warmth */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-[#EDE1D5]/50 blur-3xl" />

      {/* Decorative dots */}
      <div className="pointer-events-none absolute left-[8%] top-[32%] hidden h-3 w-3 rounded-full border border-[#5A1118]/25 lg:block" />

      <div className="pointer-events-none absolute right-[10%] top-[24%] hidden h-2 w-2 rounded-full bg-[#D99AAA]/60 lg:block" />

      <div className="pointer-events-none absolute bottom-[16%] right-[13%] hidden h-4 w-4 rounded-full border border-[#5A1118]/10 lg:block" />

      {/* Fine editorial lines */}
      <div className="pointer-events-none absolute left-[5%] top-[46%] hidden h-px w-28 rotate-[12deg] bg-[#5A1118]/[0.08] lg:block" />

      <div className="pointer-events-none absolute right-[5%] top-[38%] hidden h-px w-32 -rotate-[12deg] bg-[#5A1118]/[0.07] lg:block" />
    </>
  );
}