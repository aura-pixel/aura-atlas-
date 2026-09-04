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
  facultySchema,
  type FacultySchema,
} from "@/schemas/faculty.schema";

import type { Faculty } from "@/types/faculty";

type FacultyFormProps = {
  mode: "create" | "edit";
  universityId: string;
  faculty?: Faculty;
  onSuccess?: () => void;
};

export function FacultyForm({
  mode,
  universityId,
  faculty,
  onSuccess,
}: FacultyFormProps) {
  const router = useRouter();

  const [logo, setLogo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FacultySchema>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: faculty?.name ?? "",
      abbreviation: faculty?.abbreviation ?? "",
      description: faculty?.description ?? "",
      color: faculty?.color ?? "",
    },
  });

  async function onSubmit(data: FacultySchema) {
    try {
      const formData = new FormData();

      formData.append("name", data.name);

      if (data.abbreviation) {
        formData.append("abbreviation", data.abbreviation);
      }

      if (data.description) {
        formData.append("description", data.description);
      }

      if (data.color) {
        formData.append("color", data.color);
      }

      formData.append("universityId", universityId);

      if (logo) {
        formData.append("logo", logo);
      }

      if (mode === "create") {
        await postForm("/faculties", formData);

        reset();
        setLogo(null);
      } else {
        if (!faculty) {
          throw new Error("Faculty is required.");
        }

        await patchForm(`/faculties/${faculty.id}`, formData);
      }

      router.refresh();

      onSuccess?.();
    } catch (error) {
      console.error(
        `Error al ${
          mode === "create" ? "crear" : "actualizar"
        } la facultad:`,
        error
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>

        <Input
          id="name"
          placeholder="Facultad de Medicina"
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
          placeholder="FM"
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
          placeholder="Describe brevemente la facultad..."
          {...register("description")}
        />

        {errors.description && (
          <p className="text-sm text-red-500">
            {errors.description.message}
          </p>
        )}
      </div>

      <ImageUpload
        label="Logo de la facultad"
        helperText="Sube el logotipo oficial de la facultad."
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
            Este color se utilizará para identificar la facultad.
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
          ? "Crear facultad"
          : "Guardar cambios"}
      </Button>
    </form>
  );
}