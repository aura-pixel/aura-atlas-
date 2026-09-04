import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Mail,
  Sparkles,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#4A1115] text-[#FFFDF8]">

      {/* =====================================================
          DECORACIÓN
      ====================================================== */}

      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border-[40px] border-[#E8AFC0]/10" />

      <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-[#E8AFC0]/10 blur-[100px]" />

      <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#8B9AAA]/10 blur-[100px]" />


      {/* =====================================================
          CONTENIDO
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-24">

        {/* =================================================
            BLOQUE PRINCIPAL
        ================================================== */}

        <div className="grid gap-16 md:grid-cols-[1.3fr_0.7fr] md:items-end">

          {/* Aura Atlas */}

          <div>

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-white/15 bg-[#FFFDF8] shadow-xl">

                <img
                  src="/aura-atlas.png"
                  alt="Aura Atlas"
                  className="h-12 w-12"
                />

              </div>


              <div>

                <Link
                  href="/"
                  className="block text-xl font-semibold tracking-tight transition-opacity hover:opacity-80"
                >
                  Aura Atlas
                </Link>

                <span className="text-xs text-[#E8AFC0]">
                  by Tzalli Studio
                </span>

              </div>

            </div>


            <h2 className="mt-10 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-5xl">

              El conocimiento
              <br />

              <span className="text-[#E8AFC0]">
                también puede conectar.
              </span>

            </h2>


            <p className="mt-6 max-w-xl text-base leading-8 text-[#FFFDF8]/65">
              Un espacio para crear, organizar y compartir el conocimiento
              de tu universidad de una forma más clara, conectada y
              significativa.
            </p>


            <Link
              href="/register"
              className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#FFFDF8] px-5 py-3.5 text-sm font-semibold text-[#4A1115] shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              Comenzar con Aura Atlas

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

          </div>


          {/* =================================================
              FIRMA TZALLI
          ================================================== */}

          <div className="md:border-l md:border-white/10 md:pl-12">

            <div className="flex items-center gap-2 text-[#E8AFC0]">

              <Sparkles className="h-4 w-4" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                Creado por
              </span>

            </div>


            <a
              href="https://tzalli-studio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-5 inline-flex items-center gap-3"
            >

              <span className="text-2xl font-semibold tracking-tight transition-colors group-hover:text-[#E8AFC0]">
                Tzalli Studio
              </span>

              <ArrowUpRight className="h-5 w-5 text-[#FFFDF8]/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#E8AFC0]" />

            </a>


            <p className="mt-4 max-w-sm text-sm leading-7 text-[#FFFDF8]/55">
              Diseño y desarrollo de experiencias digitales que convierten
              ideas en productos.
            </p>


            <a
              href="mailto:hola@tzalli-studio.com"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#FFFDF8]/75 transition-colors hover:text-[#E8AFC0]"
            >

              <Mail className="h-4 w-4" />

              devstudioaura@gmail.com

            </a>

          </div>

        </div>


        {/* =================================================
            DIVISOR
        ================================================== */}

        <div className="my-16 h-px bg-white/10" />


        {/* =================================================
            BOTTOM
        ================================================== */}

        <div className="flex flex-col gap-5 text-xs text-[#FFFDF8]/45 md:flex-row md:items-center md:justify-between">

          <p>
            © {new Date().getFullYear()} Aura Atlas. Todos los derechos
            reservados.
          </p>


          <div className="flex items-center gap-2">

            <span>
              Una creación de
            </span>

            <a
              href="https://tzalli-studio.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#FFFDF8]/70 transition-colors hover:text-[#E8AFC0]"
            >
              Tzalli Studio
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}