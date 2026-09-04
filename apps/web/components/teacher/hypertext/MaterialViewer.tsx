"use client";

import {
  ArrowLeft,
  ExternalLink,
  FileAudio,
  FileImage,
  FileText,
  Film,
  Link as LinkIcon,
  Presentation,
} from "lucide-react";
import { API_URL } from "@/lib/config";

type Material = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  mimeType?: string | null;
};

type MaterialViewerProps = {
  material: Material;
  onBack?: () => void;

  /* =========================================================
     CONFIGURACIÓN VISUAL
  ========================================================= */
  primaryColor?: string;
  secondaryColor?: string;
  theme?: "LIGHT" | "DARK";
};

export function MaterialViewer({
  material,
  onBack,
  primaryColor = "#7D5DFF",
  secondaryColor = "#5EE1E6",
  theme = "LIGHT",
}: MaterialViewerProps) {
  console.log("🔥 MATERIAL VIEWER:", material);
  const materialType = material.type?.toUpperCase();

  const hasUrl = Boolean(material.url);

  const isDark = theme === "DARK";

  /* =========================================================
     COLORES
  ========================================================= */
  const colors = {
    pageBackground: isDark ? "#15171C" : secondaryColor,
    surface: isDark ? "#1D2027" : "#FFFFFF",
    softSurface: isDark ? "#20242C" : "#FAFAFB",
    foreground: isDark ? "#F4F6F9" : "#1E2430",
    muted: isDark ? "#A7AFBC" : "#6B7280",
    subtle: isDark ? "#737C8A" : "#9CA3AF",
    border: isDark ? "#303540" : "#E5E7EB",
    softBorder: isDark ? "#383E4A" : "#D8DCE3",
    iconBackground: isDark
      ? `${primaryColor}20`
      : "#EEF2F7",
    iconSurface: isDark
      ? "#252933"
      : "#FFFFFF",
  };

  const getMaterialIcon = () => {
    switch (materialType) {
      case "VIDEO":
        return Film;

      case "AUDIO":
        return FileAudio;

      case "IMAGE":
        return FileImage;

      case "PRESENTATION":
        return Presentation;

      case "LINK":
      case "ARTICLE":
        return LinkIcon;

      default:
        return FileText;
    }
  };

  const MaterialIcon = getMaterialIcon();

  return (
    <section
      className="min-h-screen"
      style={{
        backgroundColor: colors.pageBackground,
        color: colors.foreground,
      }}
    >

      {/* =========================================================
          ENCABEZADO
      ========================================================= */}
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-10">

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium transition"
            style={{
              color: colors.muted,
            }}
            onMouseEnter={(event) => {
              event.currentTarget.style.color = primaryColor;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = colors.muted;
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al tema
          </button>
        )}

        <div className="flex items-start gap-4">

          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm"
            style={{
              backgroundColor: colors.iconSurface,
            }}
          >
            <MaterialIcon
              className="h-6 w-6"
              style={{
                color: primaryColor,
              }}
            />
          </div>

          <div className="min-w-0">

            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{
                color: colors.subtle,
              }}
            >
              {material.type}
            </p>

            <h1
              className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl"
              style={{
                color: colors.foreground,
              }}
            >
              {material.name}
            </h1>

          </div>

        </div>

      </div>


      {/* =========================================================
          CONTENIDO
      ========================================================= */}
      <div
        className="border-t"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >

        <div className="mx-auto max-w-6xl px-6 py-10">

          {!hasUrl ? (
            <EmptyMaterial
              colors={colors}
            />
          ) : (
            <MaterialContent
              material={material}
              materialType={materialType}
              colors={colors}
              primaryColor={primaryColor}
            />
          )}

        </div>

      </div>

    </section>
  );
}

function getVideoEmbedUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    // YouTube
    if (
      parsedUrl.hostname === "www.youtube.com" ||
      parsedUrl.hostname === "youtube.com"
    ) {
      const videoId =
        parsedUrl.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    if (parsedUrl.hostname === "youtu.be") {
      const videoId =
        parsedUrl.pathname.slice(1);

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    // Vimeo
    if (
      parsedUrl.hostname === "vimeo.com" ||
      parsedUrl.hostname === "www.vimeo.com"
    ) {
      const videoId =
        parsedUrl.pathname.split("/").filter(Boolean).pop();

      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/* =============================================================
   CONTENIDO SEGÚN TIPO
============================================================= */

function MaterialContent({
  material,
  materialType,
  colors,
  primaryColor,
}: {
  material: Material;
  materialType: string;
  colors: {
    surface: string;
    softSurface: string;
    foreground: string;
    muted: string;
    subtle: string;
    border: string;
    softBorder: string;
    iconBackground: string;
    iconSurface: string;
  };
  primaryColor: string;
}) {
  const url = material.url
  ? material.url.startsWith("http")
    ? material.url
    : `${API_URL}${material.url}`
  : "";

console.log("MATERIAL URL:", material.url);
console.log("FINAL URL:", url);
console.log("🔥 MATERIAL CONTENT:", material);

  switch (materialType) {

    case "VIDEO": {
  const embedUrl = getVideoEmbedUrl(url);

  if (embedUrl) {
    return (
      <div
        className="overflow-hidden rounded-2xl border bg-black"
        style={{
          borderColor: colors.border,
        }}
      >
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={material.name}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border bg-black"
      style={{
        borderColor: colors.border,
      }}
    >
      <video
        src={url}
        controls
        className="mx-auto max-h-[75vh] w-full"
      >
        Tu navegador no puede reproducir este video.
      </video>
    </div>
  );
}

    case "AUDIO":
      return (
        <div
          className="rounded-2xl border p-8"
          style={{
            backgroundColor: colors.softSurface,
            borderColor: colors.border,
          }}
        >
          <audio
            src={url}
            controls
            className="w-full"
          >
            Tu navegador no puede reproducir este audio.
          </audio>
        </div>
      );


    case "IMAGE":
      return (
        <div
          className="flex justify-center rounded-2xl border p-6"
          style={{
            backgroundColor: colors.softSurface,
            borderColor: colors.border,
          }}
        >
          <img
            src={url}
            alt={material.name}
            className="max-h-[75vh] max-w-full rounded-xl object-contain"
          />
        </div>
      );


    case "PDF":
      return (
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: colors.softSurface,
            borderColor: colors.border,
          }}
        >
          <iframe
            src={url}
            title={material.name}
            className="h-[75vh] w-full"
          />
        </div>
      );


    case "LINK":
    case "ARTICLE":
      return (
        <ExternalMaterial
          url={url}
          name={material.name}
          colors={colors}
          primaryColor={primaryColor}
        />
      );


    case "PRESENTATION":
      return (
        <ExternalMaterial
          url={url}
          name={material.name}
          label="Abrir presentación"
          colors={colors}
          primaryColor={primaryColor}
        />
      );


    case "DOCUMENT":
      return (
        <ExternalMaterial
          url={url}
          name={material.name}
          label="Abrir documento"
          colors={colors}
          primaryColor={primaryColor}
        />
      );


    default:
      return (
        <ExternalMaterial
          url={url}
          name={material.name}
          label="Abrir material"
          colors={colors}
          primaryColor={primaryColor}
        />
      );
  }
}


/* =============================================================
   MATERIAL EXTERNO
============================================================= */

function ExternalMaterial({
  url,
  name,
  label = "Abrir material",
  colors,
  primaryColor,
}: {
  url: string;
  name: string;
  label?: string;
  colors: {
    surface: string;
    softSurface: string;
    foreground: string;
    muted: string;
    subtle: string;
    border: string;
    softBorder: string;
    iconBackground: string;
    iconSurface: string;
  };
  primaryColor: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border px-6 py-16 text-center"
      style={{
        backgroundColor: colors.softSurface,
        borderColor: colors.border,
      }}
    >

      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm"
        style={{
          backgroundColor: colors.iconSurface,
        }}
      >
        <ExternalLink
          className="h-6 w-6"
          style={{
            color: primaryColor,
          }}
        />
      </div>


      <h2
        className="mt-5 text-lg font-semibold"
        style={{
          color: colors.foreground,
        }}
      >
        {name}
      </h2>


      <p
        className="mt-2 max-w-md text-sm leading-6"
        style={{
          color: colors.muted,
        }}
      >
        Este material se abrirá en su ubicación original.
      </p>


      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        style={{
          backgroundColor: primaryColor,
        }}
      >
        {label}
        <ExternalLink className="h-4 w-4" />
      </a>

    </div>
  );
}


/* =============================================================
   SIN MATERIAL
============================================================= */

function EmptyMaterial({
  colors,
}: {
  colors: {
    foreground: string;
    muted: string;
    subtle: string;
    border: string;
    softSurface: string;
  };
}) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center"
      style={{
        borderColor: colors.softBorder,
        backgroundColor: colors.softSurface,
      }}
    >

      <FileText
        className="h-8 w-8"
        style={{
          color: colors.subtle,
        }}
      />

      <h2
        className="mt-4 text-sm font-semibold"
        style={{
          color: colors.foreground,
        }}
      >
        Este material no está disponible
      </h2>

      <p
        className="mt-1 max-w-md text-xs leading-5"
        style={{
          color: colors.muted,
        }}
      >
        No se encontró una ubicación para mostrar este recurso.
      </p>

    </div>
  );
}