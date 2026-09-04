import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Link2,
  Sparkles,
} from "lucide-react";

const features = [
  {
    number: "01",
    icon: BookOpen,
    title: "Organiza",
    description:
      "Estructura el conocimiento de tu universidad desde la materia hasta cada contenido.",
    type: "large",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Crea",
    description:
      "Construye hipertextos educativos interactivos y adapta el contenido a tu forma de enseñar.",
    type: "small",
  },
  {
    number: "03",
    icon: Link2,
    title: "Conecta",
    description:
      "Integra temas, recursos y contenidos en una experiencia de aprendizaje coherente.",
    type: "small",
  },
];

export function Features() {
  return (
    <section
      id="que-es"
      className="relative overflow-hidden bg-[#F7F1E7] px-6 py-32"
    >
      {/* =====================================================
          DECORACIÓN DE FONDO
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#E8AFC0]/20 blur-[100px]" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#8B9AAA]/15 blur-[110px]" />

      {/* pequeños puntos */}

      <div className="pointer-events-none absolute left-[7%] top-[18%] hidden lg:block">
        <div className="h-3 w-3 rounded-full bg-[#E8AFC0]/70" />
      </div>

      <div className="pointer-events-none absolute right-[12%] top-[24%] hidden lg:block">
        <div className="h-2 w-2 rounded-full bg-[#4A1115]/30" />
      </div>

      <div className="pointer-events-none absolute bottom-[15%] left-[15%] hidden lg:block">
        <div className="h-2.5 w-2.5 rounded-full border-2 border-[#8B9AAA]/50" />
      </div>


      {/* =====================================================
          CONTENIDO
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* =================================================
            ENCABEZADO
        ================================================== */}

        <div className="max-w-3xl">

          <div className="flex items-center gap-3">

            <span className="h-px w-10 bg-[#4A1115]" />

            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
              Conocimiento conectado
            </span>

          </div>


          <h2 className="mt-6 text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[#211719] md:text-6xl">

            Más que contenido.

            <br />

            <span className="relative inline-block text-[#4A1115]">

              Una experiencia de aprendizaje.

              <span className="absolute -bottom-1 left-0 h-2 w-[72%] -rotate-[1deg] rounded-full bg-[#E8AFC0]/70" />

            </span>

          </h2>


          <p className="mt-7 max-w-2xl text-base leading-8 text-[#687584] md:text-lg">
            Aura Atlas convierte la estructura académica de una universidad
            en un espacio digital donde el conocimiento puede organizarse,
            conectarse y explorarse.
          </p>

        </div>


        {/* =================================================
            BENTO
        ================================================== */}

        <div className="relative mt-20 grid gap-5 md:grid-cols-2">

          {/* ===============================================
              ORGANIZA — TARJETA GRANDE
          ================================================ */}

          <article className="group relative min-h-[390px] overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4A1115]/8 md:row-span-2">

            {/* número */}

            <span className="absolute right-8 top-7 text-xs font-semibold tracking-[0.15em] text-[#4A1115]/30">
              {features[0].number}
            </span>


            {/* decoración circular */}

            <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full border-[32px] border-[#E8AFC0]/20 transition-transform duration-700 group-hover:scale-110" />

            <div className="pointer-events-none absolute bottom-8 right-8 h-3 w-3 rounded-full bg-[#4A1115]/30" />


            <div className="relative flex h-full flex-col">

              {/* icono */}

              <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[#E8AFC0]/30 text-[#4A1115] transition-transform duration-500 group-hover:rotate-[-5deg] group-hover:scale-105">

                <BookOpen className="h-6 w-6" />

              </div>


              <div className="mt-auto max-w-md">

                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]/50">
                  La estructura primero
                </p>

                <h3 className="text-3xl font-semibold tracking-tight text-[#211719]">
                  Organiza.
                </h3>

                <p className="mt-4 leading-7 text-[#687584]">
                  Estructura el conocimiento de tu universidad desde la
                  materia hasta cada contenido.
                </p>

              </div>

            </div>


            {/* flecha */}

            <div className="absolute bottom-8 right-8 flex h-10 w-10 items-center justify-center rounded-full border border-[#4A1115]/10 bg-[#FFFDF8] text-[#4A1115] transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">

              <ArrowUpRight className="h-4 w-4" />

            </div>

          </article>


          {/* ===============================================
              CREA
          ================================================ */}

          <article className="group relative min-h-[185px] overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#E8AFC0]/25 p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#4A1115]/5">

            <span className="absolute right-7 top-6 text-xs font-semibold tracking-[0.15em] text-[#4A1115]/30">
              {features[1].number}
            </span>


            <div className="relative flex items-start gap-5">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFFDF8] text-[#4A1115] shadow-sm transition-transform duration-300 group-hover:rotate-6">

                <Sparkles className="h-5 w-5" />

              </div>


              <div className="pr-8">

                <h3 className="text-2xl font-semibold tracking-tight text-[#211719]">
                  Crea.
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#687584]">
                  Construye hipertextos educativos interactivos y adapta el
                  contenido a tu forma de enseñar.
                </p>

              </div>

            </div>


            {/* pequeños nodos */}

            <div className="absolute bottom-6 right-7 flex items-center gap-2">

              <div className="h-2 w-2 rounded-full bg-[#4A1115]/30" />

              <div className="h-px w-8 bg-[#4A1115]/15" />

              <div className="h-2.5 w-2.5 rounded-full border border-[#4A1115]/30" />

            </div>

          </article>


          {/* ===============================================
              CONECTA
          ================================================ */}

          <article className="group relative min-h-[185px] overflow-hidden rounded-[2rem] border border-[#8B9AAA]/20 bg-[#8B9AAA]/15 p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#8B9AAA]/10">

            <span className="absolute right-7 top-6 text-xs font-semibold tracking-[0.15em] text-[#4A1115]/30">
              {features[2].number}
            </span>


            <div className="relative flex items-start gap-5">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFFDF8] text-[#4A1115] shadow-sm transition-transform duration-300 group-hover:rotate-[-6deg]">

                <Link2 className="h-5 w-5" />

              </div>


              <div className="pr-8">

                <h3 className="text-2xl font-semibold tracking-tight text-[#211719]">
                  Conecta.
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#687584]">
                  Integra temas, recursos y contenidos en una experiencia de
                  aprendizaje coherente.
                </p>

              </div>

            </div>


            {/* mini conexión */}

            <div className="absolute bottom-6 right-7 flex items-center gap-2">

              <div className="h-2.5 w-2.5 rounded-full border border-[#4A1115]/30" />

              <ArrowRight className="h-3.5 w-3.5 text-[#4A1115]/40" />

              <div className="h-2 w-2 rounded-full bg-[#E8AFC0]" />

            </div>

          </article>

        </div>


        {/* =================================================
            MAPA ACADÉMICO
        ================================================== */}

        <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8]/80 px-6 py-7 shadow-sm backdrop-blur-sm">

          {/* decoración */}

          <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border-[18px] border-[#E8AFC0]/20" />


          <div className="relative">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]/50">
                  El conocimiento se conecta
                </p>

                <p className="mt-1 text-sm text-[#687584]">
                  De la estructura académica al hipertexto.
                </p>

              </div>

              <Sparkles className="hidden h-5 w-5 text-[#4A1115]/30 sm:block" />

            </div>


            {/* Camino */}

            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7] px-4 py-2 text-sm font-medium text-[#4A1115]">
                Universidad
              </span>

              <ArrowRight className="h-4 w-4 text-[#4A1115]/30" />


              <span className="rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7] px-4 py-2 text-sm font-medium text-[#4A1115]">
                Facultad
              </span>

              <ArrowRight className="h-4 w-4 text-[#4A1115]/30" />


              <span className="rounded-xl border border-[#4A1115]/10 bg-[#F7F1E7] px-4 py-2 text-sm font-medium text-[#4A1115]">
                Carrera
              </span>

              <ArrowRight className="h-4 w-4 text-[#4A1115]/30" />


              <span className="rounded-xl border border-[#E8AFC0]/50 bg-[#E8AFC0]/30 px-4 py-2 text-sm font-semibold text-[#4A1115]">
                Materia
              </span>

              <ArrowRight className="h-4 w-4 text-[#4A1115]/40" />


              <span className="rounded-xl border border-[#4A1115]/15 bg-[#4A1115] px-4 py-2 text-sm font-semibold text-[#FFFDF8] shadow-sm">
                Hipertexto
              </span>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}