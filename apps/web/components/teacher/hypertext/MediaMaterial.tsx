"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import styles from "./media-material.module.css";

export function MediaMaterial({
  kind,
  url,
  name,
}: {
  kind: "VIDEO" | "AUDIO" | "IMAGE";
  url: string;
  name: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={styles.media}>
      {!failed &&
        (kind === "VIDEO" ? (
          <video
            src={url}
            controls
            playsInline
            preload="metadata"
            aria-label={name}
            onError={() => setFailed(true)}
          />
        ) : kind === "AUDIO" ? (
          <audio
            src={url}
            controls
            preload="metadata"
            aria-label={name}
            onError={() => setFailed(true)}
          />
        ) : (
          <img
            src={url}
            alt={name}
            decoding="async"
            onError={() => setFailed(true)}
          />
        ))}
      {failed && (
        <p role="alert">
          No pudimos mostrar este recurso. Puedes abrir el archivo original.
        </p>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer">
        Abrir original <ExternalLink size={14} />
      </a>
    </div>
  );
}
