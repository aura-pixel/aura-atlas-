import {
  Check,
  ImagePlus,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import type { Subject } from "./types";

const colors = [
  "#4A1115",
  "#C9829B",
  "#E6A47A",
  "#9B8CC4",
  "#718DA8",
  "#7E9C83",
  "#C5A35A",
  "#8B9AAA",
];

type SubjectInformationProps = {
  subject: Subject;
  saving: boolean;
  onSave: (data: {
    name: string;
    abbreviation: string;
    description: string;
    color: string;
    logo: File | null;
  }) => void;
};

export function SubjectInformation({
  subject,
  saving,
  onSave,
}: SubjectInformationProps) {
  const [name, setName] =
    useState(subject.name);

  const [abbreviation, setAbbreviation] =
    useState(subject.abbreviation ?? "");

  const [description, setDescription] =
    useState(subject.description ?? "");

  const [color, setColor] =
    useState(
      subject.color ?? "#4A1115",
    );

  const [logo, setLogo] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string | null>(
      subject.logoUrl ?? null,
    );

  useEffect(() => {
    setName(subject.name);
    setAbbreviation(
      subject.abbreviation ?? "",
    );
    setDescription(
      subject.description ?? "",
    );
    setColor(
      subject.color ?? "#4A1115",
    );
    setPreview(
      subject.logoUrl ?? null,
    );
  }, [subject]);

  useEffect(() => {
    if (!logo) return;

    const url =
      URL.createObjectURL(logo);

    setPreview(url);

    return () =>
      URL.revokeObjectURL(url);
  }, [logo]);

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    onSave({
      name,
      abbreviation,
      description,
      color,
      logo,
    });
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">

      {/* =====================================================
          PRESENTACIÓN
      ====================================================== */}

      <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#4A1115] p-7 text-[#FFFDF8] shadow-lg shadow-[#4A1115]/10">

        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E8AFC0]">
          Identidad
        </p>

        <div className="mt-7 flex h-24 w-24 items-center justify-center overflow-hidden rounded-[1.75rem] bg-white/10">

          {preview ? (
            <img
              src={preview}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span
              className="h-10 w-10 rounded-2xl"
              style={{
                backgroundColor: color,
              }}
            />
          )}

        </div>

        <h2 className="mt-7 text-2xl font-bold">
          {name || "Tu materia"}
        </h2>

        {abbreviation && (
          <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#E8AFC0]">
            {abbreviation}
          </span>
        )}

        <p className="mt-5 text-sm leading-7 text-white/60">
          La información de esta sección define cómo se identifica tu materia
          dentro de Aura Atlas.
        </p>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/5 p-4">

          <span
            className="h-4 w-4 rounded-full ring-2 ring-white/20"
            style={{
              backgroundColor: color,
            }}
          />

          <span className="text-xs text-white/65">
            Color actual de la materia
          </span>

        </div>

      </div>


      {/* =====================================================
          FORMULARIO
      ====================================================== */}

      <div className="rounded-[2rem] border border-[#4A1115]/10 bg-[#FFFDF8] p-7 shadow-sm sm:p-9">

        <div className="mb-8">

          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#4A1115]">
            Información
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-[-0.03em]">
            Identidad de la materia
          </h2>

          <p className="mt-2 text-sm leading-6 text-[#687584]">
            Actualiza los datos que identifican este espacio.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7"
        >

          <div className="space-y-2">

            <Label htmlFor="subject-name">
              Nombre
            </Label>

            <Input
              id="subject-name"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              className="h-12 rounded-xl bg-[#F7F1E7]"
              required
            />

          </div>


          <div className="space-y-2">

            <Label htmlFor="subject-abbreviation">
              Abreviación
            </Label>

            <Input
              id="subject-abbreviation"
              value={abbreviation}
              onChange={(event) =>
                setAbbreviation(
                  event.target.value,
                )
              }
              className="h-12 rounded-xl bg-[#F7F1E7]"
              maxLength={20}
            />

          </div>


          <div className="space-y-2">

            <Label htmlFor="subject-description">
              Descripción
            </Label>

            <Textarea
              id="subject-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              className="min-h-32 resize-none rounded-xl bg-[#F7F1E7]"
            />

          </div>


          <div className="space-y-4">

            <div>

              <Label>
                Color de la materia
              </Label>

              <p className="mt-1 text-xs text-[#687584]">
                Se utilizará como acento visual en tu espacio.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              {colors.map(
                (colorOption) => {
                  const selected =
                    color === colorOption;

                  return (
                    <button
                      key={colorOption}
                      type="button"
                      onClick={() =>
                        setColor(
                          colorOption,
                        )
                      }
                      className={`flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-105 ${
                        selected
                          ? "ring-2 ring-[#4A1115] ring-offset-2"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          colorOption,
                      }}
                    >
                      {selected && (
                        <Check className="h-5 w-5 text-white" />
                      )}
                    </button>
                  );
                },
              )}

              <label className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-[#4A1115]/20 bg-[#F7F1E7]">

                <input
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

          </div>


          <div className="space-y-3">

            <Label>
              Imagen
            </Label>

            <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed border-[#4A1115]/15 bg-[#F7F1E7] p-4 transition-colors hover:border-[#4A1115]/30">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FFFDF8]">

                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImagePlus className="h-5 w-5 text-[#4A1115]" />
                )}

              </div>

              <div>

                <p className="text-sm font-semibold">
                  {logo
                    ? logo.name
                    : "Cambiar imagen"}
                </p>

                <p className="mt-1 text-xs text-[#687584]">
                  PNG, JPG o WEBP · máximo 2 MB
                </p>

              </div>

              <input
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

            </label>

          </div>


          <div className="border-t border-[#4A1115]/10 pt-6">

            <Button
              type="submit"
              disabled={saving || !name.trim()}
              className="h-12 w-full rounded-xl bg-[#4A1115] text-[#FFFDF8] hover:bg-[#5D171D]"
            >

              <Save className="mr-2 h-4 w-4" />

              {saving
                ? "Guardando..."
                : "Guardar cambios"}

            </Button>

          </div>

        </form>

      </div>

    </section>
  );
}