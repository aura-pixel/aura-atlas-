"use client";

import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LogOut,
  Plus,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { BetaBanner } from "@/components/teacher/BetaBanner";

type AcademicContext = {
  name: string;
};

type Subject = {
  id: string;
  name: string;
  abbreviation?: string;
  description?: string;
  color?: string;
};

type TeacherDashboardProps = {
  userName?: string;
  university?: AcademicContext;
  faculty?: AcademicContext;
  career?: AcademicContext;
  subjects?: Subject[];
  onCreateSubject?: () => void;
};

export function TeacherDashboard({
  userName = "Docente",
  university = {
    name: "Universidad Autónoma del Estado de México",
  },
  faculty = {
    name: "Facultad de Medicina",
  },
  career = {
    name: "Terapia Ocupacional",
  },
  subjects = [],
  onCreateSubject,
}: TeacherDashboardProps) {
  const router = useRouter();

  const handleCreateSubject = () => {
    if (onCreateSubject) {
      onCreateSubject();
    } else {
      router.push("/teacher/subjects/new");
    }
  };

  const handleLogout = () => {
  localStorage.removeItem("auth");
  router.replace("/");
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F1E7] text-[#211719]">

<BetaBanner />

      {/* =====================================================
          DECORACIÓN DE FONDO
      ====================================================== */}

      <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-[#E8AFC0]/25 blur-[100px]" />

      <div className="pointer-events-none absolute -right-32 top-[38%] h-80 w-80 rounded-full bg-[#8B9AAA]/20 blur-[110px]" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#E8AFC0]/15 blur-[100px]" />


      {/* =====================================================
          NAVBAR
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-[#4A1115]/10 bg-[#FFFDF8]/75 backdrop-blur-xl">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

          {/* Marca */}

          <Link
            href="/teacher/dashboard"
            className="flex items-center gap-3"
          >

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4A1115] shadow-lg shadow-[#4A1115]/15">

              <img
                src="/aura-atlas.png"
                alt="Aura Atlas"
                className="h-8 w-8"
              />

            </div>

            <div className="hidden sm:block">

              <p className="text-sm font-semibold tracking-tight text-[#4A1115]">
                Aura Atlas
              </p>

              <p className="text-[10px] text-[#687584]">
                by Tzalli Studio
              </p>

            </div>

          </Link>

          {/* Perfil + cerrar sesión */}

<div className="flex items-center gap-3">

  <div className="hidden text-right sm:block">
    <p className="text-sm font-medium text-[#211719]">
      {userName}
    </p>

    <p className="text-xs text-[#687584]">
      Docente
    </p>
  </div>

  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8AFC0]/50 text-sm font-semibold text-[#4A1115]">
    {userName.charAt(0).toUpperCase()}
  </div>

  <div className="h-7 w-px bg-[#4A1115]/10" />

  <button
    type="button"
    onClick={handleLogout}
    title="Cerrar sesión"
    className="flex h-10 w-10 items-center justify-center rounded-xl text-[#687584] transition-all duration-200 hover:bg-[#4A1115]/5 hover:text-[#4A1115]"
  >
    <LogOut className="h-4 w-4" />
  </button>

</div>


        </div>

      </header>


      {/* =====================================================
          CONTENIDO
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">


        {/* =================================================
            BIENVENIDA
        ================================================== */}

        <section className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">

          <div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#4A1115]/10 bg-[#FFFDF8]/80 px-4 py-2 shadow-sm">

              <Sparkles className="h-3.5 w-3.5 text-[#4A1115]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
                Espacio docente
              </span>

            </div>


            <h1 className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl lg:text-6xl">

              Hola, {userName}.

              <span className="ml-2 inline-block">
                👋
              </span>

            </h1>


            <p className="mt-5 max-w-2xl text-base leading-8 text-[#687584] sm:text-lg">
              Este es tu espacio para transformar el conocimiento de tus
              materias en experiencias que puedan explorar tus estudiantes.
            </p>

          </div>


          {/* Acción */}

          {subjects.length > 0 && (
            <Button
              size="lg"
              onClick={handleCreateSubject}
              className="h-12 rounded-xl bg-[#4A1115] px-5 text-sm font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/20 transition-all hover:-translate-y-1 hover:bg-[#5D171D]"
            >

              <Plus className="mr-2 h-4 w-4" />

              Nueva materia

            </Button>
          )}

        </section>


        {/* =================================================
            CONTEXTO ACADÉMICO
        ================================================== */}

        <section className="mt-14">

          <div className="relative overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#4A1115] p-8 text-[#FFFDF8] shadow-xl shadow-[#4A1115]/10 sm:p-10 lg:p-12">

            {/* Decoraciones */}

            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[35px] border-[#E8AFC0]/10" />

            <div className="pointer-events-none absolute bottom-[-80px] left-1/2 h-48 w-48 rounded-full bg-[#E8AFC0]/10 blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">

              <div>

                <div className="flex items-center gap-2 text-[#E8AFC0]">

                  <GraduationCap className="h-4 w-4" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                    Tu contexto académico
                  </span>

                </div>


                <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl">

                  {career.name}

                </h2>


                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#FFFDF8]/60">

                  <span>
                    {faculty.name}
                  </span>

                  <span className="text-[#E8AFC0]">
                    •
                  </span>

                  <span>
                    {university.name}
                  </span>

                </div>

              </div>


              {/* Contador */}

              <div className="flex items-end gap-4">

                <div className="h-12 w-px bg-white/10" />

                <div>

                  <p className="text-4xl font-semibold tracking-tight text-[#FFFDF8]">
                    {subjects.length}
                  </p>

                  <p className="mt-1 text-xs text-[#FFFDF8]/50">
                    {subjects.length === 1
                      ? "materia"
                      : "materias"}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            MATERIAS
        ================================================== */}

        <section className="mt-16">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <div className="flex items-center gap-3">

                <span className="h-px w-8 bg-[#4A1115]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
                  Tu contenido
                </span>

              </div>


              <h2 className="mt-4 text-3xl font-bold tracking-[-0.035em] sm:text-4xl">

                Tus materias

              </h2>

            </div>


            {subjects.length > 0 && (
              <span className="text-sm text-[#687584]">
                {subjects.length}{" "}
                {subjects.length === 1
                  ? "espacio"
                  : "espacios"}{" "}
                de aprendizaje
              </span>
            )}

          </div>


          {/* =================================================
              ESTADO VACÍO
          ================================================== */}

          {subjects.length === 0 && (

            <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] px-6 py-16 shadow-sm sm:px-12">

              {/* Formas */}

              <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#E8AFC0]/30" />

              <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full border-[25px] border-[#8B9AAA]/15" />

              <div className="relative mx-auto max-w-xl text-center">

                <div className="mx-auto flex h-20 w-20 rotate-[-4deg] items-center justify-center rounded-[1.75rem] bg-[#E8AFC0]/40 text-[#4A1115] shadow-sm">

                  <BookOpen className="h-9 w-9" />

                </div>


                <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
                  Primer paso
                </p>


                <h3 className="mt-3 text-3xl font-bold tracking-[-0.035em]">
                  Empieza por una materia.
                </h3>


                <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#687584]">
                  Crea tu primera materia y comienza a construir el espacio
                  donde organizarás unidades, temas, recursos e hipertextos.
                </p>


                <Button
                  size="lg"
                  onClick={handleCreateSubject}
                  className="mt-8 h-12 rounded-xl bg-[#4A1115] px-6 text-sm font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/20 transition-all hover:-translate-y-1 hover:bg-[#5D171D]"
                >

                  Crear mi primera materia

                  <ArrowRight className="ml-2 h-4 w-4" />

                </Button>

              </div>

            </div>

          )}


          {/* =================================================
              MATERIAS REALES
          ================================================== */}

          {subjects.length > 0 && (

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {subjects.map((subject, index) => (

                <Link
                  key={subject.id}
                  href={`/teacher/subjects/${subject.id}`}
                  className="group relative block overflow-hidden rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-7 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#4A1115]/10"
                >

                  {/* Color de materia */}

                  <div
                    className="absolute left-0 top-0 h-1.5 w-full"
                    style={{
                      backgroundColor:
                        subject.color || "#4A1115",
                    }}
                  />


                  {/* Número */}

                  <div className="flex items-start justify-between">

                    <span className="text-5xl font-bold tracking-[-0.06em] text-[#4A1115]/10">
                      {String(index + 1).padStart(2, "0")}
                    </span>


                    {subject.abbreviation && (

                      <span className="rounded-full bg-[#F7F1E7] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#687584]">
                        {subject.abbreviation}
                      </span>

                    )}

                  </div>


                  {/* Icono */}

                  <div className="mt-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115] transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">

                    <BookOpen className="h-5 w-5" />

                  </div>


                  {/* Información */}

                  <h3 className="mt-6 text-xl font-semibold tracking-tight text-[#211719]">
                    {subject.name}
                  </h3>


                  {subject.description && (

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#687584]">
                      {subject.description}
                    </p>

                  )}


                  {/* Link */}

                  <div className="mt-7 flex items-center justify-between">

                    <span className="text-sm font-semibold text-[#4A1115]">
                      Abrir materia
                    </span>

                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#4A1115]/10 text-[#4A1115] transition-all duration-300 group-hover:bg-[#4A1115] group-hover:text-[#FFFDF8]">

                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />

                    </div>

                  </div>

                </Link>

              ))}


              {/* Nueva materia */}

              <button
                type="button"
                onClick={handleCreateSubject}
                className="group flex min-h-[280px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[#4A1115]/20 bg-[#FFFDF8]/50 p-7 text-center transition-all duration-300 hover:border-[#4A1115]/40 hover:bg-[#FFFDF8]"
              >

                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#4A1115]/15 text-[#4A1115] transition-all duration-300 group-hover:rotate-90 group-hover:bg-[#4A1115] group-hover:text-[#FFFDF8]">

                  <Plus className="h-5 w-5" />

                </div>


                <p className="mt-5 text-sm font-semibold text-[#4A1115]">
                  Nueva materia
                </p>


                <p className="mt-1 max-w-[180px] text-xs leading-5 text-[#687584]">
                  Añade otro espacio para organizar tu conocimiento.
                </p>

              </button>

            </div>

          )}

        </section>


        {/* =================================================
            FIRMA
        ================================================== */}

        <div className="mt-20 flex flex-col items-center justify-between gap-3 border-t border-[#4A1115]/10 pt-6 text-[11px] text-[#687584]/70 sm:flex-row">

          <span>
            Aura Atlas
          </span>

          <span>
            by Tzalli Studio
          </span>

        </div>

      </div>

    </main>
  );
}