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
  universitySchema,
  type UniversitySchema,
} from "@/schemas/university.schema";

import type { University } from "@/types/university";

type UniversityFormProps = {
  mode: "create" | "edit";
  university?: University;
  onSuccess?: () => void;
};

export function UniversityForm({
  mode,
  university,
  onSuccess,
}: UniversityFormProps) {
  const router = useRouter();

  const [logo, setLogo] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UniversitySchema>({
    resolver: zodResolver(universitySchema),
    defaultValues: {
      name: university?.name ?? "",
      abbreviation: university?.abbreviation ?? "",
      description: university?.description ?? "",
    },
  });

  async function onSubmit(data: UniversitySchema) {
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("abbreviation", data.abbreviation);

      if (data.description) {
        formData.append("description", data.description);
      }

      if (logo) {
        formData.append("logo", logo);
      }

      if (mode === "create") {
        await postForm("/universities", formData);
        reset();
        setLogo(null);
      } else {
        if (!university) {
          throw new Error("University is required.");
        }
        await patchForm(`/universities/${university.id}`, formData);
      }

      router.refresh();

      onSuccess?.();
    } catch (error) {
      console.error(
        `Error al ${mode === "create" ? "crear" : "actualizar"} la universidad:`,
        error
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ImageUpload
        label="Logotipo"
        helperText="PNG, JPG o SVG (máx. 5 MB)"
        value={logo}
        onChange={setLogo}
      />

      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>

        <Input
          id="name"
          placeholder="Universidad Autónoma del Estado de México"
          {...register("name")}
        />

        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="abbreviation">Abreviatura</Label>

        <Input
          id="abbreviation"
          placeholder="UAEMéx"
          {...register("abbreviation")}
        />

        {errors.abbreviation && (
          <p className="text-sm text-red-500">{errors.abbreviation.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>

        <Textarea
          id="description"
          rows={4}
          placeholder="Describe brevemente la universidad..."
          {...register("description")}
        />

        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting
          ? mode === "create"
            ? "Creando..."
            : "Guardando..."
          : mode === "create"
          ? "Crear universidad"
          : "Guardar cambios"}
      </Button>
    </form>
  );
}