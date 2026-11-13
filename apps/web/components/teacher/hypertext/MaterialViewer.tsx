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
import dynamic from "next/dynamic";
import { API_URL } from "@/lib/config";
import { MediaMaterial } from "./MediaMaterial";
const PdfMaterial = dynamic(
  () => import("./PdfMaterial").then((module) => module.PdfMaterial),
  { ssr: false, loading: () => <p role="status">Cargando visor PDF…</p> },
);

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
  embedded?: boolean;

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
  embedded = false,
  primaryColor = "#7D5DFF",
  secondaryColor = "#5EE1E6",
  theme = "LIGHT",
}: MaterialViewerProps) {
  const materialType =
    material.mimeType === "application/pdf"
      ? "PDF"
      : material.type?.toUpperCase();

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
    iconBackground: isDark ? `${primaryColor}20` : "#EEF2F7",
    iconSurface: isDark ? "#252933" : "#FFFFFF",
  };

  if (embedded) {
    return (
      <div style={{ color: colors.foreground, minWidth: 0 }}>
        {hasUrl ? (
          <MaterialContent
            material={material}
            materialType={materialType}
            colors={colors}
            primaryColor={primaryColor}
          />
        ) : (
          <EmptyMaterial colors={colors} />
        )}
      </div>
    );
  }

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
            <EmptyMaterial colors={colors} />
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
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
    if (host === "youtube.com" || host === "youtu.be") {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const id =
        host === "youtu.be"
          ? segments[0]
          : parsed.searchParams.get("v") ||
            (["embed", "shorts", "live"].includes(segments[0])
              ? segments[1]
              : null);
      return id && /^[a-zA-Z0-9_-]+$/.test(id)
        ? `https://www.youtube.com/embed/${id}`
        : null;
    }
    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const id = parsed.pathname
        .split("/")
        .filter(Boolean)
        .findLast((segment) => /^\d+$/.test(segment));
      return id ? `https://player.vimeo.com/video/${id}` : null;
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
    ? /^https?:\/\//i.test(material.url)
      ? material.url
      : `${API_URL}/materials/file/${material.id}`
    : "";

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
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center justify-center gap-2 bg-white px-3 py-2 text-xs text-[#69526b]"
            >
              Abrir video original <ExternalLink size={14} />
            </a>
          </div>
        );
      }

      return <MediaMaterial kind="VIDEO" url={url} name={material.name} />;
    }
    case "AUDIO":
      return <MediaMaterial kind="AUDIO" url={url} name={material.name} />;
    case "IMAGE":
      return <MediaMaterial kind="IMAGE" url={url} name={material.name} />;
    case "PDF":
      return <PdfMaterial key={url} url={url} name={material.name} />;

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
    softBorder: string;
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
