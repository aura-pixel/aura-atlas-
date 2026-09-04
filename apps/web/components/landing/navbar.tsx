"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-5 pt-5">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-[1.35rem] border border-white/10 bg-[#4A1115] px-5 py-3 shadow-xl shadow-[#4A1115]/15">

        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#FFFDF8] shadow-sm transition-transform duration-300 group-hover:-rotate-2 group-hover:scale-105">
            <img
              src="/aura-atlas.png"
              alt="Aura Atlas"
              className="h-8 w-8 object-contain"
            />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#FFFDF8]">
              Aura Atlas
            </span>

            <span className="mt-1 text-[10px] font-medium tracking-wide text-[#E8AFC0]">
              by Tzalli Studio
            </span>
          </div>
        </Link>


        {/* Navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#que-es"
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#F7F1E7]/75 transition-all duration-200 hover:bg-white/10 hover:text-[#FFFDF8]"
          >
            ¿Qué es?
          </a>

          <a
            href="#como-funciona"
            className="rounded-xl px-4 py-2 text-[13px] font-medium text-[#F7F1E7]/75 transition-all duration-200 hover:bg-white/10 hover:text-[#FFFDF8]"
          >
            Cómo funciona
          </a>
        </nav>


        {/* Actions */}
        <div className="flex items-center gap-2">

          <Link
            href="/login"
            className="hidden rounded-xl px-4 py-2 text-[13px] font-medium text-[#F7F1E7]/75 transition-colors hover:text-[#FFFDF8] sm:block"
          >
            Iniciar sesión
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-[#FFFDF8] px-5 py-2.5 text-[13px] font-semibold text-[#4A1115] shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#E8AFC0] hover:shadow-md"
          >
            Comenzar
          </Link>

        </div>

      </div>
    </header>
  );
}