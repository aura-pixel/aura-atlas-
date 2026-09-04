"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Link2,
  Sparkles,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { get, post } from "@/lib/api";

import {
  loginSchema,
  type LoginSchema,
} from "@/schemas/auth.schema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export function FormularioLogin() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginSchema) {
    try {
      const response: LoginResponse = await post(
        "/auth/login",
        data,
      );

      localStorage.setItem(
        "auth",
        JSON.stringify(response),
      );

      // Super Admin → dashboard administrativo
      if (response.user.role === "SUPER_ADMIN") {
        router.push("/dashboard");
        return;
      }

      // Docente → comprobar si ya configuró
      // su espacio académico
      const profile = await get<{
        careers: unknown[];
      }>("/users/me");

      // Ya tiene una carrera configurada
      if (profile.careers.length > 0) {
        router.push("/teacher/dashboard");
        return;
      }

      // Es su primer acceso
      router.push("/welcome");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F1E7] px-6 py-8">

      {/* =====================================================
          FONDO
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#E8AFC0]/25 blur-[100px]" />

      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-[#8B9AAA]/20 blur-[110px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E8AFC0]/10 blur-[100px]" />


      {/* =====================================================
          GRID
      ====================================================== */}

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 opacity-40 [mask-image:linear-gradient(to_bottom,transparent,black)]">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(74,17,21,0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(74,17,21,0.08) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>


      {/* =====================================================
          NODOS DECORATIVOS
      ====================================================== */}

      <div className="pointer-events-none absolute left-[8%] top-[25%] hidden lg:block">
        <div className="relative h-40 w-40">

          <div className="absolute left-0 top-8 h-px w-28 rotate-[25deg] bg-[#4A1115]/15" />

          <div className="absolute left-24 top-16 h-3 w-3 rounded-full border-2 border-[#4A1115]/25 bg-[#F7F1E7]" />

          <div className="absolute left-14 top-0 h-2 w-2 rounded-full bg-[#E8AFC0]" />

          <div className="absolute left-28 top-20 h-16 w-px rotate-[30deg] bg-[#4A1115]/10" />

        </div>
      </div>


      <div className="pointer-events-none absolute right-[8%] bottom-[22%] hidden lg:block">
        <div className="relative h-40 w-40">

          <div className="absolute right-0 top-10 h-px w-28 -rotate-[25deg] bg-[#4A1115]/15" />

          <div className="absolute right-24 top-16 h-3 w-3 rounded-full border-2 border-[#8B9AAA]/40 bg-[#F7F1E7]" />

          <div className="absolute right-12 top-2 h-2 w-2 rounded-full bg-[#E8AFC0]" />

          <div className="absolute right-28 top-20 h-16 w-px rotate-[-25deg] bg-[#4A1115]/10" />

        </div>
      </div>


      {/* =====================================================
          REGRESAR
      ====================================================== */}

      <Link
        href="/"
        className="absolute left-6 top-6 z-30 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#687584] transition-all hover:bg-[#FFFDF8] hover:text-[#4A1115]"
      >
        <ArrowLeft className="h-4 w-4" />
        Aura Atlas
      </Link>


      {/* =====================================================
          CONTENIDO
      ====================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">

        <div className="grid w-full items-center gap-16 lg:grid-cols-[1fr_0.9fr]">


          {/* =================================================
              PRESENTACIÓN
          ================================================== */}

          <div className="hidden lg:block">

            <div className="max-w-md">

              {/* Logo */}

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-[#4A1115]/10 bg-[#FFFDF8] shadow-xl shadow-[#4A1115]/10">

                  <img
                    src="/aura-atlas.png"
                    alt="Aura Atlas"
                    className="h-11 w-11 object-contain"
                  />

                </div>

                <div>

                  <p className="text-lg font-semibold tracking-tight text-[#4A1115]">
                    Aura Atlas
                  </p>

                  <p className="text-xs text-[#687584]">
                    by Tzalli Studio
                  </p>

                </div>

              </div>


              {/* Badge */}

              <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#4A1115]/10 bg-[#FFFDF8]/80 px-4 py-2 shadow-sm">

                <Sparkles className="h-3.5 w-3.5 text-[#4A1115]" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]">
                  Tu espacio educativo
                </span>

              </div>


              {/* Heading */}

              <h1 className="mt-6 text-5xl font-bold leading-[1.02] tracking-[-0.045em] text-[#211719]">

                El conocimiento de tu

                <br />

                <span className="relative inline-block text-[#4A1115]">

                  universidad, conectado.

                  <span className="absolute bottom-0 left-0 h-2 w-[72%] -rotate-[2deg] rounded-full bg-[#E8AFC0]/70" />

                </span>

              </h1>


              <p className="mt-6 max-w-md text-base leading-8 text-[#687584]">
                Accede a tu espacio en Aura Atlas y continúa construyendo
                experiencias de aprendizaje para tus estudiantes.
              </p>


              {/* Mini mapa */}

              <div className="mt-10 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115]">
                  <BookOpen className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium text-[#687584]">
                  Organizar
                </span>

                <ArrowRight className="h-3.5 w-3.5 text-[#4A1115]/35" />

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFDF8] text-[#4A1115] shadow-sm">
                  <Link2 className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium text-[#687584]">
                  Conectar
                </span>

                <ArrowRight className="h-3.5 w-3.5 text-[#4A1115]/35" />

                <span className="text-xs font-semibold text-[#4A1115]">
                  Compartir
                </span>

              </div>


              {/* Detalle adicional */}

              <div className="mt-8 flex items-center gap-2 text-xs text-[#687584]/70">

                <Check className="h-3.5 w-3.5 text-[#4A1115]" />

                <span>
                  Un espacio creado para docentes
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              FORMULARIO
          ================================================== */}

          <div className="mx-auto w-full max-w-md">

            <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-8 shadow-2xl shadow-[#4A1115]/10 sm:p-10">


              {/* Logo móvil */}

              <div className="mb-8 flex flex-col items-center lg:hidden">

                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-[#4A1115]/10 bg-[#F7F1E7] shadow-lg">

                  <img
                    src="/aura-atlas.png"
                    alt="Aura Atlas"
                    className="h-11 w-11"
                  />

                </div>

                <p className="mt-3 text-xs text-[#687584]">
                  Aura Atlas · by Tzalli Studio
                </p>

              </div>


              {/* Encabezado */}

              <div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
                  Tu espacio
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#211719]">
                  Bienvenido de nuevo.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#687584]">
                  Inicia sesión para continuar construyendo tus experiencias
                  educativas.
                </p>

              </div>


              {/* Formulario */}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
              >

                <div className="space-y-2">

                  <Label
                    htmlFor="email"
                    className="text-[#211719]"
                  >
                    Correo electrónico
                  </Label>

                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    className="h-12 rounded-xl border-[#4A1115]/10 bg-[#F7F1E7] px-4 text-[#211719] placeholder:text-[#687584]/60 focus-visible:border-[#4A1115]/30 focus-visible:ring-[#4A1115]/20"
                    {...register("email")}
                  />

                </div>


                <div className="space-y-2">

                  <Label
                    htmlFor="password"
                    className="text-[#211719]"
                  >
                    Contraseña
                  </Label>

                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 rounded-xl border-[#4A1115]/10 bg-[#F7F1E7] px-4 text-[#211719] placeholder:text-[#687584]/60 focus-visible:border-[#4A1115]/30 focus-visible:ring-[#4A1115]/20"
                    {...register("password")}
                  />

                </div>


                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-[#4A1115] text-sm font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#5D171D] hover:shadow-xl"
                >
                  Iniciar sesión

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

              </form>


              {/* Registro */}

              <div className="mt-7 border-t border-[#4A1115]/10 pt-6 text-center text-sm text-[#687584]">

                ¿Aún no tienes una cuenta?{" "}

                <Link
                  href="/register"
                  className="font-semibold text-[#4A1115] transition-colors hover:text-[#7A252B]"
                >
                  Crear cuenta
                </Link>

              </div>

            </div>


            {/* Firma */}

            <p className="mt-5 text-center text-[11px] text-[#687584]/70">
              Aura Atlas · by Tzalli Studio
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}