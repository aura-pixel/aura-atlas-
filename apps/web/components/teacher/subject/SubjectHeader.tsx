import Link from "next/link";
import { ArrowLeft, BookOpen, Pencil } from "lucide-react";
import { assetUrl } from "@/lib/config";
import { getSubjectTextColor } from "@/lib/subject-colors";
import type { Subject } from "./types";
import styles from "./subject-workspace.module.css";
export function SubjectHeader({
  subject,
  onEdit,
  onBack,
}: {
  subject: Subject;
  onEdit: () => void;
  onBack?: () => void;
}) {
  const color = subject.color || "#4a1115";
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link
          href="/teacher/dashboard"
          className={styles.back}
          onClick={(event) => {
            if (onBack) {
              event.preventDefault();
              onBack();
            }
          }}
        >
          <ArrowLeft size={15} /> Mis materias
        </Link>
        <div className={styles.headingRow}>
          <div
            className={styles.cover}
            style={{ background: color, color: getSubjectTextColor(color) }}
          >
            {subject.logoUrl ? (
              <img src={assetUrl(subject.logoUrl)} alt="" />
            ) : (
              <BookOpen size={29} strokeWidth={1.3} />
            )}
          </div>
          <div className={styles.headingText}>
            <p className={styles.eyebrow}>{subject.career.name}</p>
            <h1>
              {subject.name}{" "}
              {subject.abbreviation && <small>{subject.abbreviation}</small>}
            </h1>
            <p className={styles.institution}>
              {subject.career.faculty.name} ·{" "}
              {subject.career.faculty.university.name}
            </p>
            {subject.description && (
              <details className={styles.description}>
                <summary>Acerca de esta materia</summary>
                <p>{subject.description}</p>
              </details>
            )}
          </div>
          <button type="button" className={styles.secondary} onClick={onEdit}>
            <Pencil size={14} /> Editar materia
          </button>
        </div>
      </div>
    </header>
  );
}
