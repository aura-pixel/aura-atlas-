"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  FileUp,
  Link2,
  LoaderCircle,
  Plus,
  Video,
  X,
  AlertCircle,
} from "lucide-react";
import { get, post, patch, del } from "@/lib/api";
import type { ContentUnit } from "../subject/types";
import styles from "./material-workspace.module.css";
type Kind = "FILE" | "VIDEO" | "LINK";
type Status = "QUEUED" | "UPLOADING" | "PENDING" | "SAVING" | "SAVED" | "ERROR";
type Upload = {
  uploadId: string;
  name: string;
  mimeType: string;
  size: number;
  confidence?: string;
  extractionError?: string;
  suggestedTopic?: { number: string; title: string } | null;
};
type Resource = {
  key: string;
  materialId?: string;
  uploadId?: string;
  name: string;
  kind: Kind;
  size: number;
  mimeType?: string;
  url?: string;
  topicNumber: string;
  status: Status;
  file?: File;
  error?: string;
  suggestedTopic?: { number: string; title: string } | null;
};
type Remote = {
  id: string;
  uploadId?: string;
  name: string;
  kind: Kind;
  mimeType?: string;
  size: number;
  url?: string;
  topicNumber: string | null;
  status: "SAVED" | "PENDING";
  suggestedTopic?: { number: string; title: string } | null;
};
const kinds = [
  {
    id: "FILE" as const,
    label: "Archivos",
    description: "PDF, documentos, imágenes, audio y video.",
    icon: FileUp,
  },
  {
    id: "VIDEO" as const,
    label: "Videos",
    description: "Videos de YouTube u otras plataformas.",
    icon: Video,
  },
  {
    id: "LINK" as const,
    label: "Enlaces",
    description: "Lecturas, sitios y recursos de la web.",
    icon: Link2,
  },
];
export function ContentWizard({
  subjectId,
  initialStructure,
  storageKey,
  onBusyChange,
  onDirtyChange,
  onGoToHypertext,
  onReload,
}: {
  subjectId: string;
  initialStructure?: unknown;
  storageKey?: string;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onGoToHypertext: () => void;
  onReload: () => void;
}) {
  const units = (initialStructure as { units?: ContentUnit[] })?.units ?? [];
  const topics = units.flatMap((u) => u.topics);
  const [rows, setRows] = useState<Resource[]>([]);
  const rowsRef = useRef<Resource[]>([]);
  const [selected, setSelected] = useState<Kind[]>([]);
  const selectedRef = useRef<Kind[]>([]);
  const [active, setActive] = useState<Kind>("FILE");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [extra, setExtra] = useState(false);
  const [started, setStarted] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [externalBusy, setExternalBusy] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const jobs = useRef<Resource[]>([]);
  const processing = useRef(false);
  const mounted = useRef(true);
  const preferenceKey = `atlas-materials:${storageKey ?? subjectId}`;
  function update(fn: (current: Resource[]) => Resource[]) {
    if (!mounted.current) return;
    const next = fn(rowsRef.current);
    rowsRef.current = next;
    setRows(next);
  }
  function change(key: string, data: Partial<Resource>) {
    update((current) =>
      current.map((r) => (r.key === key ? { ...r, ...data } : r)),
    );
  }
  function choose(next: Kind[]) {
    selectedRef.current = next;
    setSelected(next);
    try {
      sessionStorage.setItem(preferenceKey, JSON.stringify(next));
    } catch {}
  }
  useEffect(() => {
    mounted.current = true;
    let alive = true;
    setLoading(true);
    get<{ resources: Remote[] }>(`/materials/workspace/${subjectId}`)
      .then((data) => {
        if (!alive) return;
        const restored: Resource[] = data.resources.map((r) => ({
          ...r,
          key: r.id,
          materialId: r.status === "SAVED" ? r.id : undefined,
          topicNumber: r.topicNumber ?? "",
        }));
        update(() => restored);
        let preferences: Kind[] = [];
        try {
          const saved = JSON.parse(
            sessionStorage.getItem(preferenceKey) ?? "[]",
          );
          if (Array.isArray(saved))
            preferences = saved.filter((k) =>
              ["FILE", "VIDEO", "LINK"].includes(k),
            );
        } catch {}
        const next = [
          ...new Set([...preferences, ...restored.map((r) => r.kind)]),
        ];
        choose(next);
        setActive(next[0] ?? "FILE");
        setStarted(restored.length > 0);
      })
      .catch((e) => {
        if (alive)
          setLoadError(
            e instanceof Error ? e.message : "No pudimos cargar el material.",
          );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
      mounted.current = false;
    };
  }, [subjectId, preferenceKey]);
  const busy =
    externalBusy ||
    rows.some((r) => ["QUEUED", "UPLOADING", "SAVING"].includes(r.status));
  const dirty =
    rows.some((r) => r.status !== "SAVED") || !!name.trim() || !!url.trim();
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => onDirtyChange?.(false);
  }, [dirty, onDirtyChange]);
  function selectKind(kind: Kind) {
    const firstSelection = selectedRef.current.length === 0;
    if (!selectedRef.current.includes(kind))
      choose([...selectedRef.current, kind]);
    if (started || firstSelection) setActive(kind);
    setFilter("ALL");
    setExtra(false);
    setError("");
    setNotice("");
  }
  function toggle(kind: Kind) {
    if (
      selectedRef.current.includes(kind) &&
      !rowsRef.current.some((r) => r.kind === kind)
    ) {
      const next = selectedRef.current.filter((k) => k !== kind);
      choose(next);
      if (active === kind) setActive(next[0] ?? "FILE");
    } else selectKind(kind);
  }
  function advance(kind: Kind) {
    const current = rowsRef.current;
    if (current.some((r) => r.kind === kind && r.status !== "SAVED")) return;
    const next = selectedRef.current.find(
      (k) =>
        k !== kind &&
        !current.some((r) => r.kind === k && r.status === "SAVED"),
    );
    if (next) {
      setActive(next);
      setFilter("ALL");
      setNotice(
        `Material guardado. Ahora puedes añadir ${kinds.find((k) => k.id === next)!.label.toLowerCase()}.`,
      );
    }
  }
  function occupied(number: string, key: string) {
    return rowsRef.current.some(
      (r) =>
        r.key !== key &&
        r.kind === "FILE" &&
        r.status === "SAVED" &&
        r.topicNumber === number,
    );
  }
  async function assign(row: Resource, number: string) {
    if (!number || !topics.some((t) => t.number === number)) return;
    if (row.kind === "FILE" && occupied(number, row.key)) {
      change(row.key, {
        error: "Este tema ya tiene un archivo. Elige otro tema.",
      });
      return;
    }
    change(row.key, {
      status: "SAVING",
      topicNumber: number,
      error: undefined,
    });
    try {
      if (row.materialId) {
        await patch(`/materials/${row.materialId}/topic`, {
          topicNumber: number,
        });
        change(row.key, { status: "SAVED" });
      } else {
        const result = await post<{ materials: { id: string }[] }>(
          `/materials/save/${subjectId}`,
          {
            files: [
              {
                uploadId: row.uploadId,
                name: row.name,
                mimeType: row.mimeType,
                size: row.size,
                topicNumber: number,
                type:
                  row.mimeType === "application/pdf"
                    ? "PDF"
                    : row.mimeType?.startsWith("image/")
                      ? "IMAGE"
                      : "OTHER",
              },
            ],
          },
        );
        change(row.key, {
          status: "SAVED",
          materialId: result.materials[0]?.id,
          file: undefined,
        });
      }
      setEditing(null);
      if (!processing.current) onReload();
      advance(row.kind);
    } catch (e) {
      change(row.key, {
        status: row.materialId ? "SAVED" : "PENDING",
        error:
          e instanceof Error
            ? e.message
            : "No pudimos guardar la asignación. Vuelve a elegir el tema.",
      });
    }
  }
  async function runQueue() {
    if (processing.current) return;
    processing.current = true;
    while (jobs.current.length && mounted.current) {
      const row = jobs.current.shift()!;
      if (!rowsRef.current.some((r) => r.key === row.key)) continue;
      change(row.key, { status: "UPLOADING", error: undefined });
      try {
        const form = new FormData();
        form.append("files", row.file!);
        const response = await post<{ files: Upload[] }>(
          `/materials/upload/${subjectId}`,
          form,
        );
        const uploaded = response.files[0];
        if (!uploaded)
          throw Error("El archivo no pudo procesarse. Inténtalo de nuevo.");
        const pending: Resource = {
          ...row,
          ...uploaded,
          status: "PENDING",
          topicNumber: "",
          error: uploaded.extractionError,
        };
        change(row.key, pending);
        if (
          uploaded.confidence === "HIGH" &&
          uploaded.suggestedTopic &&
          !occupied(uploaded.suggestedTopic.number, row.key)
        ) {
          await assign(pending, uploaded.suggestedTopic.number);
        }
      } catch (e) {
        change(row.key, {
          status: "ERROR",
          error:
            e instanceof Error
              ? e.message
              : "No pudimos subir este archivo. Puedes reintentarlo.",
        });
      }
    }
    processing.current = false;
    if (mounted.current) {
      advance("FILE");
      onReload();
    }
  }
  function addFiles(files: File[]) {
    setError("");
    if (
      rowsRef.current.filter((r) => r.kind === "FILE").length + files.length >
      topics.length
    ) {
      setError(
        `Tu programa tiene ${topics.length} temas. Puedes añadir hasta ${topics.length} archivos en total, uno por tema.`,
      );
      return;
    }
    const allowed =
      /\.(pdf|docx|pptx|xlsx|jpe?g|png|webp|mp3|wav|ogg|mp4|webm)$/i;
    if (files.some((f) => f.size > 20 * 1024 * 1024 || !allowed.test(f.name))) {
      setError(
        "Usa formatos compatibles y archivos de hasta 20 MB. Divide los documentos grandes por tema.",
      );
      return;
    }
    const additions: Resource[] = files.map((file) => ({
      key: crypto.randomUUID(),
      name: file.name,
      kind: "FILE",
      size: file.size,
      topicNumber: "",
      status: "QUEUED",
      file,
    }));
    update((current) => [...current, ...additions]);
    jobs.current.push(...additions);
    setStarted(true);
    void runQueue();
  }
  async function remove(row: Resource) {
    if (row.uploadId) {
      change(row.key, { status: "SAVING" });
      try {
        await del(`/materials/pending/${row.uploadId}`);
      } catch (e) {
        change(row.key, {
          status: "PENDING",
          error:
            e instanceof Error ? e.message : "No pudimos descartar la carga.",
        });
        return;
      }
    }
    jobs.current = jobs.current.filter((r) => r.key !== row.key);
    update((current) => current.filter((r) => r.key !== row.key));
  }
  async function addExternal(event: FormEvent) {
    event.preventDefault();
    if (externalBusy || active === "FILE") return;
    setError("");
    let address: URL;
    try {
      address = new URL(url);
      if (
        !["http:", "https:"].includes(address.protocol) ||
        address.username ||
        address.password
      )
        throw Error();
    } catch {
      setError("Usa una dirección http o https válida.");
      return;
    }
    if (!name.trim() || !topic) return;
    setExternalBusy(true);
    try {
      const result = await post<{ materials: { id: string }[] }>(
        `/materials/save/${subjectId}`,
        {
          files: [
            {
              name: name.trim(),
              url: address.href,
              size: 0,
              mimeType: active === "VIDEO" ? "video/external" : "text/uri-list",
              type: active,
              topicNumber: topic,
            },
          ],
        },
      );
      update((current) =>
        current.some((row) => row.materialId === result.materials[0].id)
          ? current
          : [
              ...current,
              {
                key: result.materials[0].id,
                materialId: result.materials[0].id,
                name: name.trim(),
                kind: active,
                url: address.href,
                size: 0,
                topicNumber: topic,
                status: "SAVED",
              },
            ],
      );
      setName("");
      setUrl("");
      setStarted(true);
      onReload();
      setNotice(`${active === "VIDEO" ? "Video" : "Enlace"} guardado.`);
      advance(active);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos guardar el recurso. Tus datos se conservan para reintentar.",
      );
    } finally {
      setExternalBusy(false);
    }
  }
  function options(row?: Resource) {
    return (
      <>
        <option value="">Elige un tema</option>
        {topics.map((t) => (
          <option
            key={t.number}
            value={t.number}
            disabled={row?.kind === "FILE" && occupied(t.number, row.key)}
          >
            {t.number} · {t.title}
            {row?.kind === "FILE" && occupied(t.number, row.key)
              ? " (con archivo)"
              : ""}
          </option>
        ))}
      </>
    );
  }
  const saved = rows.filter((r) => r.status === "SAVED");
  const pending = rows.filter((r) => r.status !== "SAVED");
  const covered = new Set(saved.map((r) => r.topicNumber)).size;
  const selectedReady =
    selected.length > 0 &&
    selected.every((k) => saved.some((r) => r.kind === k));
  const ready = selectedReady && !pending.length && !busy && saved.length > 0;
  const filesCount = rows.filter((r) => r.kind === "FILE").length;
  const visible = rows.filter(
    (r) =>
      r.kind === active &&
      (filter === "ALL" ||
        (filter === "SAVED" ? r.status === "SAVED" : r.status !== "SAVED")),
  );
  if (loading)
    return (
      <div className={styles.loading} role="status">
        <LoaderCircle className="animate-spin" size={24} /> Preparando tu
        biblioteca de materiales…
      </div>
    );
  if (loadError)
    return (
      <div className={styles.error} role="alert">
        {loadError}
        <button type="button" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  return (
    <section className={styles.workspace}>
      <header className={styles.intro}>
        <span className={styles.kicker}>
          <CheckCircle2 size={13} /> Programa confirmado · Objetivos y temas
          conservados
        </span>
        <h2>
          {selected.length ? (
            <>
              Dale vida a <em>tu materia.</em>
            </>
          ) : (
            <>
              ¿Con qué vas <em>a enseñar?</em>
            </>
          )}
        </h2>
        <p>
          {selected.length
            ? "Añade tus recursos. Los archivos se procesan y se guardan al quedar asignados; tú sólo revisas lo que necesita atención."
            : "Elige uno, dos o los tres tipos de material. Tu espacio se prepara al seleccionarlos, sin pasos intermedios."}
        </p>
      </header>
      {(!started || extra) && (
        <div className={styles.choices} aria-label="Tipos de material">
          {kinds
            .filter((k) => !started || !selected.includes(k.id))
            .map((k) => (
              <label
                key={k.id}
                className={styles.choice}
                data-selected={selected.includes(k.id)}
              >
                <input
                  aria-label={k.label}
                  type="checkbox"
                  checked={selected.includes(k.id)}
                  disabled={busy}
                  onChange={() => toggle(k.id)}
                />
                <k.icon size={26} strokeWidth={1.3} />
                <strong>{k.label}</strong>
                <span>{k.description}</span>
                <small>
                  {selected.includes(k.id) ? "Seleccionado" : "Elegir"}
                  <Check size={13} />
                </small>
              </label>
            ))}
        </div>
      )}
      {selected.length > 0 && (
        <>
          <div className={styles.toolbar}>
            <div className={styles.tabs} aria-label="Material seleccionado">
              {selected.map((kind) => (
                <button
                  type="button"
                  key={kind}
                  aria-pressed={active === kind}
                  disabled={busy}
                  onClick={() => {
                    setActive(kind);
                    setFilter("ALL");
                    setError("");
                  }}
                >
                  {kinds.find((k) => k.id === kind)!.label}
                  <span>{rows.filter((r) => r.kind === kind).length}</span>
                </button>
              ))}
            </div>
            {started &&
              selected.some(
                (kind) => !rows.some((row) => row.kind === kind),
              ) && (
                <div className={styles.optionalTypes}>
                  {selected
                    .filter((kind) => !rows.some((row) => row.kind === kind))
                    .map((kind) => (
                      <button
                        key={kind}
                        type="button"
                        disabled={busy}
                        onClick={() => toggle(kind)}
                      >
                        No usar{" "}
                        {kinds.find((k) => k.id === kind)!.label.toLowerCase()}{" "}
                        <X size={11} />
                      </button>
                    ))}
                </div>
              )}
            {started && selected.length < 3 && (
              <button
                type="button"
                className={styles.extra}
                aria-expanded={extra}
                disabled={busy}
                onClick={() => setExtra(!extra)}
              >
                <Plus size={14} /> Agregar material extra
              </button>
            )}
          </div>
          {notice && (
            <p className={styles.notice} role="status">
              {notice}
            </p>
          )}
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <div className={styles.workArea}>
            <div className={styles.mainPanel}>
              {active === "FILE" ? (
                <>
                  <div className={styles.panelHeading}>
                    <div>
                      <h3>Tus archivos</h3>
                      <p>
                        {filesCount} de {topics.length} archivos · Uno por tema
                      </p>
                    </div>
                    <span className={styles.counter}>
                      {filesCount}/{topics.length}
                    </span>
                  </div>
                  <label
                    className={styles.dropzone}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!busy && filesCount < topics.length)
                        addFiles(Array.from(e.dataTransfer.files));
                    }}
                  >
                    <FileUp size={32} strokeWidth={1.3} />
                    <strong>Arrastra tus archivos o selecciónalos</strong>
                    <span>
                      Se procesan uno a uno. Puedes elegir todos los que falten.
                    </span>
                    <input
                      aria-label="Seleccionar archivos"
                      type="file"
                      multiple
                      accept=".pdf,.docx,.pptx,.xlsx,.jpg,.jpeg,.png,.webp,.mp3,.wav,.ogg,.mp4,.webm"
                      disabled={busy || filesCount >= topics.length}
                      onChange={(e) => {
                        addFiles(Array.from(e.target.files ?? []));
                        e.target.value = "";
                      }}
                    />
                  </label>
                  <details className={styles.tips}>
                    <summary>Cómo mejorar la asignación automática</summary>
                    <ul>
                      <li>
                        Un archivo por tema, con un nombre claro:{" "}
                        <strong>1.1 Fundamentos.pdf</strong>.
                      </li>
                      <li>
                        Usa PDF con texto seleccionable; evita documentos
                        escaneados y archivos que mezclen muchos temas.
                      </li>
                      <li>
                        Comprime imágenes y divide documentos grandes. Máximo 20
                        MB por archivo; cuota total de 500 MB por cuenta.
                      </li>
                      <li>
                        Las imágenes, audios y documentos sin texto legible
                        pueden requerir asignación manual.
                      </li>
                    </ul>
                  </details>
                </>
              ) : (
                <>
                  <div className={styles.panelHeading}>
                    <div>
                      <h3>
                        {active === "VIDEO"
                          ? "Añade un video"
                          : "Añade un enlace"}
                      </h3>
                      <p>Guarda su dirección y elige dónde se utilizará.</p>
                    </div>
                    {active === "VIDEO" ? (
                      <Video size={22} />
                    ) : (
                      <Link2 size={22} />
                    )}
                  </div>
                  <form className={styles.externalForm} onSubmit={addExternal}>
                    <label>
                      Título
                      <input
                        required
                        maxLength={250}
                        disabled={externalBusy}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={
                          active === "VIDEO"
                            ? "Ej. Introducción al aprendizaje"
                            : "Ej. Lectura complementaria"
                        }
                      />
                    </label>
                    <label>
                      {active === "VIDEO"
                        ? "Dirección del video"
                        : "Dirección del enlace"}
                      <input
                        type="url"
                        required
                        maxLength={2000}
                        disabled={externalBusy}
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://…"
                      />
                    </label>
                    <div>
                      <label htmlFor="new-resource-topic">Tema</label>
                      <select
                        id="new-resource-topic"
                        required
                        disabled={externalBusy}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      >
                        {options()}
                      </select>
                    </div>
                    <button
                      className={styles.primary}
                      disabled={externalBusy}
                      type="submit"
                    >
                      {externalBusy ? (
                        <>
                          <LoaderCircle size={15} className="animate-spin" />{" "}
                          Guardando…
                        </>
                      ) : (
                        <>
                          <Plus size={15} />
                          {active === "VIDEO"
                            ? "Añadir video"
                            : "Añadir enlace"}
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
              <div className={styles.listHeader}>
                <h4>
                  {active === "FILE"
                    ? "Estado de tus archivos"
                    : "Recursos guardados"}
                </h4>
                {active === "FILE" && rows.some((r) => r.kind === "FILE") && (
                  <select
                    aria-label="Filtrar archivos"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="ALL">Todos</option>
                    <option value="PENDING">Por revisar</option>
                    <option value="SAVED">Asignados</option>
                  </select>
                )}
              </div>
              {visible.length === 0 ? (
                <div className={styles.empty}>
                  <BookOpen size={27} strokeWidth={1.2} />
                  <p>
                    {filter !== "ALL"
                      ? "No hay archivos en este estado."
                      : active === "FILE"
                        ? "Aquí verás cada archivo y el estado de su asignación."
                        : "Los recursos que añadas aparecerán aquí."}
                  </p>
                </div>
              ) : (
                <div className={styles.resourceList}>
                  {visible.map((row) => {
                    const saving = ["UPLOADING", "QUEUED", "SAVING"].includes(
                      row.status,
                    );
                    const assigned = row.status === "SAVED";
                    return (
                      <article className={styles.resource} key={row.key}>
                        <span className={styles.fileIcon}>
                          {saving ? (
                            <LoaderCircle size={19} className="animate-spin" />
                          ) : assigned ? (
                            <CheckCircle2 size={20} />
                          ) : (
                            <AlertCircle size={20} />
                          )}
                        </span>
                        <div className={styles.resourceBody}>
                          <strong>{row.name}</strong>
                          <span className={styles.status} data-saved={assigned}>
                            {row.status === "QUEUED"
                              ? "En cola"
                              : row.status === "UPLOADING"
                                ? "Leyendo y buscando su tema…"
                                : row.status === "SAVING"
                                  ? "Guardando…"
                                  : assigned
                                    ? `Asignado al tema ${row.topicNumber}`
                                    : row.status === "ERROR"
                                      ? "No se pudo cargar"
                                      : "Necesita un tema"}
                          </span>
                          {row.error && (
                            <p className={styles.rowError}>{row.error}</p>
                          )}
                          {row.suggestedTopic && !assigned && !saving && (
                            <p className={styles.suggestion}>
                              Sugerencia: {row.suggestedTopic.number} ·{" "}
                              {row.suggestedTopic.title}
                            </p>
                          )}
                          {((!assigned && row.uploadId) ||
                            editing === row.key) &&
                            !saving && (
                              <div className={styles.assignment}>
                                <label htmlFor={`assignment-${row.key}`}>
                                  Asignar tema a {row.name}
                                </label>
                                <select
                                  id={`assignment-${row.key}`}
                                  value={assigned ? row.topicNumber : ""}
                                  onChange={(e) =>
                                    void assign(row, e.target.value)
                                  }
                                >
                                  {options(row)}
                                </select>
                                <small>Se guarda al elegir el tema.</small>
                              </div>
                            )}
                        </div>
                        <div className={styles.rowActions}>
                          {assigned && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditing(editing === row.key ? null : row.key)
                              }
                              aria-expanded={editing === row.key}
                            >
                              Cambiar tema
                            </button>
                          )}
                          {row.status === "ERROR" && row.file && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => {
                                change(row.key, {
                                  status: "QUEUED",
                                  error: undefined,
                                });
                                jobs.current.push(row);
                                void runQueue();
                              }}
                            >
                              Reintentar
                            </button>
                          )}
                          {!assigned && !saving && (
                            <button
                              type="button"
                              aria-label={`Quitar ${row.name}`}
                              onClick={() => void remove(row)}
                            >
                              <X size={15} />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
            <aside className={styles.summary}>
              <span className={styles.kicker}>TU BIBLIOTECA</span>
              <div className={styles.summaryArt}>
                <BookOpen size={42} strokeWidth={1.1} />
              </div>
              <h3>{ready ? "Tu material está listo" : "Cada recurso suma."}</h3>
              <p>
                {ready
                  ? "Ya puedes crear y dar forma al hipertexto de tu materia."
                  : "Tu material se conserva al quedar asignado. Puedes volver y enriquecerlo después."}
              </p>
              <dl>
                <div>
                  <dt>Recursos guardados</dt>
                  <dd>{saved.length}</dd>
                </div>
                <div>
                  <dt>Por revisar o cargar</dt>
                  <dd>{pending.length}</dd>
                </div>
                <div>
                  <dt>Temas con material</dt>
                  <dd>
                    {covered}/{topics.length}
                  </dd>
                </div>
              </dl>
              {rows.some((row) => row.uploadId && row.status !== "SAVED") && (
                <p className={styles.hint}>
                  Asigna los archivos pendientes antes de una hora para
                  conservarlos.
                </p>
              )}
              {!selectedReady && (
                <p className={styles.hint}>
                  Añade al menos un recurso de cada tipo que elegiste, o
                  desmarca el tipo que no usarás.
                </p>
              )}
              <button
                className={styles.primary}
                type="button"
                disabled={!ready || dirty}
                onClick={() => {
                  onReload();
                  onGoToHypertext();
                }}
              >
                Crear y diseñar hipertexto <ArrowRight size={15} />
              </button>
              <small>Puedes seguir añadiendo material después.</small>
            </aside>
          </div>
        </>
      )}
    </section>
  );
}
