"use client";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function UniversityRequestForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
  } = useForm();

  async function onSubmit() {
    router.push("/auth/teacher-type");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">
            Solicitar universidad
          </h1>

          <p className="mt-2 text-muted-foreground">
            Ayúdanos a agregar tu institución.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label>Universidad</Label>

            <Input
              placeholder="Universidad..."
              {...register("universityName")}
            />
          </div>

          <div className="space-y-2">
            <Label>Facultad</Label>

            <Input
              placeholder="Facultad..."
              {...register("facultyName")}
            />
          </div>

          <div className="space-y-2">
            <Label>Carrera</Label>

            <Input
              placeholder="Carrera..."
              {...register("careerName")}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
          >
            Continuar
          </Button>
        </form>
      </div>
    </main>
  );
}