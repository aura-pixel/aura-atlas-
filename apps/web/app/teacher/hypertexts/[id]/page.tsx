"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { get } from "@/lib/api";
import {
  HypertextEditor,
  type EditorHypertext,
} from "@/components/teacher/hypertext/HypertextEditor";
export default function HypertextEditorPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [hypertext, setHypertext] = useState<EditorHypertext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setHypertext(null);
    if (!id) {
      setLoading(false);
      setError("No encontramos el hipertexto.");
      return;
    }
    // Load preview code in parallel with the private data request.
    void import("@/components/teacher/hypertext/HypertextRenderer").catch(
      () => {},
    );
    get<EditorHypertext>(`/hypertexts/${id}`)
      .then((data) => {
        if (active) setHypertext(data);
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "No pudimos abrir el editor.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);
  if (loading || !hypertext)
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#F7F1E7] px-6 text-center text-[#4A1115]">
        <BookOpen size={34} strokeWidth={1.3} />
        {loading ? (
          <p role="status" className="text-sm">
            Preparando tu espacio de edición…
          </p>
        ) : (
          <>
            <p role="alert" className="max-w-md text-sm">
              {error || "No encontramos el hipertexto."}
            </p>
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="rounded-xl bg-[#4A1115] px-5 py-3 text-xs text-[#FFFDF8]"
            >
              Reintentar
            </button>
            <Link href="/teacher/dashboard" className="text-xs underline">
              Volver a mis materias
            </Link>
          </>
        )}
      </main>
    );
  return <HypertextEditor key={hypertext.id} hypertext={hypertext} />;
}
