"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Link2,
  Sparkles,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { post } from "@/lib/api";

import {
  registerSchema,
  type RegisterSchema,
} from "@/schemas/auth.schema";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FormularioRegistro() {
  const router = useRouter();

  const [modal, setModal] = useState<
    "success" | "error" | "duplicate" | null
  >(null);

  const {
    register,
    handleSubmit,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterSchema) {
    try {
      const response = await post(
        "/auth/register",
        data,
      );

      localStorage.setItem(
        "auth",
        JSON.stringify(response),
      );

      setModal("success");
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message
            .toLowerCase()
            .includes("ya existe")
        ) {
          setModal("duplicate");
        } else {
          setModal("error");
        }
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
          GRID INFERIOR
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
          DECORACIÓN — NODOS
      ====================================================== */}

      <div className="pointer-events-none absolute left-[8%] top-[22%] hidden lg:block">

        <div className="relative h-40 w-40">

          <div className="absolute left-0 top-8 h-px w-28 rotate-[25deg] bg-[#4A1115]/15" />

          <div className="absolute left-24 top-16 h-3 w-3 rounded-full border-2 border-[#4A1115]/25 bg-[#F7F1E7]" />

          <div className="absolute left-28 top-20 h-20 w-px rotate-[30deg] bg-[#4A1115]/10" />

          <div className="absolute left-14 top-0 h-2 w-2 rounded-full bg-[#E8AFC0]" />

        </div>

      </div>


      <div className="pointer-events-none absolute right-[8%] bottom-[20%] hidden lg:block">

        <div className="relative h-40 w-40">

          <div className="absolute right-0 top-10 h-px w-28 -rotate-[25deg] bg-[#4A1115]/15" />

          <div className="absolute right-24 top-16 h-3 w-3 rounded-full border-2 border-[#8B9AAA]/40 bg-[#F7F1E7]" />

          <div className="absolute right-28 top-20 h-16 w-px rotate-[-25deg] bg-[#4A1115]/10" />

          <div className="absolute right-12 top-2 h-2 w-2 rounded-full bg-[#E8AFC0]" />

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

                Empieza a construir

                <br />

                <span className="relative inline-block text-[#4A1115]">

                  tu hipertexto.

                  <span className="absolute bottom-0 left-0 h-2 w-[75%] -rotate-[2deg] rounded-full bg-[#E8AFC0]/70" />

                </span>

              </h1>


              <p className="mt-6 max-w-md text-base leading-8 text-[#687584]">
                Crea un espacio donde el conocimiento de tu materia pueda
                organizarse, conectarse y compartirse con tus estudiantes.
              </p>


              {/* Mini mapa */}

              <div className="mt-10 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115]">
                  <BookOpen className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium text-[#687584]">
                  Materia
                </span>

                <ArrowRight className="h-3.5 w-3.5 text-[#4A1115]/35" />

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFDF8] text-[#4A1115] shadow-sm">
                  <Link2 className="h-4 w-4" />
                </div>

                <span className="text-xs font-medium text-[#687584]">
                  Hipertexto
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
                  Crear cuenta
                </span>

                <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#211719]">
                  Bienvenido a Aura Atlas.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#687584]">
                  Crea tu cuenta para comenzar a construir tu espacio
                  educativo.
                </p>

              </div>


              {/* Formulario */}

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-8 space-y-5"
              >

                <div className="space-y-2">

                  <Label
                    htmlFor="name"
                    className="text-[#211719]"
                  >
                    Nombre
                  </Label>

                  <Input
                    id="name"
                    placeholder="Tu nombre"
                    className="h-12 rounded-xl border-[#4A1115]/10 bg-[#F7F1E7] px-4 text-[#211719] placeholder:text-[#687584]/60 focus-visible:border-[#4A1115]/30 focus-visible:ring-[#4A1115]/20"
                    {...register("name")}
                  />

                </div>


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
                  Crear cuenta

                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

              </form>


              {/* Login */}

              <div className="mt-7 border-t border-[#4A1115]/10 pt-6 text-center text-sm text-[#687584]">

                ¿Ya tienes una cuenta?{" "}

                <Link
                  href="/login"
                  className="font-semibold text-[#4A1115] transition-colors hover:text-[#7A252B]"
                >
                  Iniciar sesión
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


      {/* =====================================================
          MODALES
      ====================================================== */}

      <Dialog
        open={modal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setModal(null);
          }
        }}
      >

        <DialogContent className="max-w-md rounded-[2rem] border-[#4A1115]/10 bg-[#FFFDF8]">

          {modal === "success" && (
            <>
              <DialogHeader className="items-center text-center">

                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <DialogTitle className="text-2xl text-[#211719]">
                  ¡Bienvenido a Aura Atlas!
                </DialogTitle>

                <DialogDescription className="pt-2 text-base leading-7 text-[#687584]">
                  Tu cuenta fue creada correctamente. Ahora vamos a
                  configurar tu espacio educativo.
                </DialogDescription>

              </DialogHeader>

              <DialogFooter className="mt-4">

                <Button
                  className="w-full rounded-xl bg-[#4A1115] text-[#FFFDF8] hover:bg-[#5D171D]"
                  onClick={() => router.push("/welcome")}
                >
                  Comenzar configuración
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

              </DialogFooter>
            </>
          )}


          {modal === "duplicate" && (
            <>
              <DialogHeader className="items-center text-center">

                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E8AFC0]/30 text-[#4A1115]">
                  <AlertCircle className="h-7 w-7" />
                </div>

                <DialogTitle className="text-2xl text-[#211719]">
                  Este correo ya está registrado
                </DialogTitle>

                <DialogDescription className="pt-2 text-base leading-7 text-[#687584]">
                  Ya existe una cuenta asociada a este correo electrónico.
                  Puedes iniciar sesión para continuar.
                </DialogDescription>

              </DialogHeader>

              <DialogFooter className="mt-4">

                <Button
                  className="w-full rounded-xl bg-[#4A1115] text-[#FFFDF8] hover:bg-[#5D171D]"
                  onClick={() => router.push("/login")}
                >
                  Iniciar sesión
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

              </DialogFooter>
            </>
          )}


          {modal === "error" && (
            <>
              <DialogHeader className="items-center text-center">

                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4A1115]/10 text-[#4A1115]">
                  <AlertCircle className="h-7 w-7" />
                </div>

                <DialogTitle className="text-2xl text-[#211719]">
                  No pudimos crear tu cuenta
                </DialogTitle>

                <DialogDescription className="pt-2 text-base leading-7 text-[#687584]">
                  Ocurrió un problema al intentar crear tu cuenta.
                  Inténtalo nuevamente.
                </DialogDescription>

              </DialogHeader>

              <DialogFooter className="mt-4">

                <Button
                  variant="outline"
                  className="w-full rounded-xl border-[#4A1115]/15 rounded-xl"
                  onClick={() => setModal(null)}
                >
                  Intentar nuevamente
                </Button>

              </DialogFooter>
            </>
          )}

        </DialogContent>

      </Dialog>

    </main>
  );
}