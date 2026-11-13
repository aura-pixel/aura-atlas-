"use client";
import { useState } from "react";
import { ArrowRight, FileUp, LoaderCircle, Check } from "lucide-react";
import { postForm } from "@/lib/api";
import type { AcademicStructure } from "../subject/types";
import styles from "../subject/subject-workspace.module.css";
export function AcademicStructureBuilder({
  initialStructure,
  onContinue,
  saving = false,
  confirmed = false,
  onGoToContents,
}: {
  initialStructure?: AcademicStructure | null;
  onContinue: (structure: AcademicStructure) => void;
  saving?: boolean;
  confirmed?: boolean;
  onGoToContents?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [structure, setStructure] = useState<AcademicStructure | null>(
    initialStructure ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function analyze() {
    if (!file || loading || saving) return;
    setLoading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const result = await postForm<{ structure: AcademicStructure }>(
        "/academic-structure/analyze",
        data,
      );
      if (
        !result.structure?.units?.length ||
        !result.structure.units.some((u) => u.topics?.length)
      ) {
        setError(
          "No encontramos unidades y temas. Comprueba que sea un programa de la UAEMéx con texto seleccionable; los PDF escaneados y otros formatos todavía no son compatibles.",
        );
        return;
      }
      setStructure(result.structure);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "No pudimos leer el PDF. Vuelve a intentarlo.",
      );
    } finally {
      setLoading(false);
    }
  }
  const topics = structure?.units.reduce((n, u) => n + u.topics.length, 0) ?? 0;
  return (
    <div className={styles.stack}>
      <div className={styles.note}>
        <strong>Compatibilidad actual: programas de la UAEMéx.</strong>
        <br />
        La lectura automática está preparada para ese formato. Usa un PDF con
        texto seleccionable, de hasta 10 MB. Otros formatos y documentos
        escaneados pueden no reconocerse.
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {structure ? (
        <div className={styles.panel}>
          <div className={styles.between}>
            <div>
              <h3>
                {confirmed
                  ? "Tu programa está organizado"
                  : "¿Son correctos estos objetivos y temas?"}
              </h3>
              <p className={styles.muted}>
                {structure.units.length} unidades · {topics} temas
                {!confirmed &&
                  " · Revisa el programa; sólo te pediremos confirmarlo una vez."}
              </p>
            </div>
            {confirmed && <Check size={20} />}
          </div>
          {structure.subjectObjective && (
            <div className={styles.note} style={{ marginTop: 20 }}>
              <strong>Objetivo de la materia</strong>
              <p>{structure.subjectObjective}</p>
            </div>
          )}
          <div className={styles.stack} style={{ marginTop: 20 }}>
            {structure.units.map((unit, index) => (
              <details
                className={styles.unit}
                key={unit.number}
                open={index === 0}
              >
                <summary>
                  Unidad {unit.number} · {unit.title}
                </summary>
                <div className={styles.unitBody}>
                  {unit.objective && (
                    <div className={styles.note}>
                      <strong>Objetivo de la unidad</strong>
                      <p>{unit.objective}</p>
                    </div>
                  )}
                  {unit.topics.map((topic) => (
                    <div className={styles.resource} key={topic.number}>
                      <div>
                        <strong>
                          {topic.number} · {topic.title}
                        </strong>
                        {topic.subtopics?.map((sub) => (
                          <p key={sub.number}>
                            {sub.number} · {sub.title}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
          <div className={styles.actions}>
            {!confirmed && (
              <button
                type="button"
                className={styles.secondary}
                disabled={saving}
                onClick={() => {
                  setStructure(null);
                  setError("");
                }}
              >
                Elegir otro PDF
              </button>
            )}
            <button
              type="button"
              className={styles.primary}
              disabled={saving || !topics}
              onClick={() =>
                confirmed ? onGoToContents?.() : onContinue(structure)
              }
            >
              {saving
                ? "Guardando…"
                : confirmed
                  ? "Ir a contenidos"
                  : "Sí, este es mi programa"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.panel}>
          <label className={styles.upload}>
            <FileUp size={30} strokeWidth={1.4} />
            <strong>Selecciona tu programa de estudios</strong>
            <small>PDF de la UAEMéx · Máximo 10 MB</small>
            <input
              id="academic-program"
              type="file"
              accept="application/pdf"
              disabled={loading || saving}
              onChange={(event) => {
                const selected = event.target.files?.[0];
                setError("");
                setFile(null);
                if (!selected) return;
                if (
                  selected.type !== "application/pdf" ||
                  selected.size > 10 * 1024 * 1024
                ) {
                  setError("Selecciona un PDF de hasta 10 MB.");
                  event.target.value = "";
                  return;
                }
                setFile(selected);
              }}
            />
          </label>
          {file && (
            <p
              className={styles.muted}
              style={{ marginTop: 12, overflowWrap: "anywhere" }}
            >
              {file.name}
            </p>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              disabled={!file || loading || saving}
              onClick={analyze}
            >
              {loading ? (
                <>
                  <LoaderCircle size={15} className="animate-spin" /> Leyendo el
                  programa…
                </>
              ) : (
                <>
                  Leer programa <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
          {loading && (
            <p role="status" className={styles.muted}>
              Estamos buscando unidades y temas. Esto puede tardar unos
              segundos.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
