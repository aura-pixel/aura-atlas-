"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Link2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F1E7]">

      {/* =====================================================
          FONDO
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-[#E8AFC0]/20 blur-[110px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-[32rem] w-[32rem] rounded-full bg-[#8B9AAA]/15 blur-[110px]" />


      {/* =====================================================
          CONTENIDO
      ====================================================== */}

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[46%_54%]">


        {/* =================================================
            LADO VISUAL
        ================================================== */}

        <section className="relative flex min-h-[48vh] items-center justify-center overflow-hidden bg-[#4A1115] px-8 py-16 lg:min-h-screen">

          {/* Formas de fondo */}

          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full border border-[#FFFDF8]/10" />

          <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full border border-[#FFFDF8]/10" />

          <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full border border-[#E8AFC0]/15" />

          <div className="pointer-events-none absolute bottom-[-5rem] right-[-3rem] h-72 w-72 rounded-full bg-[#E8AFC0]/10 blur-3xl" />


          {/* Líneas / conexiones */}

          <div className="pointer-events-none absolute left-[12%] top-[28%] h-px w-40 rotate-[28deg] bg-[#FFFDF8]/15" />

          <div className="pointer-events-none absolute right-[10%] top-[38%] h-px w-36 -rotate-[25deg] bg-[#E8AFC0]/25" />

          <div className="pointer-events-none absolute bottom-[24%] left-[18%] h-px w-32 -rotate-[20deg] bg-[#FFFDF8]/10" />


          {/* Nodos */}

          <div className="absolute left-[18%] top-[24%] h-3 w-3 rounded-full border-2 border-[#E8AFC0]/50" />

          <div className="absolute right-[17%] top-[30%] h-2.5 w-2.5 rounded-full bg-[#E8AFC0]/60" />

          <div className="absolute bottom-[24%] right-[20%] h-3 w-3 rounded-full border-2 border-[#FFFDF8]/20" />

          <div className="absolute bottom-[31%] left-[15%] h-2 w-2 rounded-full bg-[#FFFDF8]/30" />


          {/* =================================================
              COMPOSICIÓN CENTRAL
          ================================================== */}

          <div className="relative">

            {/* Glow */}

            <div className="absolute inset-0 scale-125 rounded-full bg-[#E8AFC0]/10 blur-3xl" />


            {/* Anillo */}

            <div className="absolute -inset-10 rounded-[5rem] border border-[#FFFDF8]/10 rotate-[-6deg]" />

            <div className="absolute -inset-5 rounded-[4rem] border border-[#E8AFC0]/20 rotate-[5deg]" />


            {/* Tarjeta */}

            <div className="relative flex h-72 w-72 items-center justify-center rounded-[4rem] border border-[#FFFDF8]/15 bg-[#FFFDF8]/10 shadow-2xl backdrop-blur-md sm:h-80 sm:w-80">

              <div className="absolute inset-5 rounded-[3rem] bg-[#FFFDF8]/5" />

              <img
                src="/aura-atlas.png"
                alt="Aura Atlas"
                className="relative h-56 w-56 object-contain drop-shadow-2xl sm:h-64 sm:w-64"
              />

            </div>


            {/* Elemento flotante superior */}

            <div className="absolute -right-10 -top-8 flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-2xl border border-[#FFFDF8]/15 bg-[#FFFDF8]/10 text-[#FFFDF8] shadow-xl backdrop-blur-md">

              <BookOpen className="h-6 w-6" />

            </div>


            {/* Elemento flotante inferior */}

            <div className="absolute -bottom-7 -left-10 flex h-14 w-14 rotate-[-8deg] items-center justify-center rounded-2xl border border-[#E8AFC0]/20 bg-[#E8AFC0]/10 text-[#E8AFC0] shadow-xl backdrop-blur-md">

              <Link2 className="h-5 w-5" />

            </div>

          </div>


          {/* Firma */}

          <div className="absolute bottom-8 left-8 hidden sm:block">

            <p className="text-sm font-semibold tracking-tight text-[#FFFDF8]">
              Aura Atlas
            </p>

            <p className="mt-0.5 text-[11px] text-[#FFFDF8]/50">
              by Tzalli Studio
            </p>

          </div>


          {/* Texto visual */}

          <div className="absolute bottom-8 right-8 hidden text-right sm:block">

            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FFFDF8]/40">
              Organiza
            </p>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8AFC0]/70">
              Conecta
            </p>

            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FFFDF8]/40">
              Comparte
            </p>

          </div>

        </section>


        {/* =================================================
            LADO DE CONTENIDO
        ================================================== */}

        <section className="flex items-center px-7 py-16 sm:px-12 lg:px-16 xl:px-24">

          <div className="mx-auto w-full max-w-xl">


            {/* Marca móvil */}

            <div className="mb-12 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4A1115]">

                <img
                  src="/aura-atlas.png"
                  alt="Aura Atlas"
                  className="h-8 w-8"
                />

              </div>

              <div>

                <p className="text-sm font-semibold text-[#4A1115]">
                  Aura Atlas
                </p>

                <p className="text-[10px] text-[#687584]">
                  by Tzalli Studio
                </p>

              </div>

            </div>


            {/* Badge */}

            <div className="inline-flex items-center gap-2 rounded-full border border-[#4A1115]/10 bg-[#FFFDF8] px-4 py-2 shadow-sm">

              <Sparkles className="h-3.5 w-3.5 text-[#4A1115]" />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4A1115]">
                Tu espacio educativo
              </span>

            </div>


            {/* Título */}

            <h1 className="mt-7 text-5xl font-bold leading-[1.02] tracking-[-0.05em] text-[#211719] sm:text-6xl xl:text-7xl">

              Bienvenido a

              <br />

              <span className="relative inline-block text-[#4A1115]">

                Aura Atlas.

                <span className="absolute bottom-0 left-0 h-2 w-[72%] -rotate-[2deg] rounded-full bg-[#E8AFC0]/70" />

              </span>

            </h1>


            {/* Descripción */}

            <p className="mt-7 max-w-lg text-base leading-8 text-[#687584] sm:text-lg">

              Tu espacio para transformar el contenido de una materia en una
              experiencia de aprendizaje conectada.

            </p>


            {/* Pequeño mensaje */}

            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-[#4A1115]/10 bg-[#FFFDF8]/70 p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115]">

                <Sparkles className="h-4 w-4" />

              </div>

              <div>

                <p className="text-sm font-semibold text-[#211719]">
                  Empecemos por tu espacio académico.
                </p>

                <p className="mt-1 text-sm leading-6 text-[#687584]">
                  Primero configuraremos tu universidad, carrera y materias.
                </p>

              </div>

            </div>


            {/* Acción */}

            <Button
              size="lg"
              onClick={() => router.push("/teacher")}
              className="mt-8 h-14 rounded-2xl bg-[#4A1115] px-8 text-base font-semibold text-[#FFFDF8] shadow-xl shadow-[#4A1115]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#5D171D] hover:shadow-2xl"
            >

              Comenzar

              <ArrowRight className="ml-2 h-5 w-5" />

            </Button>


            {/* Mini proceso */}

            <div className="mt-12 flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8AFC0]/30 text-[#4A1115]">
                  <BookOpen className="h-3.5 w-3.5" />
                </div>

                <span className="text-xs font-medium text-[#687584]">
                  Materia
                </span>

              </div>


              <ArrowRight className="h-3.5 w-3.5 text-[#4A1115]/30" />


              <div className="flex items-center gap-2">

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FFFDF8] text-[#4A1115] shadow-sm">
                  <Link2 className="h-3.5 w-3.5" />
                </div>

                <span className="text-xs font-medium text-[#687584]">
                  Hipertexto
                </span>

              </div>

            </div>


            {/* Firma */}

            <p className="mt-12 text-[11px] text-[#687584]/70">
              Aura Atlas · by Tzalli Studio
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}