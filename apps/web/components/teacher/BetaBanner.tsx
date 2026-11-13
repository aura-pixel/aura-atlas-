import { FlaskConical } from "lucide-react";
import styles from "./teacher-dashboard.module.css";

export function BetaBanner() {
  return (
    <aside
      className={styles.betaBanner}
      aria-label="Información de la versión beta"
    >
      <span className={styles.betaIcon}>
        <FlaskConical size={16} />
      </span>
      <div className={styles.betaContent}>
        <p>
          <strong>Estás utilizando una versión Beta de Aura Atlas.</strong>
        </p>
        <p>
          Durante este mes, puedes crear y probar tus hipertextos de forma
          gratuita. Tu retroalimentación nos ayudará a mejorar la plataforma
          antes de su lanzamiento oficial.
        </p>
        <p>
          Al finalizar el periodo de prueba, podrás continuar utilizando Aura
          Atlas por <strong>$120 MXN al mes</strong> o{" "}
          <strong>$1,440 MXN al año</strong>.
        </p>
      </div>
    </aside>
  );
}
