"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ImagePlus,
  Sparkles,
} from "lucide-react";

import { get, postForm } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type UserCareer = {
  career: {
    id: string;
    name: string;
    faculty: {
      name: string;
      university: {
        name: string;
      };
    };
  };
};

type User = {
  careers: UserCareer[];
};

const subjectColors = [
  {
    name: "Vino",
    value: "#4A1115",
  },
  {
    name: "Rosa",
    value: "#C9829B",
  },
  {
    name: "Durazno",
    value: "#E6A47A",
  },
  {
    name: "Lavanda",
    value: "#9B8CC4",
  },
  {
    name: "Azul",
    value: "#718DA8",
  },
  {
    name: "Verde",
    value: "#7E9C83",
  },
  {
    name: "Mostaza",
    value: "#C5A35A",
  },
  {
    name: "Azul gris",
    value: "#8B9AAA",
  },
];

export function CreateSubjectForm() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [name, setName] =
    useState("");

  const [abbreviation, setAbbreviation] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [color, setColor] =
    useState("#4A1115");

  const [logo, setLogo] =
    useState<File | null>(null);

  const [logoPreview, setLogoPreview] =
    useState<string | null>(null);


  /* =====================================================
     CARGAR USUARIO
  ====================================================== */

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await get<User>(
          "/users/me",
        );

        setUser(data);
      } catch (error) {
        console.error(
          "Error al cargar el usuario:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);


  /* =====================================================
     PREVIEW DE IMAGEN
  ====================================================== */

  useEffect(() => {
    if (!logo) {
      setLogoPreview(null);
      return;
    }

    const objectUrl =
      URL.createObjectURL(logo);

    setLogoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logo]);


  /* =====================================================
     CREAR MATERIA
  ====================================================== */

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const career =
      user?.careers?.[0]?.career;

    if (!career) {
      alert(
        "No tienes una carrera configurada.",
      );
      return;
    }

    if (!name.trim()) {
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append(
        "name",
        name.trim(),
      );

      if (abbreviation.trim()) {
        formData.append(
          "abbreviation",
          abbreviation.trim(),
        );
      }

      if (description.trim()) {
        formData.append(
          "description",
          description.trim(),
        );
      }

      formData.append(
        "color",
        color,
      );

      formData.append(
        "careerId",
        career.id,
      );

      if (logo) {
        formData.append(
          "logo",
          logo,
        );
      }

      await postForm(
        "/subjects",
        formData,
      );

      router.push(
        "/teacher/dashboard",
      );
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      }
    } finally {
      setSaving(false);
    }
  }


  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F1E7]">

        <div className="text-center">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8AFC0]/40 text-[#4A1115]">
            <BookOpen className="h-5 w-5" />
          </div>

          <p className="mt-4 text-sm text-[#687584]">
            Preparando tu espacio...
          </p>

        </div>

      </main>
    );
  }


  const career =
    user?.careers?.[0]?.career;

  const faculty =
    career?.faculty;

  const university =
    faculty?.university;


  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F7F1E7] text-[#211719]">

      {/* =====================================================
          FONDO
      ====================================================== */}

      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-[#E8AFC0]/25 blur-[100px]" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#8B9AAA]/20 blur-[110px]" />

      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#E8AFC0]/10 blur-[100px]" />


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
          CONTENIDO
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 lg:px-10">

        {/* Regresar */}

        <button
          type="button"
          onClick={() =>
            router.push(
              "/teacher/dashboard",
            )
          }
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#687584] transition-all hover:bg-[#FFFDF8] hover:text-[#4A1115]"
        >

          <ArrowLeft className="h-4 w-4" />

          Volver a mis materias

        </button>


        {/* =================================================
            LAYOUT
        ================================================== */}

        <div className="mt-10 grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">


          {/* =================================================
              PRESENTACIÓN
          ================================================== */}

          <div className="lg:sticky lg:top-10">

            {/* Marca */}

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4A1115] shadow-lg shadow-[#4A1115]/15">

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

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-[#4A1115]/10 bg-[#FFFDF8]/80 px-4 py-2 shadow-sm">

              <Sparkles className="h-3.5 w-3.5 text-[#4A1115]" />

              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
                Nueva materia
              </span>

            </div>


            {/* Heading */}

            <h1 className="mt-6 max-w-lg text-4xl font-bold leading-[1.05] tracking-[-0.045em] sm:text-5xl">

              Crea un nuevo espacio

              <span className="relative mt-1 block w-fit text-[#4A1115]">

                para enseñar.

                <span className="absolute bottom-0 left-0 h-2 w-[70%] -rotate-[2deg] rounded-full bg-[#E8AFC0]/70" />

              </span>

            </h1>


            <p className="mt-6 max-w-md text-base leading-8 text-[#687584]">
              Define la materia donde comenzarás a organizar, conectar y
              compartir conocimiento con tus estudiantes.
            </p>


            {/* Contexto */}

            <div className="mt-10 rounded-[1.75rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-6 shadow-sm">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115]">

                  <BookOpen className="h-5 w-5" />

                </div>


                <div className="min-w-0">

                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]">
                    Contexto académico
                  </p>

                  <h2 className="mt-2 font-semibold leading-6">
                    {career?.name ??
                      "Tu carrera"}
                  </h2>

                  <p className="mt-1 text-sm text-[#687584]">
                    {faculty?.name}
                  </p>

                  <p className="mt-1 text-sm text-[#687584]">
                    {university?.name}
                  </p>

                </div>

              </div>


              <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#F7F1E7] px-4 py-3 text-xs text-[#687584]">

                <Check className="h-4 w-4 shrink-0 text-[#4A1115]" />

                Esta materia se asociará a tu carrera.

              </div>

            </div>

          </div>


          {/* =================================================
              FORMULARIO
          ================================================== */}

          <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-7 shadow-2xl shadow-[#4A1115]/10 sm:p-9">

            {/* Encabezado */}

            <div className="mb-9">

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#4A1115]">
                Información
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
                Cuéntanos sobre tu materia
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#687584]">
                Puedes modificar estos datos posteriormente.
              </p>

            </div>


            <form
              onSubmit={handleSubmit}
              className="space-y-7"
            >


              {/* =================================================
                  NOMBRE
              ================================================== */}

              <div className="space-y-2">

                <Label
                  htmlFor="name"
                  className="text-[#211719]"
                >
                  Nombre de la materia
                </Label>

                <Input
                  id="name"
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value,
                    )
                  }
                  placeholder="Ej. Salud Mental"
                  className="h-12 rounded-xl border-[#4A1115]/10 bg-[#F7F1E7] px-4 placeholder:text-[#687584]/50 focus-visible:border-[#4A1115]/30 focus-visible:ring-[#4A1115]/20"
                  required
                />

              </div>


              {/* =================================================
                  ABREVIACIÓN
              ================================================== */}

              <div className="space-y-2">

                <Label
                  htmlFor="abbreviation"
                  className="text-[#211719]"
                >
                  Abreviación
                </Label>

                <Input
                  id="abbreviation"
                  value={abbreviation}
                  onChange={(event) =>
                    setAbbreviation(
                      event.target.value,
                    )
                  }
                  placeholder="Ej. SLM"
                  maxLength={20}
                  className="h-12 rounded-xl border-[#4A1115]/10 bg-[#F7F1E7] px-4 placeholder:text-[#687584]/50 focus-visible:border-[#4A1115]/30 focus-visible:ring-[#4A1115]/20"
                />

                <p className="text-xs leading-5 text-[#687584]">
                  Un identificador corto para reconocer rápidamente la materia.
                </p>

              </div>


              {/* =================================================
                  DESCRIPCIÓN
              ================================================== */}

              <div className="space-y-2">

                <Label
                  htmlFor="description"
                  className="text-[#211719]"
                >
                  Descripción
                </Label>

                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Describe brevemente esta materia..."
                  className="min-h-32 resize-none rounded-xl border-[#4A1115]/10 bg-[#F7F1E7] px-4 py-3 placeholder:text-[#687584]/50 focus-visible:border-[#4A1115]/30 focus-visible:ring-[#4A1115]/20"
                />

                <p className="text-xs leading-5 text-[#687584]">
                  Puedes utilizar este espacio para contextualizar la materia.
                </p>

              </div>


              {/* =================================================
                  COLOR
              ================================================== */}

              <div className="space-y-3">

                <div>

                  <Label className="text-[#211719]">
                    Color de la materia
                  </Label>

                  <p className="mt-1 text-xs leading-5 text-[#687584]">
                    Este color ayudará a identificar visualmente tu materia
                    dentro de Aura Atlas.
                  </p>

                </div>


                {/* Paleta */}

                <div className="flex flex-wrap gap-3">

                  {subjectColors.map(
                    (subjectColor) => {
                      const selected =
                        color ===
                        subjectColor.value;

                      return (
                        <button
                          key={
                            subjectColor.value
                          }
                          type="button"
                          title={
                            subjectColor.name
                          }
                          aria-label={`Seleccionar color ${subjectColor.name}`}
                          onClick={() =>
                            setColor(
                              subjectColor.value,
                            )
                          }
                          className={`group relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 ${
                            selected
                              ? "scale-110 ring-2 ring-[#4A1115] ring-offset-2 ring-offset-[#FFFDF8]"
                              : "hover:scale-105"
                          }`}
                          style={{
                            backgroundColor:
                              subjectColor.value,
                          }}
                        >
                          {selected && (
                            <Check className="h-5 w-5 text-white drop-shadow-sm" />
                          )}
                        </button>
                      );
                    },
                  )}


                  {/* Color personalizado */}

                  <label
                    htmlFor="custom-color"
                    title="Elegir otro color"
                    className="relative flex h-11 w-11 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#4A1115]/20 bg-[#F7F1E7] transition-all hover:scale-105 hover:border-[#4A1115]/40"
                  >

                    <input
                      id="custom-color"
                      type="color"
                      value={color}
                      onChange={(event) =>
                        setColor(
                          event.target.value,
                        )
                      }
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />

                    <span className="text-lg text-[#4A1115]">
                      +
                    </span>

                  </label>

                </div>


                {/* Preview */}

                <div
                  className="mt-4 overflow-hidden rounded-2xl p-4 transition-colors duration-300"
                  style={{
                    backgroundColor: `${color}12`,
                  }}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className="h-9 w-1 rounded-full"
                      style={{
                        backgroundColor:
                          color,
                      }}
                    />

                    <div>

                      <p
                        className="text-sm font-semibold"
                        style={{
                          color,
                        }}
                      >
                        {name.trim() ||
                          "Nombre de tu materia"}
                      </p>

                      <p className="mt-0.5 text-xs text-[#687584]">
                        Vista previa de identificación
                      </p>

                    </div>

                  </div>

                </div>

              </div>


              {/* =================================================
                  IMAGEN
              ================================================== */}

              <div className="space-y-3">

                <div>

                  <Label
                    htmlFor="logo"
                    className="text-[#211719]"
                  >
                    Imagen de la materia
                  </Label>

                  <p className="mt-1 text-xs leading-5 text-[#687584]">
                    Una imagen que ayude a darle identidad a este espacio.
                  </p>

                </div>


                <label
                  htmlFor="logo"
                  className="group flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-dashed border-[#4A1115]/15 bg-[#F7F1E7] p-4 transition-all hover:border-[#4A1115]/35 hover:bg-[#4A1115]/[0.03]"
                >

                  {logoPreview ? (

                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#FFFDF8] shadow-sm">

                      <img
                        src={logoPreview}
                        alt="Vista previa"
                        className="h-full w-full object-cover"
                      />

                    </div>

                  ) : (

                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#E8AFC0]/30 text-[#4A1115] transition-transform group-hover:scale-105">

                      <ImagePlus className="h-6 w-6" />

                    </div>

                  )}


                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-[#211719]">
                      {logo
                        ? logo.name
                        : "Agregar imagen"}
                    </p>

                    <p className="mt-1 text-xs text-[#687584]">
                      PNG, JPG o WEBP · máximo 2 MB
                    </p>

                  </div>

                </label>


                <input
                  id="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) =>
                    setLogo(
                      event.target.files?.[0] ??
                        null,
                    )
                  }
                />

              </div>


              {/* =================================================
                  BOTÓN
              ================================================== */}

              <div className="border-t border-[#4A1115]/10 pt-6">

                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    saving || !name.trim()
                  }
                  className="h-13 w-full rounded-xl bg-[#4A1115] text-base font-semibold text-[#FFFDF8] shadow-lg shadow-[#4A1115]/20 transition-all hover:-translate-y-0.5 hover:bg-[#5D171D] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {saving
                    ? "Creando materia..."
                    : "Crear materia"}

                  {!saving && (
                    <ArrowRight className="ml-2 h-4 w-4" />
                  )}

                </Button>

              </div>

            </form>

          </div>

        </div>


        {/* =================================================
            FOOTER
        ================================================== */}

        <div className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-[#4A1115]/10 pt-5 text-[11px] text-[#687584]/60 sm:flex-row">

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