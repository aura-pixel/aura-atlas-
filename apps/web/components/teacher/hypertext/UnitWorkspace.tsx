"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  ImagePlus,
  Maximize2,
  Minimize2,
  Play,
} from "lucide-react";
import type { AtlasUnit, AtlasTopic, AtlasMaterial } from "./atlas-types";
import { API_URL } from "@/lib/config";
import styles from "./unit-workspace.module.css";

const MaterialViewer = dynamic(
  () => import("./MaterialViewer").then((module) => module.MaterialViewer),
  {
    loading: () => <p role="status">Cargando recurso…</p>,
  },
);

export function UnitWorkspace({
  unit,
  topic,
  material,
  onBack,
  onTopic,
  onMaterial,
  onImage,
  theme,
}: {
  unit: AtlasUnit;
  topic?: AtlasTopic;
  material?: AtlasMaterial;
  onBack: () => void;
  onTopic: (topic: AtlasTopic) => void;
  onMaterial: (topic: AtlasTopic, material: AtlasMaterial) => void;
  onImage?: () => void;
  theme: "LIGHT" | "DARK";
}) {
  const selectedTopic = topic ?? unit.topics[0];
  const viewer = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const changed = () =>
      setExpanded(
        document.fullscreenElement === viewer.current ||
          !!viewer.current?.matches(":modal"),
      );
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);
  useEffect(() => {
    if (material && window.matchMedia("(max-width: 767px)").matches)
      viewer.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [material?.id]);
  function restoreViewer() {
    viewer.current?.setAttribute("open", "");
    setExpanded(false);
    viewer.current
      ?.querySelector<HTMLButtonElement>("button")
      ?.focus({ preventScroll: true });
  }
  async function toggleFullscreen() {
    setError("");
    const element = viewer.current;
    if (!element) return;
    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
        return;
      }
      if (element.matches(":modal")) {
        element.close();
        return;
      }
      if (document.fullscreenEnabled && element.requestFullscreen) {
        try {
          await element.requestFullscreen();
          return;
        } catch {
          /* Use the in-page dialog when native fullscreen is unavailable. */
        }
      }
      element.removeAttribute("open");
      element.showModal();
      setExpanded(true);
    } catch {
      element.setAttribute("open", "");
      setError(
        "Tu navegador no pudo ampliar el recurso. Puedes seguir consultándolo aquí.",
      );
    }
  }
  return (
    <div className={styles.workspace}>
      <aside className={styles.sidebar} aria-label="Temas de la unidad">
        <button type="button" className={styles.back} onClick={onBack}>
          <ArrowLeft size={14} /> Volver al mapa
        </button>
        <span className={styles.location}>
          <i /> Unidad {unit.number}
        </span>
        <h1>{unit.title}</h1>
        {unit.imageUrl && (
          <div className={styles.image}>
            <img src={unit.imageUrl} alt={`Imagen de ${unit.title}`} />
            {onImage && (
              <button
                type="button"
                onClick={onImage}
                aria-label={`Cambiar imagen de la unidad ${unit.number}`}
              >
                <ImagePlus size={15} />
              </button>
            )}
          </div>
        )}
        {!unit.imageUrl && onImage && (
          <button className={styles.back} type="button" onClick={onImage}>
            <ImagePlus size={14} /> Imagen de la unidad
          </button>
        )}
        {unit.objective && (
          <details className={styles.objective}>
            <summary>Objetivo de esta unidad</summary>
            <p>{unit.objective}</p>
          </details>
        )}
        <h2>Temas</h2>
        <nav aria-label="Seleccionar tema" className={styles.topics}>
          {unit.topics.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-current={selectedTopic?.id === item.id ? "true" : undefined}
              onClick={() => onTopic(item)}
            >
              <span>{item.number}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
        </nav>
        {!unit.topics.length && (
          <p className={styles.empty}>Los temas están en preparación.</p>
        )}
      </aside>
      <div className={styles.content}>
        {selectedTopic ? (
          <>
            <section
              className={styles.resources}
              aria-label="Recursos del tema"
            >
              <span className={styles.eyebrow}>
                Tema {selectedTopic.number}
              </span>
              <h2>{selectedTopic.title}</h2>
              {!!selectedTopic.subtopics?.length && (
                <details className={styles.subtopics}>
                  <summary>Subtemas</summary>
                  <ul>
                    {selectedTopic.subtopics.map((sub) => (
                      <li key={sub.id}>
                        <span>{sub.number}</span> {sub.title}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <div className={styles.resourceList}>
                {selectedTopic.materials.map((item) => {
                  const external =
                    item.type === "LINK" || item.type === "ARTICLE";
                  const Icon = external
                    ? ExternalLink
                    : item.type === "VIDEO"
                      ? Play
                      : FileText;
                  const contents = (
                    <>
                      <Icon size={18} strokeWidth={1.4} />
                      <span>{item.name}</span>
                      {external && <ExternalLink size={12} />}
                    </>
                  );
                  if (external)
                    return (
                      <a
                        key={item.id}
                        href={
                          item.url?.match(/^https?:\/\//i)
                            ? item.url
                            : `${API_URL}/materials/file/${item.id}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${item.name} (abre en otra pestaña)`}
                      >
                        {contents}
                      </a>
                    );
                  return (
                    <button
                      type="button"
                      key={item.id}
                      aria-pressed={material?.id === item.id}
                      onClick={() => onMaterial(selectedTopic, item)}
                    >
                      {contents}
                    </button>
                  );
                })}
              </div>
              {!selectedTopic.materials.length && (
                <p className={styles.empty}>
                  Todavía no hay recursos para este tema.
                </p>
              )}
            </section>
            <dialog
              open
              role={expanded ? "dialog" : "region"}
              aria-modal={expanded || undefined}
              onClose={restoreViewer}
              ref={viewer}
              className={styles.viewer}
              aria-label="Visor del recurso"
            >
              <div className={styles.viewerHeader}>
                <h3>{material?.name ?? "Tu espacio de lectura"}</h3>
                {material && (
                  <button
                    type="button"
                    onClick={() => void toggleFullscreen()}
                    aria-label={
                      expanded ? "Reducir recurso" : "Ampliar recurso"
                    }
                  >
                    {expanded ? (
                      <Minimize2 size={16} />
                    ) : (
                      <Maximize2 size={16} />
                    )}
                    {expanded ? "Volver" : "Ampliar"}
                  </button>
                )}
              </div>
              {error && <p role="alert">{error}</p>}
              <div className={styles.viewerBody}>
                {material ? (
                  <MaterialViewer
                    key={material.id}
                    material={material}
                    theme={theme}
                    embedded
                    primaryColor={theme === "DARK" ? "#d6c7dc" : "#69526b"}
                  />
                ) : (
                  <div className={styles.placeholder}>
                    <BookOpen size={43} strokeWidth={1} />
                    <p>Selecciona un recurso para verlo aquí.</p>
                  </div>
                )}
              </div>
            </dialog>
          </>
        ) : (
          <div className={styles.placeholder}>
            <BookOpen size={40} />
            <p>El contenido de esta unidad está en preparación.</p>
          </div>
        )}
      </div>
    </div>
  );
}
