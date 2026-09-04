"use client";

import { useRouter } from "next/navigation";

import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CompleteOnboarding() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>

        <h1 className="mt-8 text-4xl font-bold">
          ¡Todo listo!
        </h1>

        <p className="mt-4 text-lg text-muted-foreground">
          Tu cuenta ya está preparada.
        </p>

        <p className="mt-2 text-muted-foreground">
          Ahora puedes comenzar a crear tus materias,
          organizar tu contenido y compartirlo con tus
          estudiantes.
        </p>

        <Button
          className="mt-10 w-full"
          size="lg"
          onClick={() =>
            router.push("/teacher")
          }
        >
          Ir a mi espacio
        </Button>
      </div>
    </main>
  );
}