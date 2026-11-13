"use client";
import { BookOpen, ArrowRight } from "lucide-react";
import { ContentWizard } from "../content/content-wizard";
import type { Subject } from "./types";
import styles from "./subject-workspace.module.css";
type Props = {
  subject: Subject;
  hypertextProgress: unknown;
  showContentWizard: boolean;
  onShowContentWizard: (value: boolean) => void;
  onReload: () => void;
  onGoToHypertext: () => void;
  onGoToStructure: () => void;
  onBusyChange?: (busy: boolean) => void;
};
export function SubjectContents({
  subject,
  onShowContentWizard,
  onReload,
  onGoToHypertext,
  onGoToStructure,
  onBusyChange,
}: Props) {
  const hyper = subject.hypertexts?.[0];
  const units = hyper?.units ?? [];
  if (
    !subject.academicStructureConfirmed ||
    !units.some((unit) => unit.topics.length)
  )
    return (
      <section className={styles.section}>
        <div className={`${styles.panel} ${styles.empty}`}>
          <BookOpen size={32} />
          <h2>Comienza por tu programa de estudios</h2>
          <p>
            Extraemos los objetivos, las unidades, los temas y los subtemas.
            Sólo tendrás que confirmar una vez que sean correctos.
          </p>
          <button
            type="button"
            className={styles.primary}
            onClick={onGoToStructure}
          >
            Subir mi programa <ArrowRight size={15} />
          </button>
        </div>
      </section>
    );
  return (
    <ContentWizard
      subjectId={subject.id}
      initialStructure={{ units }}
      storageKey={hyper?.id}
      onBusyChange={onBusyChange}
      onDirtyChange={onShowContentWizard}
      onGoToHypertext={onGoToHypertext}
      onReload={onReload}
    />
  );
}
