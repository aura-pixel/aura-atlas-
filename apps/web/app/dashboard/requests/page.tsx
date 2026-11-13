"use client";
import { useEffect, useState } from "react";
import { get, patch } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { UniversityRequest } from "@/components/auth/onboarding/university-request-modal";

export default function ReviewUniversities() {
  const [rows, setRows] = useState<UniversityRequest[]>([]);
  const [selected, setSelected] = useState<UniversityRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("PENDING");
  const [loading, setLoading] = useState(true);
  async function load() {
    try {
      setRows(await get<UniversityRequest[]>("/university-requests"));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos cargar las solicitudes.",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function review(status: "APPROVED" | "REJECTED") {
    if (!selected || busy) return;
    if (status === "REJECTED" && !notes.trim()) {
      setError("Explica qué datos debe corregir el docente.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await patch(`/university-requests/${selected.id}`, {
        status,
        reviewNotes: notes.trim(),
      });
      setSelected(null);
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos guardar la revisión.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-5xl text-[#4a1115]">
      <p className="text-[10px] tracking-[.2em] text-[#9b8590]">
        VALIDACIÓN INSTITUCIONAL
      </p>
      <h1 className="mt-3 text-3xl font-medium tracking-tight">
        Solicitudes académicas
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[#8c7d84]">
        Revisa los nombres y los duplicados de universidades y facultades antes
        de incorporarlas al catálogo. Los docentes podrán publicar sus
        contenidos cuando su universidad y facultad estén aprobadas.
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        {[
          ["PENDING", "Pendientes"],
          ["APPROVED", "Aprobadas"],
          ["REJECTED", "Por corregir"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={`rounded-lg border px-4 py-2 text-xs ${filter === value ? "border-[#4a1115] bg-[#4a1115] text-white" : "border-[#4a1115]/15 bg-white"}`}
          >
            {label} ({rows.filter((row) => row.status === value).length})
          </button>
        ))}
      </div>
      {error && !selected && (
        <p role="alert" className="mt-5 text-sm">
          {error}
        </p>
      )}
      <div className="mt-6 space-y-3">
        {loading ? (
          <p role="status">Cargando solicitudes…</p>
        ) : !rows.some((row) => row.status === filter) ? (
          <p className="rounded-xl border border-[#4a1115]/10 bg-white p-6 text-sm text-[#9b8590]">
            No hay solicitudes en esta categoría.
          </p>
        ) : (
          rows
            .filter((row) => row.status === filter)
            .map((row) => (
              <article
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-5 rounded-xl border border-[#4a1115]/10 bg-white p-6"
              >
                <div>
                  <h2 className="text-base font-medium">
                    {row.kind === "FACULTY"
                      ? row.facultyName
                      : row.universityName}{" "}
                    {row.abbreviation && (
                      <span className="text-xs text-[#9b8590]">
                        ({row.abbreviation})
                      </span>
                    )}
                  </h2>
                  <p className="mt-2 text-xs leading-6 text-[#8c7d84]">
                    {row.kind === "FACULTY"
                      ? row.universityName
                      : row.facultyName}{" "}
                    · {row.careerName}
                    <span className="ml-2 text-[#4a1115]">
                      {row.kind === "FACULTY"
                        ? "Solicitud de facultad"
                        : "Solicitud de universidad"}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#9b8590]">
                    Solicitada por {row.user?.name} · {row.user?.email}
                  </p>
                  {row.reviewNotes && (
                    <p className="mt-3 text-xs leading-6">{row.reviewNotes}</p>
                  )}
                </div>
                {row.status === "PENDING" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(row);
                      setNotes("");
                      setError("");
                    }}
                    className="rounded-lg border border-[#4a1115]/20 px-4 py-3 text-xs"
                  >
                    Revisar solicitud
                  </button>
                )}
              </article>
            ))
        )}
      </div>
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open && !busy) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90svh] overflow-y-auto rounded-2xl bg-[#fffdf8] p-7 text-[#4a1115]">
          <DialogHeader>
            <DialogTitle>Revisar datos institucionales</DialogTitle>
            <DialogDescription>
              Aprueba sólo si los nombres son correctos y no existe ya otra
              entrada en este contexto académico.
            </DialogDescription>
          </DialogHeader>
          <dl className="mt-3 space-y-4 text-sm">
            {[
              ["Universidad", selected?.universityName],
              ["Siglas", selected?.abbreviation],
              ["Facultad", selected?.facultyName],
              ["Carrera", selected?.careerName],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-[#9b8590]">{label}</dt>
                <dd className="mt-1">{value}</dd>
              </div>
            ))}
          </dl>
          <label htmlFor="review-notes" className="mt-2 text-xs">
            Observaciones (obligatorias si solicitas correcciones)
          </label>
          <textarea
            id="review-notes"
            maxLength={1000}
            value={notes}
            disabled={busy}
            onChange={(event) => setNotes(event.target.value)}
            className="min-h-24 rounded-lg border border-[#4a1115]/20 bg-white p-3 text-sm"
          />
          {error && (
            <p role="alert" className="text-sm leading-6">
              {error}
            </p>
          )}
          <div className="mt-3 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => review("REJECTED")}
              className="rounded-lg border border-[#4a1115]/20 px-4 py-3 text-xs disabled:opacity-50"
            >
              Solicitar correcciones
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => review("APPROVED")}
              className="rounded-lg bg-[#4a1115] px-4 py-3 text-xs text-white disabled:opacity-50"
            >
              {busy ? "Guardando…" : "Aprobar y añadir al catálogo"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
