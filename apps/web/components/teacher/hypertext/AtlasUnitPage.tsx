"use client";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  ImageIcon,
  Link2,
  Music,
  Play,
} from "lucide-react";
import type { AtlasUnit, AtlasTopic, AtlasMaterial } from "./atlas-types";
import { Landscape } from "./LearningJourney";
import { UnitStory } from "./UnitStory";
import styles from "./learning-atlas.module.css";
const labels: Record<string, string> = {
  PDF: "Lectura PDF",
  IMAGE: "Imagen",
  VIDEO: "Video",
  AUDIO: "Audio",
  LINK: "Enlace",
  ARTICLE: "Lectura",
  DOCUMENT: "Documento",
  PRESENTATION: "Presentación",
  OTHER: "Archivo",
};
export function AtlasUnitPage({
  unit,
  topic,
  onBack,
  onTopic,
  onMaterial,
  onImage,
}: {
  unit: AtlasUnit;
  topic?: AtlasTopic;
  onBack: () => void;
  onTopic: (topic: AtlasTopic) => void;
  onMaterial: (material: AtlasMaterial) => void;
  onImage?: () => void;
}) {
  if (!topic) {
    return (
      <UnitStory
        unit={unit}
        onBack={onBack}
        onTopic={onTopic}
        onImage={onImage}
      />
    );
  }
  return (
    <div className={styles.innerPage}>
      <button type="button" className={styles.back} onClick={onBack}>
        <ArrowLeft size={14} />
        Volver a la unidad
      </button>
      <header className={styles.unitHero}>
        <div>
          <span className={styles.eyebrow}>
            UNIDAD {String(unit.number).padStart(2, "0")}
            {` · TEMA ${topic.number}`}
          </span>
          <h1>{topic.title}</h1>
          <p>
            Abre un recurso, explora a tu ritmo y regresa cuando lo necesites.
          </p>
        </div>
        <div className={styles.unitHeroArt}>
          {unit.imageUrl ? (
            <img
              src={unit.imageUrl}
              alt={`Imagen de ${unit.title}`}
              decoding="async"
            />
          ) : (
            <Landscape kind="mountain" />
          )}
        </div>
      </header>
      {topic?.subtopics?.length ? (
        <section className={styles.subtopics}>
          <h2>En este tema</h2>
          <ul>
            {topic.subtopics.map((sub) => (
              <li key={sub.id}>
                <span>{sub.number}</span>
                {sub.title}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className={styles.pageSectionTitle}>
        <span className={styles.eyebrow}>TU MATERIAL DE APOYO</span>
        <h2>Recursos para explorar</h2>
      </div>
      <div className={styles.resourceGrid}>
        {topic.materials.map((material) => {
          const Icon =
            material.type === "VIDEO"
              ? Play
              : material.type === "AUDIO"
                ? Music
                : material.type === "IMAGE"
                  ? ImageIcon
                  : material.type === "LINK"
                    ? Link2
                    : FileText;
          return (
            <button
              type="button"
              className={styles.materialCard}
              key={material.id}
              onClick={() => onMaterial(material)}
            >
              <span className={styles.resourceIcon}>
                <Icon size={24} strokeWidth={1.4} />
              </span>
              <span className={styles.eyebrow}>
                {labels[material.type] ?? "Recurso"}
              </span>
              <h3>{material.name}</h3>
              <span className={styles.explore}>
                Abrir recurso <ArrowRight size={14} />
              </span>
            </button>
          );
        })}
        {!topic.materials.length && (
          <p className={styles.empty}>
            Todavía no hay recursos para este tema.
          </p>
        )}
      </div>
    </div>
  );
}
