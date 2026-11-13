import { ArrowRight, BookOpen, Check } from "lucide-react";
import { Butterfly } from "@/components/landing/learning-garden";
import type { Subject, Tab } from "./types";
import styles from "./subject-workspace.module.css";
export function SubjectOverview({
  subject,
  onNavigate,
}: {
  subject: Subject;
  onNavigate: (tab: Tab) => void;
}) {
  const units = subject.hypertexts?.[0]?.units ?? [];
  const topics = units.flatMap((u) => u.topics);
  const materials = topics.reduce((n, t) => n + t.materials.length, 0);
  const ready = !!subject.academicStructureConfirmed && topics.length > 0;
  return (
    <section>
      <div className={styles.guideHero}>
        <div>
          <p className={styles.eyebrow}>TU ESPACIO DE TRABAJO</p>
          <h2>
            Una materia, <em>paso a paso.</em>
          </h2>
          <p>
            {!ready
              ? "Comienza por el programa de estudios. Después podrás añadir recursos a cada tema."
              : materials === 0
                ? "Tu programa está listo. Ahora añade los recursos que acompañarán cada tema."
                : "Sigue enriqueciendo los temas con tus materiales. Puedes avanzar a tu propio ritmo."}
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={() => onNavigate(ready ? "contenidos" : "estructura")}
          >
            {ready ? "Agregar contenidos" : "Comenzar con el programa"}
            <ArrowRight size={16} />
          </button>
        </div>
        <div className={styles.guideArt} aria-hidden="true">
          <BookOpen size={75} strokeWidth={1} />
          <Butterfly className={styles.butterfly} />
        </div>
      </div>
      <div className={styles.steps}>
        {[
          {
            n: "01",
            title: "Organiza tu programa",
            text: "Sube el PDF de la UAEMéx y revisa las unidades y los temas detectados.",
            tab: "estructura" as Tab,
            done: ready,
          },
          {
            n: "02",
            title: "Añade tus recursos",
            text: "Elige archivos, videos o enlaces y asígnalos al tema que corresponda.",
            tab: "contenidos" as Tab,
            done: materials > 0,
          },
        ].map((item) => (
          <button
            type="button"
            className={styles.stepCard}
            key={item.n}
            onClick={() => onNavigate(item.tab)}
          >
            <span className={styles.stepNumber}>
              {item.done ? <Check size={18} /> : item.n}
            </span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className={styles.stepAction}>
                {item.done ? "Revisar" : "Comenzar"}
                <ArrowRight size={13} />
              </span>
            </div>
          </button>
        ))}
      </div>
      <div className={styles.quietStats}>
        <span>
          <strong>{units.length}</strong> unidades
        </span>
        <span>
          <strong>{topics.length}</strong> temas
        </span>
        <span>
          <strong>{materials}</strong> materiales
        </span>
      </div>
    </section>
  );
}
