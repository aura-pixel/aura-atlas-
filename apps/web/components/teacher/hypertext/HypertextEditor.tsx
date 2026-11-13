"use client";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  ImageIcon,
  LoaderCircle,
  Menu,
  Moon,
  Palette as PaletteIcon,
  PanelLeftClose,
  Save,
  Share2,
  Sun,
  Type,
  X,
} from "lucide-react";
import { patch, post } from "@/lib/api";
import type { HypertextRendererProps } from "./HypertextRenderer";
import {
  COVER_OPTIONS,
  FONT_OPTIONS,
  ILLUSTRATED_COVERS,
  PALETTES,
  type Theme,
} from "./editor-options";
import styles from "./hypertext-editor.module.css";
import {
  UnitImageEditorContext,
  type UnitImageRequest,
} from "./unit-image-editor-context";
const UnitImagePicker = dynamic(() =>
  import("./UnitImagePicker").then((module) => module.UnitImagePicker),
);
export type EditorHypertext = HypertextRendererProps["hypertext"] & {
  isPublished: boolean;
  publicUrl?: string | null;
  subject: HypertextRendererProps["hypertext"]["subject"] & { id: string };
};
type Settings = {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  theme: Theme;
  coverImageUrl: string | null;
};
const Renderer = dynamic(
  () =>
    import("./HypertextRenderer").then((module) => module.HypertextRenderer),
  {
    ssr: false,
    loading: () => (
      <div className={styles.previewLoading} role="status">
        <LoaderCircle size={22} className="animate-spin" /> Preparando la vista
        previa…
      </div>
    ),
  },
);
const Preview = memo(function Preview({
  hypertext,
}: {
  hypertext: EditorHypertext;
}) {
  return (
    <Renderer
      hypertext={hypertext}
      mode="editor"
      scrollContainerId="hypertext-preview-scroll"
    />
  );
});
const sections = [
  {
    id: "cover",
    label: "Portada",
    hint: "La primera impresión",
    icon: ImageIcon,
  },
  { id: "font", label: "Tipografía", hint: "Tu estilo de lectura", icon: Type },
  {
    id: "colors",
    label: "Colores",
    hint: "La identidad de tu materia",
    icon: PaletteIcon,
  },
  { id: "theme", label: "Apariencia", hint: "Modo claro u oscuro", icon: Sun },
  {
    id: "publish",
    label: "Publicar y compartir",
    hint: "Un enlace para tus estudiantes",
    icon: Share2,
  },
] as const;
type Section = (typeof sections)[number]["id"] | "unit-image";
export function HypertextEditor({ hypertext }: { hypertext: EditorHypertext }) {
  const router = useRouter();
  const [settings, setSettings] = useState<Settings>({
    primaryColor: hypertext.primaryColor || "#7D5DFF",
    secondaryColor: hypertext.secondaryColor || "#5EE1E6",
    fontFamily: hypertext.fontFamily || "Montserrat",
    theme: hypertext.theme || "LIGHT",
    coverImageUrl: hypertext.coverImageUrl || null,
  });
  const [saved, setSaved] = useState(settings);
  const [section, setSection] = useState<Section>("cover");
  const [tools, setTools] = useState(true);
  const [imageRequest, setImageRequest] = useState<UnitImageRequest | null>(
    null,
  );
  const [imageBusy, setImageBusy] = useState(false);
  const saveUnitImage = useRef<(() => Promise<boolean>) | null>(null);
  const switchingImage = useRef(false);
  const registerImageSave = useCallback(
    (save: (() => Promise<boolean>) | null) => {
      saveUnitImage.current = save;
    },
    [],
  );
  const openUnitImage = useCallback(async (request: UnitImageRequest) => {
    if (switchingImage.current) return;
    switchingImage.current = true;
    try {
      if (saveUnitImage.current && !(await saveUnitImage.current())) return;
      setImageRequest(request);
      setSection("unit-image");
      setTools(true);
      setPanelOpen(true);
    } finally {
      switchingImage.current = false;
    }
  }, []);
  const [panelOpen, setPanelOpen] = useState(false);
  const navigation = useRef<HTMLElement>(null);
  const controls = useRef<HTMLElement>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(hypertext.isPublished);
  const [publicUrl, setPublicUrl] = useState(hypertext.publicUrl ?? null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const busy = saving || publishing || imageBusy;
  const dirty = Object.keys(settings).some(
    (key) => settings[key as keyof Settings] !== saved[key as keyof Settings],
  );
  const preview = useMemo(
    () => ({ ...hypertext, ...settings }),
    [hypertext, settings],
  );
  const deferredPreview = useDeferredValue(preview);
  const active =
    section === "unit-image"
      ? { label: "Imagen de la unidad" }
      : sections.find((item) => item.id === section)!;
  useEffect(() => {
    controls.current?.scrollTo({ top: 0 });
    if (panelOpen)
      controls.current
        ?.querySelector<HTMLElement>("h2")
        ?.focus({ preventScroll: true });
  }, [section, panelOpen, tools]);
  function closePanel() {
    if (imageBusy) return;
    setPanelOpen(false);
    navigation.current
      ?.querySelector<HTMLButtonElement>(`[data-section="${section}"]`)
      ?.focus();
  }
  useEffect(() => {
    if (!panelOpen || !tools) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
      }
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [panelOpen, section, tools, imageBusy]);
  useEffect(() => {
    if (!dirty && !imageBusy) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, imageBusy]);
  function update(next: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...next }));
    setNotice("");
    setError("");
  }
  async function save() {
    if (!dirty) return true;
    setSaving(true);
    setError("");
    setNotice("");
    const changes = Object.fromEntries(
      Object.entries(settings).filter(
        ([key, value]) => value !== saved[key as keyof Settings],
      ),
    );
    try {
      await patch(`/hypertexts/${hypertext.id}/configuration`, changes);
      setSaved(settings);
      setNotice("Cambios guardados.");
      return true;
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos guardar los cambios. Vuelve a intentarlo.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  }
  async function publish() {
    if (busy) return;
    setPublishing(true);
    setError("");
    try {
      if (!(await save())) return;
      const result = await post<{ publicUrl: string }>(
        `/hypertexts/${hypertext.id}/publish`,
        {},
      );
      setPublished(true);
      setPublicUrl(result.publicUrl);
      setNotice("Tu hipertexto está publicado. Ya puedes compartir su enlace.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos publicar el hipertexto.",
      );
    } finally {
      setPublishing(false);
    }
  }
  async function copy() {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(
        new URL(publicUrl, window.location.origin).href,
      );
      setCopied(true);
      setNotice("Enlace copiado.");
    } catch {
      setError("Selecciona el enlace para copiarlo manualmente.");
    }
  }
  function leave(event: React.MouseEvent<HTMLAnchorElement>) {
    if (
      busy ||
      (dirty &&
        !window.confirm(
          "Tienes cambios sin guardar. ¿Quieres salir del editor?",
        ))
    ) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    router.push(`/teacher/subjects/${hypertext.subject.id}?tab=hipertexto`);
  }
  return (
    <UnitImageEditorContext.Provider value={openUnitImage}>
      <div className={styles.editor}>
        <header className={styles.header}>
          <Link
            href={`/teacher/subjects/${hypertext.subject.id}?tab=hipertexto`}
            onClick={leave}
            className={styles.back}
          >
            <ArrowLeft size={16} />
            <span>Mi materia</span>
          </Link>
          <div className={styles.identity}>
            <span>EDITOR DE HIPERTEXTO</span>
            <h1>{hypertext.subject.name}</h1>
          </div>
          <span className={styles.saveState} role="status">
            {saving
              ? "Guardando…"
              : dirty
                ? "Cambios sin guardar"
                : "Todo guardado"}
          </span>
          <button
            type="button"
            className={styles.save}
            disabled={!dirty || busy}
            onClick={() => void save()}
          >
            {saving ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            <span>Guardar cambios</span>
          </button>
        </header>
        {(error || notice) && (
          <div
            className={error ? styles.error : styles.notice}
            role={error ? "alert" : "status"}
          >
            {error || notice}
          </div>
        )}
        <div
          className={styles.workspace}
          data-tools={tools}
          data-panel={panelOpen}
        >
          {tools && (
            <aside
              className={styles.sidebar}
              aria-label="Herramientas de personalización"
            >
              <div className={styles.sideTitle}>
                <BookOpen size={17} />
                <span>Diseño</span>
              </div>
              <nav
                ref={navigation}
                className={styles.navigation}
                aria-label="Secciones del editor"
              >
                {sections.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    data-section={item.id}
                    aria-label={item.label}
                    title={item.hint}
                    aria-pressed={panelOpen && section === item.id}
                    aria-expanded={panelOpen && section === item.id}
                    aria-controls="editor-tool-panel"
                    onClick={() => {
                      if (imageBusy) return;
                      if (panelOpen && section === item.id) closePanel();
                      else {
                        setSection(item.id);
                        setPanelOpen(true);
                      }
                    }}
                  >
                    <item.icon size={18} strokeWidth={1.6} />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.hint}</small>
                    </span>
                  </button>
                ))}
              </nav>
              {panelOpen && (
                <section
                  ref={controls}
                  id="editor-tool-panel"
                  role="dialog"
                  aria-modal="false"
                  className={styles.controls}
                  aria-labelledby="editor-section-title"
                >
                  <div className={styles.panelHeader}>
                    <span className={styles.eyebrow}>HAZLO TUYO</span>
                    <button
                      type="button"
                      aria-label="Cerrar panel"
                      disabled={imageBusy}
                      onClick={closePanel}
                    >
                      <X size={17} />
                    </button>
                  </div>
                  <h2 id="editor-section-title" tabIndex={-1}>
                    {active.label}
                  </h2>
                  {section === "unit-image" && imageRequest && (
                    <UnitImagePicker
                      key={imageRequest.unitId}
                      request={imageRequest}
                      onBusyChange={setImageBusy}
                      registerSave={registerImageSave}
                      onClose={() => {
                        setPanelOpen(false);
                        setImageRequest(null);
                      }}
                    />
                  )}
                  {section === "cover" && (
                    <>
                      <p>
                        Elige una portada. El cambio se muestra al instante.
                      </p>
                      <fieldset disabled={busy}>
                        <legend>Portadas minimalistas</legend>
                        <div className={styles.coverGrid}>
                          {COVER_OPTIONS.map((cover) => {
                            const url = `/hypertext/covers/minimal-${cover.id}.svg`;
                            return (
                              <button
                                type="button"
                                key={cover.id}
                                aria-pressed={settings.coverImageUrl === url}
                                aria-label={`Portada ${cover.name}`}
                                onClick={() => update({ coverImageUrl: url })}
                              >
                                <Image
                                  src={url}
                                  width={150}
                                  height={100}
                                  alt=""
                                />
                                <span>{cover.name}</span>
                                {settings.coverImageUrl === url && (
                                  <Check size={13} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                        <h3 className={styles.groupTitle}>
                          Portadas ilustradas
                        </h3>
                        <div className={styles.coverGrid}>
                          {ILLUSTRATED_COVERS.map((url, index) => (
                            <button
                              type="button"
                              key={url}
                              aria-label={`Portada ilustrada ${index + 1}`}
                              aria-pressed={settings.coverImageUrl === url}
                              onClick={() => update({ coverImageUrl: url })}
                            >
                              <Image
                                src={url}
                                width={150}
                                height={100}
                                sizes="(max-width: 720px) 35vw, 130px"
                                alt=""
                              />
                              <span>Ilustración {index + 1}</span>
                              {settings.coverImageUrl === url && (
                                <Check size={13} />
                              )}
                            </button>
                          ))}
                        </div>
                        <button
                          className={styles.textButton}
                          type="button"
                          disabled={!settings.coverImageUrl}
                          onClick={() => update({ coverImageUrl: null })}
                        >
                          Usar portada predeterminada
                        </button>
                      </fieldset>
                    </>
                  )}
                  {section === "font" && (
                    <>
                      <p>Selecciona la tipografía de tu hipertexto.</p>
                      <div className={styles.fonts}>
                        {FONT_OPTIONS.map((font) => (
                          <button
                            type="button"
                            key={font.id}
                            disabled={busy}
                            aria-pressed={settings.fontFamily === font.id}
                            onClick={() => update({ fontFamily: font.id })}
                          >
                            <span style={{ fontFamily: font.id }}>
                              Aa <strong>{font.name}</strong>
                            </span>
                            {settings.fontFamily === font.id && (
                              <Check size={15} />
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {section === "colors" && (
                    <>
                      <p>Prueba una combinación o ajusta cada color.</p>
                      <div className={styles.palettes}>
                        {PALETTES.map((palette) => (
                          <button
                            type="button"
                            key={palette.id}
                            disabled={busy}
                            aria-label={`Paleta ${palette.name}`}
                            aria-pressed={
                              settings.primaryColor === palette.primary &&
                              settings.secondaryColor === palette.secondary
                            }
                            onClick={() =>
                              update({
                                primaryColor: palette.primary,
                                secondaryColor: palette.secondary,
                              })
                            }
                          >
                            <span style={{ background: palette.primary }} />
                            <span style={{ background: palette.secondary }} />
                            <small>{palette.name}</small>
                          </button>
                        ))}
                      </div>
                      <label className={styles.colorField}>
                        Color principal
                        <input
                          type="color"
                          disabled={busy}
                          value={settings.primaryColor}
                          onChange={(event) =>
                            update({ primaryColor: event.target.value })
                          }
                        />
                        <span>{settings.primaryColor.toUpperCase()}</span>
                      </label>
                      <label className={styles.colorField}>
                        Color secundario
                        <input
                          type="color"
                          disabled={busy}
                          value={settings.secondaryColor}
                          onChange={(event) =>
                            update({ secondaryColor: event.target.value })
                          }
                        />
                        <span>{settings.secondaryColor.toUpperCase()}</span>
                      </label>
                    </>
                  )}
                  {section === "theme" && (
                    <>
                      <p>Elige la apariencia de la experiencia de lectura.</p>
                      <div className={styles.themes}>
                        {(
                          [
                            { id: "LIGHT", label: "Claro", icon: Sun },
                            { id: "DARK", label: "Oscuro", icon: Moon },
                          ] as const
                        ).map((item) => (
                          <button
                            type="button"
                            disabled={busy}
                            aria-pressed={settings.theme === item.id}
                            key={item.id}
                            onClick={() => update({ theme: item.id })}
                          >
                            <item.icon size={26} />
                            <strong>{item.label}</strong>
                            {settings.theme === item.id && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {section === "publish" && (
                    <>
                      <p>
                        Publica tu hipertexto y comparte el enlace desde este
                        mismo lugar.
                      </p>
                      <div className={styles.publicState}>
                        <span
                          className={styles.dot}
                          data-published={published}
                        />
                        <strong>
                          {published ? "Publicado" : "Borrador privado"}
                        </strong>
                      </div>
                      {!published ? (
                        <>
                          <p>
                            Cuando publiques, tus estudiantes podrán abrirlo con
                            el enlace.
                          </p>
                          <button
                            type="button"
                            className={styles.primary}
                            disabled={busy}
                            onClick={() => void publish()}
                          >
                            {publishing ? (
                              <LoaderCircle
                                size={15}
                                className="animate-spin"
                              />
                            ) : (
                              <Share2 size={15} />
                            )}{" "}
                            {publishing
                              ? "Publicando…"
                              : dirty
                                ? "Guardar y publicar"
                                : "Publicar hipertexto"}
                          </button>
                        </>
                      ) : (
                        <>
                          {dirty && (
                            <p className={styles.hint}>
                              Guarda los cambios para actualizar la versión
                              publicada.
                            </p>
                          )}
                          {publicUrl ? (
                            <div className={styles.sharing}>
                              <label htmlFor="public-hypertext-url">
                                Enlace para compartir
                              </label>
                              <input
                                id="public-hypertext-url"
                                readOnly
                                value={
                                  typeof window === "undefined"
                                    ? publicUrl
                                    : new URL(publicUrl, window.location.origin)
                                        .href
                                }
                                onFocus={(event) => event.target.select()}
                              />
                              <button
                                type="button"
                                className={styles.primary}
                                onClick={() => void copy()}
                              >
                                {copied ? (
                                  <Check size={14} />
                                ) : (
                                  <Copy size={14} />
                                )}{" "}
                                {copied ? "Enlace copiado" : "Copiar enlace"}
                              </button>
                              <a
                                href={publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Ver versión pública <ExternalLink size={13} />
                              </a>
                            </div>
                          ) : (
                            <p>
                              No hay un enlace público disponible. Puedes seguir
                              editando tu materia.
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}
                </section>
              )}
            </aside>
          )}
          <main className={styles.preview}>
            <div className={styles.previewToolbar}>
              <button
                type="button"
                aria-expanded={tools}
                aria-label={
                  tools ? "Ocultar herramientas" : "Mostrar herramientas"
                }
                onClick={() => {
                  if (imageBusy) return;
                  setTools(!tools);
                  setPanelOpen(false);
                }}
              >
                {tools ? <PanelLeftClose size={16} /> : <Menu size={16} />}
                <span>{tools ? "Ocultar herramientas" : "Personalizar"}</span>
              </button>
              <span>Vista previa interactiva</span>
              <small>
                {preview !== deferredPreview
                  ? "Actualizando…"
                  : "Explora tu hipertexto"}
              </small>
            </div>
            <div id="hypertext-preview-scroll" className={styles.canvas}>
              <Preview hypertext={deferredPreview} />
            </div>
          </main>
        </div>
      </div>
    </UnitImageEditorContext.Provider>
  );
}
