"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { get } from "@/lib/api";
import { HypertextRenderer } from "@/components/teacher/hypertext/HypertextRenderer";

type Material = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  mimeType?: string | null;
  size?: number | null;
};

type Subtopic = {
  id: string;
  number: string;
  title: string;
};

type Topic = {
  id: string;
  number: string;
  title: string;
  subtopics: Subtopic[];
  materials: Material[];
};

type Unit = {
  id: string;
  number: number;
  title: string;
  objective?: string | null;
  imageUrl?: string | null;
  topics: Topic[];
};

type Hypertext = {
  id: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  isPublished: boolean;
  slug: string | null;

  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  theme: "LIGHT" | "DARK";

  user: {
    id: string;
    name: string;
  };

  subject: {
    id: string;
    name: string;
    abbreviation?: string | null;
    color?: string | null;
    logoUrl?: string | null;

    career: {
      name: string;
      abbreviation?: string | null;

      faculty: {
        name: string;
        abbreviation?: string | null;

        university: {
          name: string;
          abbreviation: string;
          logoUrl?: string | null;
        };
      };
    };
  };

  units: Unit[];
};

export default function PublicHypertextPage() {
  const params = useParams();

  const subject = Array.isArray(params?.subject)
    ? params.subject[0]
    : params?.subject;

  const [hypertext, setHypertext] =
    useState<Hypertext | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!subject) {
      setLoading(false);
      setError(
        "No se encontró la materia en la URL.",
      );
      return;
    }

    async function loadHypertext() {
      try {
        setLoading(true);
        setError(null);

        const data = await get<Hypertext>(
          `/hypertexts/public/${subject}`,
        );

        setHypertext(data);
      } catch (error) {
        console.error(
          "Error al cargar el hipertexto público:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "No pudimos cargar este hipertexto.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadHypertext();
  }, [subject]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Cargando hipertexto...
          </p>
        </div>
      </main>
    );
  }

  if (error || !hypertext) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Aura Atlas
            </p>

            <h1 className="mt-3 text-3xl font-bold">
              Hipertexto no disponible
            </h1>

            <p className="mt-3 text-muted-foreground">
              {error ??
                "Este hipertexto no existe o todavía no ha sido publicado."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <HypertextRenderer
        hypertext={hypertext}
        mode="public"
      />
    </main>
  );
}