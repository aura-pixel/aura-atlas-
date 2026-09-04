"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { get } from "@/lib/api";
import { HypertextEditor } from "@/components/teacher/hypertext/HypertextEditor";

export default function HypertextEditorPage() {
  const params = useParams();

  const hypertextId = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  const [hypertext, setHypertext] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hypertextId) return;

    async function loadHypertext() {
      try {
        setLoading(true);
        setError(null);

        const data = await get<any>(
          `/hypertexts/${hypertextId}`
        );

        setHypertext(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el hipertexto.");
      } finally {
        setLoading(false);
      }
    }

    loadHypertext();
  }, [hypertextId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E7]">
        <p className="text-sm text-gray-500">
          Cargando hipertexto...
        </p>
      </div>
    );
  }

  if (error || !hypertext) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F1E7]">
        <p className="text-sm text-red-500">
          {error || "Hipertexto no encontrado."}
        </p>
      </div>
    );
  }

  return <HypertextEditor hypertext={hypertext} />;
}