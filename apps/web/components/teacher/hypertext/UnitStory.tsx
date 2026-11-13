"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  ImagePlus,
  MapPin,
  Target,
  Compass,
  Feather,
  Lightbulb,
  Layers,
  Sparkles,
} from "lucide-react";
import { Butterfly } from "@/components/landing/learning-garden";
import type { AtlasUnit, AtlasTopic } from "./atlas-types";
import styles from "./unit-story.module.css";

const topicIcons = [BookOpen, Compass, Lightbulb, Feather, Layers, Sparkles];

export function UnitStory({
  unit,
  onBack,
  onTopic,
  onImage,
}: {
  unit: AtlasUnit;
  onBack: () => void;
  onTopic: (topic: AtlasTopic) => void;
  onImage?: () => void;
}) {
  return (
    <article className={styles.story}>
      <div className={styles.navigation}>
        <button type="button" onClick={onBack}>
          <ArrowLeft size={15} /> Volver al mapa
        </button>
        <span className={styles.location}>
          <MapPin size={20} fill="#ce605c" stroke="#893d40" strokeWidth={1.5} />{" "}
          Estás aquí · Unidad {unit.number}
        </span>
      </div>

      <div className={styles.summary} data-objective={!!unit.objective}>
        <div className={styles.identity}>
          <header className={styles.title}>
            <h1>{unit.title}</h1>
            <Butterfly className={styles.butterfly} />
          </header>

          <div className={styles.illustration} data-image={!!unit.imageUrl}>
            {unit.imageUrl ? (
              <img
                src={unit.imageUrl}
                alt={`Imagen de ${unit.title}`}
                decoding="async"
              />
            ) : (
              <div className={styles.books} aria-hidden="true">
                <span className={styles.orbit} />
                <span className={styles.backBook} />
                <span className={styles.frontBook}>
                  <BookOpen size={52} strokeWidth={1} />
                  <i />
                </span>
                <span className={styles.loosePage}>
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
            {onImage && (
              <button
                type="button"
                className={styles.changeImage}
                onClick={onImage}
                aria-label={`Cambiar imagen de la unidad ${unit.number}`}
              >
                <ImagePlus size={15} /> Cambiar imagen
              </button>
            )}
          </div>
        </div>
        {unit.objective && (
          <section
            className={styles.objective}
            aria-labelledby={`unit-objective-${unit.id}`}
          >
            <span className={styles.objectiveIcon} aria-hidden="true">
              <Target size={24} strokeWidth={1.2} />
            </span>
            <div>
              <h2 id={`unit-objective-${unit.id}`}>Objetivo de esta unidad</h2>
              <p>{unit.objective}</p>
            </div>
          </section>
        )}
      </div>

      <section
        className={styles.topics}
        aria-labelledby={`unit-topics-${unit.id}`}
      >
        <div className={styles.sectionTitle}>
          <BookOpen size={24} strokeWidth={1.2} />
          <h2>Los temas de esta unidad</h2>
        </div>
        <ol className={styles.topicList}>
          {unit.topics.map((topic, index) => {
            const Icon = topicIcons[index % topicIcons.length];
            return (
              <li key={topic.id} data-tone={index % topicIcons.length}>
                <button
                  type="button"
                  className={styles.topic}
                  onClick={() => onTopic(topic)}
                >
                  <span className={styles.tileHeader}>
                    <Icon size={27} strokeWidth={1.2} aria-hidden="true" />
                    <span>{topic.number}</span>
                  </span>
                  <span className={styles.topicCopy}>
                    <h3>{topic.title}</h3>
                    <span>
                      {topic.materials.length
                        ? `${topic.materials.length} ${topic.materials.length === 1 ? "recurso disponible" : "recursos disponibles"}`
                        : "Material en preparación"}
                    </span>
                  </span>
                  <span className={styles.openTopic}>
                    <ArrowUpRight size={19} />
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {!unit.topics.length && (
          <p className={styles.empty}>
            Los temas de esta unidad están en preparación.
          </p>
        )}
        <Butterfly className={styles.endButterfly} />
      </section>
    </article>
  );
}
