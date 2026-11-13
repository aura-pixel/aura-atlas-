import type { AcademicStructure, Subject } from "./types";
import { AcademicStructureBuilder } from "@/components/teacher/academic-structure/academic-structure-builder";
import styles from "./subject-workspace.module.css";
export function SubjectStructure({
  subject,
  saving,
  onContinue,
  onGoToContents,
}: {
  subject: Subject;
  saving: boolean;
  onContinue: (structure: AcademicStructure) => void;
  onGoToContents: () => void;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>PASO 1 · PROGRAMA DE ESTUDIOS</p>
        <h2>
          Primero, <em>los temas.</em>
        </h2>
        <p>
          Organiza las unidades y los temas a los que después agregarás tus
          materiales.
        </p>
      </div>
      <AcademicStructureBuilder
        initialStructure={subject.academicStructure}
        confirmed={subject.academicStructureConfirmed}
        onGoToContents={onGoToContents}
        onContinue={onContinue}
        saving={saving}
      />
    </section>
  );
}
