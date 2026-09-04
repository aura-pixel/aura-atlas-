"use client";

import { FlaskConical } from "lucide-react";

export function BetaBanner() {
  return (
    <div className="sticky top-0 z-50 border-b border-[#4A1115]/10 bg-[#4A1115] text-[#FFFDF8]">
      <div className="mx-auto flex max-w-7xl items-start gap-3 px-6 py-3 lg:px-10">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E8AFC0]/20">
          <FlaskConical className="h-3.5 w-3.5 text-[#E8AFC0]" />
        </div>

        <div className="min-w-0 text-xs leading-5">
          <p className="font-semibold">
            Estás utilizando una versión Beta de Aura Atlas.
          </p>

          <p className="text-[#FFFDF8]/75">
            Durante este mes, puedes crear y probar tus hipertextos de forma
            gratuita. Tu retroalimentación nos ayudará a mejorar la plataforma
            antes de su lanzamiento oficial.
          </p>

          <p className="mt-1 text-[#FFFDF8]/60">
            Al finalizar el periodo de prueba, podrás continuar utilizando Aura
            Atlas por <span className="font-semibold text-[#FFFDF8]/85">$120 MXN al mes</span>{" "}
            o <span className="font-semibold text-[#FFFDF8]/85">$1,440 MXN al año</span>.
          </p>
        </div>
      </div>
    </div>
  );
}