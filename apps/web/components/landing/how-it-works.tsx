import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  Share2,
  Sparkles,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Elige tu materia",
    description:
      "Encuentra la materia dentro de la estructura académica de tu universidad y entra a su espacio de trabajo.",
  },
  {
    number: "02",
    icon: LayoutDashboard,
    title: "Construye tu hipertexto",
    description:
      "Crea un espacio propio donde puedas reunir y organizar el conocimiento de tu materia.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Dale forma al contenido",
    description:
      "Organiza unidades, temas, recursos y materiales para construir una experiencia clara.",
  },
  {
    number: "04",
    icon: Share2,
    title: "Compártelo",
    description:
      "Publica tu hipertexto y comparte un solo enlace con tus estudiantes.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-[#8B9AAA]/10 px-6 py-32"
    >
      {/* =====================================================
          DECORACIÓN
      ====================================================== */}

      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-[#E8AFC0]/25 blur-[100px]" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-[#8B9AAA]/20 blur-[110px]" />

      {/* puntos decorativos */}

      <div className="pointer-events-none absolute left-[8%] top-[18%] hidden lg:block">
        <div className="h-3 w-3 rounded-full bg-[#4A1115]/20" />
      </div>

      <div className="pointer-events-none absolute right-[10%] top-[30%] hidden lg:block">
        <div className="h-2 w-2 rounded-full bg-[#E8AFC0]" />
      </div>

      <div className="pointer-events-none absolute bottom-[18%] left-[14%] hidden lg:block">
        <div className="h-2.5 w-2.5 rounded-full border-2 border-[#4A1115]/20" />
      </div>


      {/* =====================================================
          CONTENIDO
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Encabezado */}

        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

          <div className="max-w-3xl">

            <div className="flex items-center gap-3">

              <span className="h-px w-10 bg-[#4A1115]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
                Cómo funciona
              </span>

            </div>


            <h2 className="mt-6 text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[#211719] md:text-6xl">

              Del conocimiento

              <br />

              <span className="relative inline-block text-[#4A1115]">

                a la experiencia.

                <span className="absolute -bottom-1 left-0 h-2 w-[70%] -rotate-[1deg] rounded-full bg-[#E8AFC0]/70" />

              </span>

            </h2>

          </div>


          <p className="max-w-md text-base leading-8 text-[#687584] md:pb-2 md:text-lg">
            Convierte el contenido de una materia en un espacio digital
            pensado para enseñar, organizar y compartir.
          </p>

        </div>


        {/* =====================================================
            RECORRIDO
        ====================================================== */}

        <div className="relative mt-24">

          {/* Línea central desktop */}

          <div className="absolute left-[7%] right-[7%] top-10 hidden h-px bg-[#4A1115]/15 md:block" />

          {/* línea decorativa secundaria */}

          <div className="absolute left-[12%] right-[12%] top-[43px] hidden h-px bg-gradient-to-r from-transparent via-[#E8AFC0]/60 to-transparent md:block" />


          <div className="grid gap-12 md:grid-cols-4 md:gap-5">

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="group relative"
                >

                  {/* =========================================
                      NODO
                  ========================================== */}

                  <div className="relative z-10 flex items-center">

                    <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] text-[#4A1115] shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:rotate-[-4deg] group-hover:shadow-xl group-hover:shadow-[#4A1115]/10">

                      <Icon className="h-7 w-7" />

                      {/* pequeño punto */}

                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#E8AFC0] transition-transform duration-300 group-hover:scale-125" />

                    </div>


                    {/* flecha */}

                    {index !== steps.length - 1 && (
                      <ArrowRight className="absolute left-[82px] hidden h-5 w-5 text-[#4A1115]/25 md:block" />
                    )}

                  </div>


                  {/* =========================================
                      TEXTO
                  ========================================== */}

                  <div className="mt-7">

                    <div className="flex items-center gap-3">

                      <span className="text-[10px] font-bold tracking-[0.18em] text-[#4A1115]/45">
                        PASO
                      </span>

                      <span className="text-xs font-semibold text-[#4A1115]">
                        {step.number}
                      </span>

                    </div>


                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#211719]">
                      {step.title}
                    </h3>


                    <p className="mt-3 text-sm leading-7 text-[#687584]">
                      {step.description}
                    </p>

                  </div>


                  {/* indicador móvil */}

                  {index !== steps.length - 1 && (
                    <ArrowDown className="absolute -bottom-8 left-8 h-5 w-5 text-[#4A1115]/25 md:hidden" />
                  )}

                </article>
              );
            })}

          </div>

        </div>


        {/* =====================================================
            CIERRE
        ====================================================== */}

        <div className="relative mt-24 overflow-hidden rounded-[2.5rem] border border-[#4A1115]/10 bg-[#4A1115] px-8 py-12 text-center shadow-xl shadow-[#4A1115]/10 md:px-16">

          {/* decoración */}

          <div className="pointer-events-none absolute -left-12 -top-16 h-40 w-40 rounded-full border-[20px] border-[#E8AFC0]/15" />

          <div className="pointer-events-none absolute -bottom-20 -right-10 h-48 w-48 rounded-full border-[28px] border-[#8B9AAA]/10" />

          <div className="relative z-10">

            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E8AFC0]/20 text-[#FFFDF8]">

              <Sparkles className="h-5 w-5" />

            </div>


            <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E8AFC0]">
              Una nueva forma de compartir
            </p>


            <p className="mx-auto mt-4 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-[#FFFDF8] md:text-3xl">

              Tu conocimiento merece un espacio donde pueda conectarse.

            </p>


            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#FFFDF8]/65">
              De la estructura académica al contenido que tus estudiantes
              pueden explorar.
            </p>

          </div>

        </div>

      </div>

    </section>
  );
}