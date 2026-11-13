"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, ImageIcon, LoaderCircle, Search, Upload } from "lucide-react";
import { COVER_OPTIONS, ILLUSTRATED_COVERS } from "./editor-options";
import type { UnitImageRequest } from "./unit-image-editor-context";
import styles from "./unit-image-picker.module.css";
export function UnitImagePicker({
  request,
  onClose,
  onBusyChange,
  registerSave,
}: {
  request: UnitImageRequest;
  onClose: () => void;
  onBusyChange: (busy: boolean) => void;
  registerSave: (save: (() => Promise<boolean>) | null) => void;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [selected, setSelected] = useState(request.imageUrl);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const candidate = file ? preview : selected;
  useEffect(() => {
    if (file && !preview) return;
    request.preview(candidate);
    return () => request.preview(undefined);
  }, [request, candidate, file, preview]);
  useEffect(() => {
    registerSave(() => apply(false, false));
    return () => registerSave(null);
  });
  async function apply(remove = false, close = true) {
    if (busy || (file && !preview)) return false;
    setError("");
    setBusy(true);
    onBusyChange(true);
    try {
      if (remove) await request.apply(null);
      else if (file) await request.upload(file);
      else if (selected !== request.imageUrl) await request.apply(selected);
      if (close) onClose();
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos guardar la imagen. Inténtalo de nuevo.",
      );
      return false;
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  }
  return (
    <div className={styles.picker}>
      <p className={styles.context}>{request.title}</p>
      <p>
        Prueba varias imágenes y mira cómo quedan en tu unidad. Tu elección se
        guarda al aplicar o al cambiar a otra unidad.
      </p>
      <div
        className={styles.preview}
        aria-label="Vista previa de la imagen seleccionada"
      >
        {candidate ? (
          <img src={candidate} alt="Imagen seleccionada para la unidad" />
        ) : (
          <ImageIcon size={28} />
        )}
        <small>Vista previa · Sin guardar</small>
      </div>
      <div className={styles.tabs}>
        <button
          type="button"
          disabled={busy}
          aria-pressed={tab === "library"}
          onClick={() => setTab("library")}
        >
          <ImageIcon size={13} /> Biblioteca
        </button>
        <button
          type="button"
          disabled={busy}
          aria-pressed={tab === "upload"}
          onClick={() => setTab("upload")}
        >
          <Upload size={13} /> Subir
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {tab === "library" ? (
        <>
          <h3>Formas y colores</h3>
          <div className={styles.grid}>
            {COVER_OPTIONS.map((image) => {
              const path = `/hypertext/covers/minimal-${image.id}.svg`;
              return (
                <button
                  type="button"
                  disabled={busy}
                  aria-label={`Imagen ${image.name}`}
                  aria-pressed={selected === path && !file}
                  key={path}
                  onClick={() => {
                    setSelected(path);
                    setFile(null);
                    setError("");
                  }}
                >
                  <Image src={path} width={140} height={95} alt="" />
                  <span>{image.name}</span>
                  {selected === path && !file && <Check size={12} />}
                </button>
              );
            })}
          </div>
          <h3>Ilustraciones</h3>
          <div className={styles.grid}>
            {ILLUSTRATED_COVERS.map((path, index) => (
              <button
                type="button"
                disabled={busy}
                key={path}
                aria-label={`Imagen ilustrada ${index + 1}`}
                aria-pressed={selected === path && !file}
                onClick={() => {
                  setSelected(path);
                  setFile(null);
                  setError("");
                }}
              >
                <Image
                  src={path}
                  width={140}
                  height={95}
                  sizes="140px"
                  alt=""
                />
                <span>Ilustración {index + 1}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <label className={styles.upload}>
          {preview ? (
            <img src={preview} alt="Vista previa de la imagen" />
          ) : (
            <Upload size={27} />
          )}
          <strong>Sube tu imagen</strong>
          <small>PNG, JPG o WEBP · Hasta 2 MB</small>
          <input
            type="file"
            aria-label="Imagen de la unidad"
            accept="image/png,image/jpeg,image/webp"
            disabled={busy}
            onChange={(event) => {
              setError("");
              setFile(null);
              const chosen = event.target.files?.[0];
              if (!chosen) return;
              if (
                !["image/png", "image/jpeg", "image/webp"].includes(
                  chosen.type,
                ) ||
                chosen.size > 2 * 1024 * 1024
              ) {
                setError(
                  "Selecciona una imagen PNG, JPG o WEBP de hasta 2 MB.",
                );
                event.target.value = "";
                return;
              }
              setFile(chosen);
            }}
          />
        </label>
      )}
      <div className={styles.pending}>
        <Search size={14} />
        <span>
          Búsqueda en línea<small>Próximamente</small>
        </span>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          disabled={busy || !request.imageUrl}
          onClick={() => void apply(true)}
        >
          Quitar imagen
        </button>
        <button
          type="button"
          className={styles.save}
          disabled={busy || (!file && selected === request.imageUrl)}
          onClick={() => void apply()}
        >
          {busy ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Check size={14} />
          )}{" "}
          {busy ? "Guardando…" : "Aplicar imagen"}
        </button>
      </div>
      <small className={styles.caption}>
        Las imágenes propias se optimizan y permanecen privadas mientras el
        hipertexto sea un borrador.
      </small>
    </div>
  );
}
