"use client";
import { useEffect, useState, type FormEvent } from "react";
import { BookOpen } from "lucide-react";
import { SubjectColorPicker } from "../subjects/subject-color-picker";
import { assetUrl } from "@/lib/config";
import { getSubjectTextColor } from "@/lib/subject-colors";
import type { Subject } from "./types";
import styles from "./subject-workspace.module.css";
type Information = {
  name: string;
  abbreviation: string;
  description: string;
  color: string;
  logo: File | null;
};
export function SubjectInformation({
  subject,
  saving,
  onSave,
  onDirtyChange,
}: {
  subject: Subject;
  saving: boolean;
  onSave: (data: Information) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [name, setName] = useState(subject.name);
  const [abbreviation, setAbbreviation] = useState(subject.abbreviation ?? "");
  const [description, setDescription] = useState(subject.description ?? "");
  const [color, setColor] = useState(subject.color ?? "#4A1115");
  const [logo, setLogo] = useState<File | null>(null);
  const [preview, setPreview] = useState(subject.logoUrl ?? "");
  const [error, setError] = useState("");
  useEffect(() => {
    setName(subject.name);
    setAbbreviation(subject.abbreviation ?? "");
    setDescription(subject.description ?? "");
    setColor(subject.color ?? "#4A1115");
    setLogo(null);
    setPreview(subject.logoUrl ?? "");
  }, [subject]);
  useEffect(() => {
    if (!logo) return;
    const url = URL.createObjectURL(logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logo]);
  const dirty =
    name.trim() !== subject.name ||
    abbreviation.trim() !== (subject.abbreviation ?? "") ||
    description.trim() !== (subject.description ?? "") ||
    color !== (subject.color ?? "#4A1115") ||
    !!logo;
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!saving && dirty && !error && name.trim())
      onSave({ name, abbreviation, description, color, logo });
  }
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>PERSONALIZACIÓN</p>
        <h2>
          Edita <em>tu materia.</em>
        </h2>
        <p>
          Estos cambios se aplican sólo a tu perfil. Cada docente conserva su
          propia versión.
        </p>
      </div>
      <div className={styles.editorLayout}>
        <form className={styles.panel} onSubmit={submit}>
          <fieldset disabled={saving} className={styles.stack}>
            <label className={styles.field} htmlFor="subject-name">
              Nombre de la materia
              <input
                id="subject-name"
                required
                maxLength={5000}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className={styles.field} htmlFor="subject-abbreviation">
              Abreviación (opcional)
              <input
                id="subject-abbreviation"
                maxLength={20}
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value)}
              />
            </label>
            <label className={styles.field} htmlFor="subject-description">
              Descripción (opcional)
              <textarea
                id="subject-description"
                maxLength={5000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <div className={styles.stack}>
              <h3>Color de la materia</h3>
              <SubjectColorPicker
                value={color}
                onChange={setColor}
                disabled={saving}
              />
            </div>
            <label className={styles.field}>
              Imagen (opcional)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setError("");
                  setLogo(null);
                  setPreview(subject.logoUrl ?? "");
                  if (!file) return;
                  if (
                    !["image/png", "image/jpeg", "image/webp"].includes(
                      file.type,
                    ) ||
                    file.size > 2 * 1024 * 1024
                  ) {
                    setError(
                      "Selecciona una imagen PNG, JPG o WEBP de hasta 2 MB.",
                    );
                    e.target.value = "";
                    return;
                  }
                  setLogo(file);
                }}
              />
              <small className={styles.muted}>
                PNG, JPG o WEBP · Hasta 2 MB
              </small>
            </label>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <div className={styles.actions}>
              <button
                className={styles.primary}
                type="submit"
                disabled={saving || !dirty || !name.trim() || !!error}
              >
                {saving ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </fieldset>
        </form>
        <aside>
          <div
            className={styles.miniBook}
            style={{ background: color, color: getSubjectTextColor(color) }}
          >
            {preview ? (
              <img
                src={assetUrl(preview)}
                alt="Vista previa"
                style={{
                  height: 65,
                  width: 65,
                  objectFit: "cover",
                  borderRadius: 9,
                }}
              />
            ) : (
              <BookOpen size={30} />
            )}
            <h3>{name || "Tu materia"}</h3>
            <p style={{ fontSize: 11, marginTop: 15 }}>{abbreviation}</p>
          </div>
          <p className={styles.muted} style={{ marginTop: 20 }}>
            Así se identificará la materia en tu espacio.
          </p>
        </aside>
      </div>
    </section>
  );
}
