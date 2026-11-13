"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { post, patch } from "@/lib/api";

export type UniversityRequest = {
  kind?: "UNIVERSITY" | "FACULTY";
  universityId?: string | null;
  id: string;
  universityName: string;
  abbreviation?: string | null;
  facultyName: string;
  careerName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNotes?: string | null;
  createdAt?: string;
  user?: { name: string; email: string };
};
const clean = (value: string) =>
  value.normalize("NFC").trim().replace(/\s+/g, " ");
const namePattern = /^[\p{L}\p{N}][\p{L}\p{M}\p{N} .,'’()&/\-]*$/u;

export function UniversityRequestModal({
  open,
  onOpenChange,
  onSuccess,
  request,
  facultyUniversity,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  request?: UniversityRequest;
  facultyUniversity?: { id: string; name: string };
}) {
  const isFaculty = request?.kind === "FACULTY" || !!facultyUniversity;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const data = {
      universityName: clean(String(form.get("universityName") || "")),
      abbreviation: clean(String(form.get("abbreviation") || "")).toUpperCase(),
      facultyName: clean(String(form.get("facultyName") || "")),
      careerName: clean(String(form.get("careerName") || "")),
    };
    if (
      (isFaculty
        ? [data.facultyName, data.careerName]
        : [data.universityName, data.facultyName, data.careerName]
      ).some(
        (value) =>
          value.length < 3 || value.length > 180 || !namePattern.test(value),
      )
    ) {
      setError(
        "Revisa los nombres oficiales. Usa de 3 a 180 caracteres, con letras, números y puntuación habitual.",
      );
      return;
    }
    if (
      (!isFaculty || data.abbreviation) &&
      !/^[\p{L}\p{N}][\p{L}\p{N} .\-]{1,19}$/u.test(data.abbreviation)
    ) {
      setError(
        "Revisa las siglas: usa entre 2 y 20 letras, números, espacios, puntos o guiones.",
      );
      return;
    }
    if (form.get("confirmed") !== "on") {
      setError("Confirma que revisaste los nombres antes de continuar.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (isFaculty) {
        const facultyData = {
          facultyName: data.facultyName,
          careerName: data.careerName,
          abbreviation: data.abbreviation || undefined,
        };
        if (request)
          await patch(
            `/university-requests/${request.id}/resubmit-faculty`,
            facultyData,
          );
        else
          await post("/university-requests/faculties", {
            ...facultyData,
            universityId: facultyUniversity?.id,
          });
      } else if (request)
        await patch(`/university-requests/${request.id}/resubmit`, data);
      else await post("/university-requests", data);
      onSuccess();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos guardar la solicitud. Inténtalo de nuevo.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setError("");
          onOpenChange(value);
        }
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto rounded-2xl border-[#4a1115]/10 bg-[#fffdf8] p-6 text-[#4a1115] sm:max-w-xl sm:p-8">
        <DialogHeader>
          <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b9aaa]/15">
            <ShieldCheck size={20} />
          </span>
          <DialogTitle className="text-2xl font-medium tracking-tight">
            {isFaculty
              ? request
                ? "Corrige tu facultad"
                : "Añade tu facultad"
              : request
                ? "Corrige tu universidad"
                : "Añade tu universidad"}
          </DialogTitle>
          <DialogDescription className="text-sm leading-6 text-[#7e7478]">
            Podrás trabajar en tu espacio privado desde ahora.{" "}
            {isFaculty ? "La facultad" : "La universidad"} aparecerá para los
            demás docentes cuando el administrador la apruebe.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={submit}
          className="mt-2 space-y-4"
          noValidate
          aria-busy={busy}
        >
          {isFaculty && (
            <div className="rounded-lg border border-[#4a1115]/10 bg-[#f6f3ee] p-3 text-sm">
              <span className="mb-1 block text-xs text-[#8b7d82]">
                Universidad seleccionada
              </span>
              {facultyUniversity?.name || request?.universityName}
            </div>
          )}
          {[
            [
              "universityName",
              "Nombre oficial de la universidad",
              "Ej. Universidad Autónoma del Estado de México",
              request?.universityName,
              180,
            ],
            [
              "abbreviation",
              isFaculty ? "Siglas (opcional)" : "Siglas",
              isFaculty ? "Ej. FM" : "Ej. UAEMéx",
              request?.abbreviation,
              20,
            ],
            [
              "facultyName",
              "Facultad o escuela",
              "Ej. Facultad de Medicina",
              request?.facultyName,
              180,
            ],
            [
              "careerName",
              "Carrera",
              "Ej. Licenciatura en Terapia Ocupacional",
              request?.careerName,
              180,
            ],
          ]
            .filter(([name]) => !isFaculty || name !== "universityName")
            .map(([name, label, placeholder, value, max]) => (
              <div key={String(name)} className="space-y-2">
                <label
                  htmlFor={`request-${name}`}
                  className="block text-xs font-medium"
                >
                  {label}
                </label>
                <input
                  id={`request-${name}`}
                  name={String(name)}
                  defaultValue={String(value || "")}
                  placeholder={String(placeholder)}
                  maxLength={Number(max)}
                  disabled={busy}
                  onBlur={(event) => {
                    event.target.value = clean(event.target.value);
                  }}
                  className="h-11 w-full rounded-lg border border-[#4a1115]/20 bg-white px-3 text-sm outline-none placeholder:text-[#a79c9f] focus:border-[#4a1115]/60 focus:ring-2 focus:ring-[#e8afc0]/30"
                />
              </div>
            ))}
          <p className="text-xs leading-5 text-[#8b7d82]">
            Usa los nombres completos y conserva los acentos. Revisamos el
            formato y los duplicados. El administrador validará la información.
          </p>
          <label className="flex items-start gap-3 text-xs leading-5 text-[#73636a]">
            <input
              type="checkbox"
              name="confirmed"
              disabled={busy}
              className="mt-1 accent-[#4a1115]"
            />
            Revisé los nombres de mi universidad, facultad y carrera.
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[#e8afc0]/20 p-3 text-sm leading-6"
            >
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-[#4a1115]/10 pt-4">
            <button
              type="button"
              disabled={busy}
              onClick={() => onOpenChange(false)}
              className="rounded-lg px-4 py-3 text-xs disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-[#4a1115] px-5 py-3 text-xs font-medium text-[#fffdf8] disabled:opacity-50"
            >
              {busy && <LoaderCircle size={15} className="animate-spin" />}
              {busy
                ? "Guardando…"
                : request
                  ? "Reenviar a revisión"
                  : "Crear mi espacio privado"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
