import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  FileText,
  Link2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F1E7] px-6 pb-24 pt-32">

      {/* =====================================================
          FONDO
      ====================================================== */}

      {/* Mancha rosa izquierda */}
      <div className="pointer-events-none absolute -left-40 top-24 h-[30rem] w-[30rem] rounded-full bg-[#E8AFC0]/25 blur-[100px]" />

      {/* Mancha azul derecha */}
      <div className="pointer-events-none absolute -right-40 top-[38%] h-[28rem] w-[28rem] rounded-full bg-[#8B9AAA]/20 blur-[100px]" />

      {/* Mancha rosa inferior */}
      <div className="pointer-events-none absolute bottom-[-12rem] left-[35%] h-[32rem] w-[32rem] rounded-full bg-[#E8AFC0]/20 blur-[110px]" />


      {/* =====================================================
          GRID
      ====================================================== */}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black)]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(74,17,21,0.10) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(74,17,21,0.10) 1px, transparent 1px)
            `,
            backgroundSize: "42px 42px",
          }}
        />
      </div>


      {/* =====================================================
          LÍNEAS DEL MAPA
      ====================================================== */}

      {/* Línea izquierda */}
      <div className="pointer-events-none absolute left-[9%] top-[38%] hidden lg:block">
        <div className="relative h-32 w-48">

          <div className="absolute left-8 top-5 h-px w-28 rotate-[24deg] bg-[#4A1115]/20" />

          <div className="absolute left-[7.25rem] top-[3.1rem] h-2.5 w-2.5 rounded-full border-2 border-[#4A1115]/40 bg-[#F7F1E7]" />

          <div className="absolute left-[9rem] top-[3.5rem] h-16 w-px rotate-[25deg] bg-[#4A1115]/15" />

        </div>
      </div>


      {/* Línea derecha */}
      <div className="pointer-events-none absolute right-[8%] top-[42%] hidden lg:block">
        <div className="relative h-40 w-56">

          <div className="absolute right-5 top-8 h-px w-36 -rotate-[23deg] bg-[#4A1115]/20" />

          <div className="absolute right-[8.5rem] top-[2.35rem] h-2.5 w-2.5 rounded-full border-2 border-[#4A1115]/40 bg-[#F7F1E7]" />

          <div className="absolute right-[9.5rem] top-[2.7rem] h-16 w-px rotate-[23deg] bg-[#4A1115]/15" />

        </div>
      </div>


      {/* =====================================================
          TARJETA — MATERIA
      ====================================================== */}

      <div className="pointer-events-none absolute left-[5%] top-[31%] hidden lg:block">
        <div className="relative h-32 w-36 rotate-[-7deg] rounded-[1.5rem] border border-[#4A1115]/10 bg-[#FFFDF8]/90 p-4 shadow-xl shadow-[#4A1115]/5 backdrop-blur-sm">

          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]/50">
              01
            </span>

            <BookOpen className="h-4 w-4 text-[#4A1115]" />
          </div>

          <p className="mt-4 text-xs font-semibold text-[#4A1115]">
            Materia
          </p>

          <div className="mt-2 h-1.5 w-16 rounded-full bg-[#E8AFC0]" />
          <div className="mt-1.5 h-1.5 w-10 rounded-full bg-[#8B9AAA]/40" />

        </div>
      </div>


      {/* =====================================================
          ETIQUETA — CONECTAR
      ====================================================== */}

      <div className="pointer-events-none absolute right-[8%] top-[27%] hidden lg:block">
        <div className="flex rotate-[5deg] items-center gap-2 rounded-full border border-[#4A1115]/10 bg-[#FFFDF8]/85 px-4 py-2 shadow-lg shadow-[#4A1115]/5 backdrop-blur-sm">

          <span className="h-2 w-2 rounded-full bg-[#E8AFC0]" />

          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]/70">
            Conectar
          </span>

          <Link2 className="h-3.5 w-3.5 text-[#4A1115]" />

        </div>
      </div>


      {/* =====================================================
          TARJETA — RECURSOS
      ====================================================== */}

      <div className="pointer-events-none absolute right-[5%] top-[53%] hidden lg:block">
        <div className="relative w-44 rotate-[6deg] rounded-[1.6rem] border border-[#8B9AAA]/20 bg-[#FFFDF8]/90 p-4 shadow-xl shadow-[#8B9AAA]/10 backdrop-blur-sm">

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115]">
              <FileText className="h-4 w-4" />
            </div>

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#4A1115]/50">
                Recursos
              </p>

              <p className="text-xs font-semibold text-[#4A1115]">
                Materiales
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-1.5">
            <span className="rounded-full bg-[#4A1115]/8 px-2 py-1 text-[9px] text-[#4A1115]/70">
              PDF
            </span>

            <span className="rounded-full bg-[#8B9AAA]/15 px-2 py-1 text-[9px] text-[#4A1115]/70">
              Video
            </span>

            <span className="rounded-full bg-[#E8AFC0]/30 px-2 py-1 text-[9px] text-[#4A1115]/70">
              Link
            </span>
          </div>

        </div>
      </div>


      {/* =====================================================
          NODO DECORATIVO SUPERIOR
      ====================================================== */}

      <div className="pointer-events-none absolute left-[31%] top-[24%] hidden lg:block">
        <div className="relative">

          <div className="h-3 w-3 rounded-full border-2 border-[#4A1115]/30 bg-[#F7F1E7]" />

          <div className="absolute left-1/2 top-3 h-12 w-px bg-[#4A1115]/10" />

        </div>
      </div>


      {/* =====================================================
          CONTENIDO PRINCIPAL
      ====================================================== */}

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center text-center">

        {/* Logo */}

        <div className="mb-7 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.6rem] border border-[#4A1115]/10 bg-[#FFFDF8] shadow-xl shadow-[#4A1115]/10">

          <img
            src="/aura-atlas.png"
            alt="Aura Atlas"
            className="h-14 w-14 object-contain"
          />

        </div>


        {/* Badge */}

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#4A1115]/15 bg-[#FFFDF8]/80 px-4 py-2 shadow-sm backdrop-blur">

          <Sparkles className="h-3.5 w-3.5 text-[#4A1115]" />

          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#4A1115]">
            Plataforma educativa
          </span>

        </div>


        {/* Heading */}

        <h1 className="max-w-4xl text-5xl font-bold leading-[0.98] tracking-[-0.045em] text-[#211719] md:text-7xl">

          El conocimiento de tu{" "}

          <span className="relative inline-block">

            <span className="relative z-10 text-[#4A1115]">
              universidad,
            </span>

            {/* Trazo */}
            <span className="absolute bottom-1 left-[-3%] z-0 h-3 w-[106%] -rotate-[2deg] rounded-full bg-[#E8AFC0]/75" />

          </span>{" "}

          conectado.

        </h1>


        {/* Description */}

        <p className="mt-7 max-w-2xl text-base leading-8 text-[#687584] md:text-lg">
          Crea, organiza y comparte hipertextos educativos para transformar
          la manera en que tus estudiantes exploran el conocimiento.
        </p>


        {/* CTA */}

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">

          <Link href="/register">

            <Button
              size="lg"
              className="rounded-xl bg-[#4A1115] px-8 py-6 text-base font-semibold text-[#FFFDF8] shadow-xl shadow-[#4A1115]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#5D171D] hover:shadow-2xl"
            >
              Comenzar

              <ArrowRight className="ml-2 h-5 w-5" />

            </Button>

          </Link>


          <a
            href="#como-funciona"
            className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-[#687584] transition-colors hover:text-[#4A1115]"
          >
            Explorar Aura Atlas

            <ArrowDown className="h-4 w-4" />

          </a>

        </div>


        {/* =================================================
            MINI FLUJO
        ================================================== */}

        <div className="mt-14 flex items-center gap-2 rounded-[1.25rem] border border-[#4A1115]/10 bg-[#FFFDF8]/80 px-4 py-3 shadow-lg shadow-[#4A1115]/5 backdrop-blur-sm">

          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8AFC0]/30 text-[#4A1115]">
            <FileText className="h-4 w-4" />
          </div>

          <span className="text-xs font-medium text-[#687584]">
            Crear
          </span>

          <ArrowRight className="h-3.5 w-3.5 text-[#4A1115]/35" />

          <span className="text-xs font-medium text-[#687584]">
            Organizar
          </span>

          <ArrowRight className="h-3.5 w-3.5 text-[#4A1115]/35" />

          <span className="text-xs font-medium text-[#687584]">
            Conectar
          </span>

          <ArrowRight className="h-3.5 w-3.5 text-[#4A1115]/35" />

          <span className="text-xs font-medium text-[#687584]">
            Compartir
          </span>

        </div>

      </div>


      {/* =====================================================
          PEQUEÑOS NODOS
      ====================================================== */}

      <div className="pointer-events-none absolute bottom-[22%] left-[20%] hidden lg:block">
        <div className="flex items-center gap-3">

          <div className="h-2 w-2 rounded-full bg-[#E8AFC0]" />

          <div className="h-px w-16 bg-[#4A1115]/15" />

          <div className="h-3 w-3 rounded-full border border-[#4A1115]/25" />

        </div>
      </div>


      <div className="pointer-events-none absolute bottom-[17%] right-[22%] hidden lg:block">
        <div className="flex items-center gap-3">

          <div className="h-3 w-3 rounded-full border border-[#8B9AAA]/40" />

          <div className="h-px w-12 bg-[#8B9AAA]/30" />

          <Sparkles className="h-3.5 w-3.5 text-[#4A1115]/40" />

        </div>
      </div>

    </section>
  );
}