"use client";
import type { Tab } from "./types";
import styles from "./subject-workspace.module.css";
const tabs: { id: Tab; label: string; number?: string }[] = [
  { id: "resumen", label: "Inicio" },
  { id: "estructura", label: "Programa de estudios", number: "1" },
  { id: "contenidos", label: "Contenidos", number: "2" },
  { id: "hipertexto", label: "Hipertexto", number: "3" },
];
export function SubjectTabs({
  activeTab,
  onChange,
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav className={styles.navigation} aria-label="Navegación de la materia">
      <div>
        {tabs.map((tab) => (
          <button
            type="button"
            key={tab.id}
            aria-current={activeTab === tab.id ? "page" : undefined}
            onClick={() => onChange(tab.id)}
          >
            {tab.number && <span>{tab.number}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
