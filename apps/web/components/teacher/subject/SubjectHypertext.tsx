"use client";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  ExternalLink,
  FileText,
  Globe2,
  Link2,
  LockKeyhole,
  Palette,
  Play,
  Sparkles,
} from "lucide-react";
import { Butterfly } from "@/components/landing/learning-garden";
import { get } from "@/lib/api";
import type { Subject } from "./types";
import styles from "./hypertext-introduction.module.css";
type HypertextProgress = {
  hypertextId: string;
  totalTopics: number;
  topicsWithContent: number;
  minimumTopics: number;
  percentage: number;
  canGenerate: boolean;
};
export function SubjectHypertext({
  subject,
}: {
  subject: Subject;
  hypertextProgress: HypertextProgress | null;
}) {
  const hypertext = subject.hypertexts?.[0];
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setPublicUrl(null);
    if (hypertext?.isPublished) {
      get<{ publicUrl: string | null }>(`/hypertexts/${hypertext.id}`)
        .then((data) => {
          if (active) setPublicUrl(data.publicUrl);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [hypertext?.id, hypertext?.isPublished]);
  if (!hypertext)
    return (
      <section className={styles.empty}>
        <BookOpen size={38} strokeWidth={1.2} aria-hidden="true" />
        <span className={styles.eyebrow}>TU PRÓXIMO CAPÍTULO</span>
        <h2>
          Todo comienza con <em>tu programa.</em>
        </h2>
        <p>
          Primero organiza los objetivos y temas de tu materia. Después podrás
          reunir tus materiales y darles forma en el editor de hipertexto.
        </p>
        <Link
          href={`/teacher/subjects/${subject.id}?tab=estructura`}
          className={styles.primary}
        >
          Ir a mi programa <ArrowRight size={16} />
        </Link>
      </section>
    );
  const units = hypertext.units ?? [];
  const topics = units.flatMap((unit) => unit.topics);
  const materials = topics.reduce(
    (total, topic) => total + topic.materials.length,
    0,
  );
  const covered = topics.filter((topic) => topic.materials.length > 0).length;
  const published = hypertext.isPublished;
  return (
    <section
      className={styles.introduction}
      aria-labelledby="hypertext-intro-title"
    >
      <div className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <Sparkles size={13} aria-hidden="true" /> BIENVENIDA AL EDITOR DE
            HIPERTEXTO
          </span>
          <h2 id="hypertext-intro-title">
            De tus materiales a una <em>experiencia de aprendizaje.</em>
          </h2>
          <p>
            Un hipertexto reúne los temas de tu materia y conecta sus lecturas,
            videos y enlaces en un espacio digital que tus estudiantes pueden
            explorar.
          </p>
          <p className={styles.invitation}>
            En el editor podrás darle tu estilo y revisar cómo se recorre. Tu
            programa y los materiales que ya organizaste te acompañan.
          </p>
          <div className={styles.actions}>
            <Link
              href={`/teacher/hypertexts/${hypertext.id}`}
              className={styles.primary}
            >
              Entrar al editor <ArrowRight size={16} />
            </Link>
            <Link
              href={`/teacher/subjects/${subject.id}?tab=contenidos`}
              className={styles.secondary}
            >
              Revisar mis materiales
            </Link>
          </div>
          <span className={styles.editorNote}>
            {published ? <Globe2 size={12} /> : <LockKeyhole size={12} />}{" "}
            {published
              ? "Tu hipertexto tiene una versión publicada."
              : "Trabaja en tu borrador y publica cuando esté listo."}
          </span>
        </div>
        <div
          className={styles.illustration}
          aria-hidden="true"
          style={
            { "--book-color": subject.color || "#d3c7eb" } as CSSProperties
          }
        >
          <span className={styles.organicShape} />
          <svg className={styles.connections} viewBox="0 0 400 330" fill="none">
            <path
              d="M80 78C8 145 86 239 155 246M306 100C388 99 384 241 305 271"
              stroke="#baa2ad"
              strokeWidth="1.3"
              strokeDasharray="4 6"
            />
            <circle cx="80" cy="78" r="3" fill="#ba879b" />
            <circle cx="305" cy="271" r="3" fill="#8b9aaa" />
          </svg>
          <div className={styles.book}>
            <div className={styles.leftPage}>
              <BookOpen size={23} strokeWidth={1.2} />
              <span>TU MATERIA</span>
              <strong>{subject.name}</strong>
              <i />
              <i />
              <i />
            </div>
            <div className={styles.rightPage}>
              <span>UNIDADES & TEMAS</span>
              <div>
                <b>01</b>
                <i />
              </div>
              <div>
                <b>02</b>
                <i />
              </div>
              <div>
                <b>03</b>
                <i />
              </div>
              <small>Conecta tus recursos</small>
            </div>
            <span className={styles.bookmark} />
          </div>
          <span className={`${styles.resourceCard} ${styles.reading}`}>
            <FileText size={17} /> Lecturas
          </span>
          <span className={`${styles.resourceCard} ${styles.video}`}>
            <Play size={16} /> Videos
          </span>
          <span className={`${styles.resourceCard} ${styles.link}`}>
            <Link2 size={16} /> Enlaces
          </span>
          <Butterfly className={styles.butterfly} />
          <span className={styles.artCaption}>
            Un espacio. Muchas formas de aprender.
          </span>
        </div>
      </div>
      <div className={styles.capabilities}>
        <div className={styles.capabilityHeading}>
          <span className={styles.eyebrow}>DENTRO DEL EDITOR</span>
          <h3>
            Tu contenido, <em>con tu mirada.</em>
          </h3>
        </div>
        <div className={styles.cards}>
          {[
            {
              icon: Palette,
              number: "01",
              title: "Dale tu identidad",
              description:
                "Elige colores, tipografías, portada y tema visual para tu materia.",
              color: "pink",
            },
            {
              icon: Compass,
              number: "02",
              title: "Recorre la experiencia",
              description:
                "Explora las unidades, abre los temas y revisa cómo se presentan tus recursos.",
              color: "blue",
            },
            {
              icon: Globe2,
              number: "03",
              title: "Compártela cuando esté lista",
              description:
                "Desde el editor podrás publicar tu hipertexto y obtener su enlace para tus estudiantes.",
              color: "sage",
            },
          ].map((card) => (
            <article className={styles.card} key={card.number}>
              <div className={styles.cardTop}>
                <span className={styles.icon} data-color={card.color}>
                  <card.icon size={20} strokeWidth={1.4} />
                </span>
                <span>{card.number}</span>
              </div>
              <h4>{card.title}</h4>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
      </div>
      <div className={styles.startingPoint}>
        <div>
          <span className={styles.eyebrow}>TU PUNTO DE PARTIDA</span>
          <h3>Ya tienes con qué empezar.</h3>
          <p>Puedes seguir añadiendo materiales mientras diseñas.</p>
        </div>
        <dl>
          <div>
            <dt>{units.length === 1 ? "unidad" : "unidades"}</dt>
            <dd>{units.length}</dd>
          </div>
          <div>
            <dt>{topics.length === 1 ? "tema" : "temas"}</dt>
            <dd>{topics.length}</dd>
          </div>
          <div>
            <dt>{materials === 1 ? "recurso" : "recursos"}</dt>
            <dd>{materials}</dd>
          </div>
        </dl>
        <span className={styles.coverage}>
          {covered} de {topics.length} temas con recursos
        </span>
      </div>
      <footer className={styles.publication}>
        <div className={styles.publicationCopy}>
          {published ? <Globe2 size={17} /> : <LockKeyhole size={17} />}
          <div>
            <strong>
              {published
                ? "Hipertexto publicado"
                : "Tu espacio sigue en borrador"}
            </strong>
            <p>
              {published
                ? "Puedes entrar al editor para seguir trabajando en tu materia."
                : "Entrar al editor no publica tu materia. Tú decides cuándo compartirla."}
            </p>
          </div>
        </div>
        {published && publicUrl && (
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.publicLink}
          >
            Ver versión pública <ExternalLink size={13} />
          </a>
        )}
      </footer>
    </section>
  );
}
