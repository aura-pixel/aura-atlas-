"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  ImagePlus,
  LoaderCircle,
  X,
} from "lucide-react";
import { get, postForm } from "@/lib/api";
import { getSubjectTextColor, SUBJECT_COLORS } from "@/lib/subject-colors";
import { Butterfly } from "@/components/landing/learning-garden";
import { SubjectColorPicker } from "./subject-color-picker";
import styles from "./create-subject-form.module.css";

type AcademicContext = {
  id: string;
  name: string;
  faculty: {
    name: string;
    approvalStatus?: string;
    university: { name: string; approvalStatus?: string };
  };
};
type User = { careers: { career: AcademicContext }[] };
type SubjectImage = { file: File; preview: string };

export function CreateSubjectForm() {
  const router = useRouter();
  const imageInput = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(SUBJECT_COLORS[0].value);
  const [image, setImage] = useState<SubjectImage | null>(null);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const career = user?.careers[0]?.career;
  const imagePreview = image?.preview;
  const colorName =
    SUBJECT_COLORS.find(
      (option) => option.value.toLowerCase() === color.toLowerCase(),
    )?.name || "Personalizado";
  const provisional =
    career &&
    (career.faculty.approvalStatus === "PENDING" ||
      career.faculty.approvalStatus === "REJECTED" ||
      career.faculty.university.approvalStatus === "PENDING" ||
      career.faculty.university.approvalStatus === "REJECTED");

  useEffect(() => {
    let active = true;
    get<User>("/users/me")
      .then((data) => {
        if (active) setUser(data);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  function clearImage() {
    setImage(null);
    setImageError("");
    if (imageInput.current) imageInput.current.value = "";
  }

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageError("");
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setImage(null);
      setImageError("Elige una imagen PNG, JPG o WEBP de hasta 2 MB.");
      event.target.value = "";
      return;
    }
    setImage({ file, preview: URL.createObjectURL(file) });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || !career || !name.trim() || imageError) return;
    setSaving(true);
    setError("");
    const data = new FormData();
    data.append("name", name.trim());
    data.append("careerId", career.id);
    data.append("color", color);
    if (abbreviation.trim()) data.append("abbreviation", abbreviation.trim());
    if (description.trim()) data.append("description", description.trim());
    if (image) data.append("logo", image.file);
    try {
      await postForm("/subjects", data);
      router.push("/teacher/dashboard");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No pudimos crear la materia. Inténtalo de nuevo.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <main className={styles.statePage} role="status">
        <BookOpen size={33} strokeWidth={1.4} />
        <p>Preparando tu materia…</p>
      </main>
    );
  if (loadError)
    return (
      <main className={styles.statePage}>
        <p role="alert">No pudimos cargar tu espacio académico.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={styles.primaryButton}
        >
          Reintentar
        </button>
        <Link href="/teacher/dashboard">Volver a mis materias</Link>
      </main>
    );
  if (!career)
    return (
      <main className={styles.statePage}>
        <GraduationCap size={35} strokeWidth={1.4} />
        <h1>Primero, configura tu espacio académico.</h1>
        <p>Elige tu universidad, facultad y carrera para añadir una materia.</p>
        <Link href="/teacher" className={styles.primaryButton}>
          Configurar mi espacio <ArrowRight size={16} />
        </Link>
      </main>
    );

  return (
    <main className={styles.page}>
      <div className={styles.backgroundShape} aria-hidden="true" />
      <header className={styles.header}>
        <Link href="/teacher/dashboard" className={styles.brand}>
          <Image src="/aura-atlas.png" width={33} height={33} alt="" priority />
          <span>
            Aura Atlas<small>ESPACIO DOCENTE</small>
          </span>
        </Link>
        <Link href="/teacher/dashboard" className={styles.backLink}>
          <ArrowLeft size={14} /> Volver a mis materias
        </Link>
      </header>
      <div className={styles.content}>
        <div className={styles.intro}>
          <h1>
            Crea tu <em>nueva materia.</em>
          </h1>
          <p>Añade sus datos y elige el color con el que la reconocerás.</p>
        </div>
        <div className={styles.context}>
          <GraduationCap size={18} />
          <div>
            <strong>{career.name}</strong>
            <p>
              {career.faculty.name} · {career.faculty.university.name}
            </p>
          </div>
        </div>
        <div className={styles.layout}>
          <form
            onSubmit={handleSubmit}
            className={styles.formPanel}
            aria-busy={saving}
          >
            <fieldset disabled={saving} className={styles.fields}>
              <legend>Datos de la materia</legend>
              <div className={styles.field}>
                <label htmlFor="name">
                  Nombre de la materia <span aria-hidden="true">*</span>
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej. Didáctica y aprendizaje"
                  maxLength={5000}
                  required
                  autoComplete="off"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="abbreviation">
                  Abreviación <span>(opcional)</span>
                </label>
                <input
                  id="abbreviation"
                  value={abbreviation}
                  onChange={(event) => setAbbreviation(event.target.value)}
                  placeholder="Ej. DID"
                  maxLength={20}
                  autoComplete="off"
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="description">
                  Descripción <span>(opcional)</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="¿Qué se explora en esta materia?"
                  maxLength={5000}
                  rows={4}
                />
              </div>
            </fieldset>
            <fieldset className={styles.palette}>
              <legend>Color de la materia</legend>
              <p>Elige uno de los diez tonos pastel o personaliza el tuyo.</p>
              <SubjectColorPicker
                value={color}
                onChange={setColor}
                disabled={saving}
              />
            </fieldset>
            <div className={styles.uploadSection}>
              <label htmlFor="logo">
                Imagen de la materia <span>(opcional)</span>
              </label>
              <div className={styles.uploadBox}>
                <span className={styles.uploadIcon}>
                  {image ? (
                    <Image
                      src={image.preview}
                      width={52}
                      height={52}
                      alt=""
                      unoptimized
                    />
                  ) : (
                    <ImagePlus size={23} strokeWidth={1.5} />
                  )}
                </span>
                <div>
                  <strong>
                    {image ? image.file.name : "Añade una imagen"}
                  </strong>
                  <p>PNG, JPG o WEBP · Hasta 2 MB</p>
                </div>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => imageInput.current?.click()}
                >
                  {image ? "Cambiar" : "Elegir imagen"}
                </button>
              </div>
              <input
                ref={imageInput}
                id="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={saving}
                onChange={selectImage}
                className={styles.fileInput}
                aria-invalid={!!imageError}
                aria-describedby={imageError ? "image-error" : undefined}
              />
              {(image || imageError) && (
                <button
                  type="button"
                  onClick={clearImage}
                  disabled={saving}
                  className={styles.removeImage}
                >
                  <X size={12} /> Quitar imagen
                </button>
              )}
              {imageError && (
                <p role="alert" id="image-error" className={styles.error}>
                  {imageError}
                </p>
              )}
            </div>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <footer className={styles.actions}>
              <Link
                href="/teacher/dashboard"
                onClick={(event) => {
                  if (saving) event.preventDefault();
                }}
                aria-disabled={saving}
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={saving || !name.trim() || !!imageError}
                className={styles.primaryButton}
              >
                {saving ? (
                  <>
                    <LoaderCircle size={16} className={styles.spinner} />{" "}
                    Creando materia…
                  </>
                ) : (
                  <>
                    Crear materia <ArrowUpRight size={16} />
                  </>
                )}
              </button>
            </footer>
          </form>
          <aside
            className={styles.previewPanel}
            aria-label="Vista previa de la materia"
          >
            <h2>Vista previa</h2>
            <div
              className={styles.previewStage}
              style={
                {
                  "--preview-color": color,
                  "--preview-ink": getSubjectTextColor(color),
                } as CSSProperties
              }
            >
              <span className={styles.previewShape} aria-hidden="true" />
              <div className={styles.book}>
                <span className={styles.bookmark} aria-hidden="true" />
                {image ? (
                  <Image
                    src={image.preview}
                    width={85}
                    height={85}
                    alt="Imagen de la materia"
                    unoptimized
                    className={styles.previewImage}
                  />
                ) : (
                  <BookOpen size={36} strokeWidth={1.2} aria-hidden="true" />
                )}
                <h3>{name.trim() || "Tu nueva materia"}</h3>
                {abbreviation.trim() && (
                  <span className={styles.previewAbbreviation}>
                    {abbreviation.trim()}
                  </span>
                )}
              </div>
              <Butterfly className={styles.butterfly} />
            </div>
            <div className={styles.previewInfo}>
              <span className={styles.colorName}>
                <span style={{ backgroundColor: color }} />
                {colorName}
              </span>
              {description.trim() && <p>{description.trim()}</p>}
            </div>
            <p className={styles.sharingNote}>
              {provisional
                ? "Se creará en tu espacio provisional. Estará disponible para otros docentes cuando se apruebe tu espacio académico."
                : "La materia estará disponible para los docentes de tu carrera. Después, cada docente podrá personalizar su propia versión."}
            </p>
          </aside>
        </div>
        <footer className={styles.footer}>Aura Atlas · by Tzalli Studio</footer>
      </div>
    </main>
  );
}
