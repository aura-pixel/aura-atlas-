"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ImageUpload } from "@/components/shared/image-upload";

import { postForm, patchForm } from "@/lib/api";

import {
  careerSchema,
  type CareerSchema,
} from "@/schemas/career.schema";

import type { Career } from "@/types/career";

type CareerFormProps = {
  mode: "create" | "edit";
  facultyId: string;
  career?: Career;
  onSuccess?: () => void;
};

export function CareerForm({
  mode,
  facultyId,
  career,
  onSuccess,
}: CareerFormProps) {
  const router = useRouter();

  const [logo, setLogo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      name: career?.name ?? "",
      abbreviation: career?.abbreviation ?? "",
      description: career?.description ?? "",
      color: career?.color ?? "",
    },
  });

  async function onSubmit(data: CareerSchema) {
    try {
      const formData = new FormData();

      formData.append("name", data.name);

      if (data.abbreviation) {
        formData.append(
          "abbreviation",
          data.abbreviation,
        );
      }

      if (data.description) {
        formData.append(
          "description",
          data.description,
        );
      }

      if (data.color) {
        formData.append("color", data.color);
      }

      formData.append("facultyId", facultyId);

      if (logo) {
        formData.append("logo", logo);
      }

      if (mode === "create") {
        await postForm("/careers", formData);

        reset();
        setLogo(null);
      } else {
        if (!career) {
          throw new Error(
            "Career is required."
          );
        }

        await patchForm(
          `/careers/${career.id}`,
          formData,
        );
      }

      router.refresh();

      onSuccess?.();
    } catch (error) {
      console.error(
        `Error al ${
          mode === "create"
            ? "crear"
            : "actualizar"
        } la carrera:`,
        error,
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name">
          Nombre
        </Label>

        <Input
          id="name"
          placeholder="Ingeniería en Computación"
          {...register("name")}
        />

        {errors.name && (
          <p className="text-sm text-red-500">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="abbreviation">
          Abreviatura
        </Label>

        <Input
          id="abbreviation"
          placeholder="ICO"
          {...register("abbreviation")}
        />

        {errors.abbreviation && (
          <p className="text-sm text-red-500">
            {errors.abbreviation.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Descripción
        </Label>

        <Textarea
          id="description"
          rows={4}
          placeholder="Describe brevemente la carrera..."
          {...register("description")}
        />

        {errors.description && (
          <p className="text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <ImageUpload
        label="Logo de la carrera"
        helperText="Sube el logotipo oficial de la carrera."
        value={logo}
        onChange={setLogo}
      />

      <div className="space-y-2">
        <Label htmlFor="color">
          Color institucional
        </Label>

        <div className="flex items-center gap-3">
          <Input
            id="color"
            type="color"
            className="h-12 w-20 cursor-pointer p-1"
            {...register("color")}
          />

          <span className="text-sm text-muted-foreground">
            Este color se utilizará para identificar la carrera.
          </span>
        </div>

        {errors.color && (
          <p className="text-sm text-red-500">
            {errors.color.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? mode === "create"
            ? "Creando..."
            : "Guardando..."
          : mode === "create"
          ? "Crear carrera"
          : "Guardar cambios"}
      </Button>
    </form>
  );
}