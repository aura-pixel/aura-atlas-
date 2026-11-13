"use client";

import { useId, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { getSubjectTextColor, SUBJECT_COLORS } from "@/lib/subject-colors";
import styles from "./subject-color-picker.module.css";

export function SubjectColorPicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}) {
  const customId = useId();
  const selectedIndex = SUBJECT_COLORS.findIndex(
    (color) => color.value.toLowerCase() === value.toLowerCase(),
  );

  function selectWithKeyboard(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const count = SUBJECT_COLORS.length;
    const positions: Record<string, number> = {
      ArrowRight: (index + 1) % count,
      ArrowDown: (index + 1) % count,
      ArrowLeft: (index + count - 1) % count,
      ArrowUp: (index + count - 1) % count,
      Home: 0,
      End: count - 1,
    };
    const next = positions[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onChange(SUBJECT_COLORS[next].value);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="radio"]')
      [next]?.focus();
  }

  return (
    <div className={styles.picker}>
      <div
        role="radiogroup"
        aria-label="Colores de la materia"
        className={styles.swatches}
      >
        {SUBJECT_COLORS.map((color, index) => (
          <button
            key={color.value}
            type="button"
            role="radio"
            aria-label={color.name}
            title={color.name}
            aria-checked={index === selectedIndex}
            tabIndex={index === Math.max(0, selectedIndex) ? 0 : -1}
            disabled={disabled}
            onClick={() => onChange(color.value)}
            onKeyDown={(event) => selectWithKeyboard(event, index)}
            className={styles.swatch}
            style={{
              backgroundColor: color.value,
              color: getSubjectTextColor(color.value),
            }}
          >
            {index === selectedIndex && <Check size={18} strokeWidth={2} />}
          </button>
        ))}
      </div>
      <div className={styles.customRow}>
        <label htmlFor={customId}>Color personalizado</label>
        <input
          id={customId}
          type="color"
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <span>{value.toUpperCase()}</span>
      </div>
    </div>
  );
}
