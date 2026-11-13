"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { get } from "@/lib/api";
import {
  UniversityRequestModal,
  type UniversityRequest,
} from "@/components/auth/onboarding/university-request-modal";

export default function TeacherRequests() {
  const [rows, setRows] = useState<UniversityRequest[]>([]);
  const [edit, setEdit] = useState<UniversityRequest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  async function load() {
    try {
      setRows(await get<UniversityRequest[]>("/university-requests"));
      setError("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos cargar tus solicitudes.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  return (
    <main className="min-h-screen bg-[#f6f3ee] px-5 py-10 text-[#4a1115]">
      <div className="mx-auto max-w-3xl">
        <Link href="/teacher/dashboard" className="text-xs">
          ← Mi espacio docente
        </Link>
        <h1 className="mt-7 text-3xl font-medium tracking-tight">
          Mis solicitudes
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[#8c7d84]">
          Tus universidades y facultades provisionales son privadas hasta su
          aprobación. Si necesitas corregir algún dato, puedes hacerlo sin
          perder materias ni contenidos.
        </p>
        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-[#e8afc0]/25 p-4 text-sm"
          >
            {error}
          </p>
        )}
        {loading ? (
          <p role="status" className="mt-8 text-sm">
            Cargando solicitudes…
          </p>
        ) : !rows.length ? (
          <div className="mt-8 rounded-xl border border-[#4a1115]/10 bg-white p-6 text-sm">
            Aún no tienes solicitudes.{" "}
            <Link href="/teacher" className="underline">
              Añadir mi universidad
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {rows.map((row) => (
              <article
                key={row.id}
                className="rounded-xl border border-[#4a1115]/10 bg-[#fffdfb] p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-medium">
                      {row.kind === "FACULTY"
                        ? row.facultyName
                        : row.universityName}
                    </h2>
                    <p className="mt-1 text-xs text-[#9b8590]">
                      {row.kind === "FACULTY"
                        ? row.universityName
                        : row.facultyName}
                      {row.abbreviation ? ` · ${row.abbreviation}` : ""}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#8b9aaa]/15 px-3 py-1.5 text-[10px]">
                    {row.status === "APPROVED"
                      ? row.kind === "FACULTY"
                        ? "Facultad aprobada"
                        : "Aprobada · Disponible para todos"
                      : row.status === "REJECTED"
                        ? "Requiere correcciones · Privada"
                        : "En revisión · Privada"}
                  </span>
                </div>
                <p className="mt-4 text-sm text-[#88717d]">{row.careerName}</p>
                {row.reviewNotes && (
                  <div className="mt-4 rounded-lg bg-[#f6f3ee] p-4 text-sm leading-6">
                    <strong className="block text-xs font-medium">
                      Observaciones del administrador
                    </strong>
                    {row.reviewNotes}
                  </div>
                )}
                {row.status !== "APPROVED" && (
                  <button
                    type="button"
                    onClick={() => setEdit(row)}
                    className="mt-5 rounded-lg border border-[#4a1115]/20 px-4 py-2.5 text-xs"
                  >
                    Corregir y reenviar
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
        {edit && (
          <UniversityRequestModal
            key={edit.id}
            open
            request={edit}
            onOpenChange={(open) => {
              if (!open) setEdit(null);
            }}
            onSuccess={() => {
              setEdit(null);
              void load();
            }}
          />
        )}
      </div>
    </main>
  );
}
