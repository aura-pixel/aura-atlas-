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
  subjectSchema,
  type SubjectSchema,
} from "@/schemas/subject.schema";

import type { Subject } from "@/types/subject";

type SubjectFormProps = {
  mode: "create" | "edit";
  careerId: string;
  subject?: Subject;
  onSuccess?: () => void;
};

export function SubjectForm({
  mode,
  careerId,
  subject,
  onSuccess,
}: SubjectFormProps) {
  const router = useRouter();

  const [logo, setLogo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: subject?.name ?? "",
      abbreviation: subject?.abbreviation ?? "",
      description: subject?.description ?? "",
      color: subject?.color ?? "",
    },
  });

  async function onSubmit(data: SubjectSchema) {
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

      formData.append("careerId", careerId);

      if (logo) {
        formData.append("logo", logo);
      }

      if (mode === "create") {
        await postForm("/subjects", formData);

        reset();
        setLogo(null);
      } else {
        if (!subject) {
          throw new Error(
            "Subject is required."
          );
        }

        await patchForm(
          `/subjects/${subject.id}`,
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
        } la materia:`,
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
          placeholder="Anatomía Humana"
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
          placeholder="ANA-101"
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
          placeholder="Describe brevemente la materia..."
          {...register("description")}
        />

        {errors.description && (
          <p className="text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <ImageUpload
        label="Logo de la materia"
        helperText="Sube el logotipo oficial de la materia."
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
            Este color se utilizará para identificar la materia.
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
          ? "Crear materia"
          : "Guardar cambios"}
      </Button>
    </form>
  );
}