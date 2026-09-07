"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Globe2,
  ImageIcon,
  Moon,
  Pencil,
  Share2,
  Sun,
  X,
  Copy,
ExternalLink,
} from "lucide-react";
import { post } from "@/lib/api";

import { HypertextRenderer } from "@/components/teacher/hypertext/HypertextRenderer";

type HypertextEditorProps = {
  hypertext: any;
};

type Theme = "LIGHT" | "DARK";

type Palette = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
};

const PALETTES: Palette[] = [
  {
    id: "lavender",
    name: "Lavanda académica",
    primary: "#5B4B8A",
    secondary: "#E9E4F5",
  },
  {
    id: "sage",
    name: "Salvia",
    primary: "#4F6D5A",
    secondary: "#E2ECE9",
  },
  {
    id: "breeze",
    name: "Brisa",
    primary: "#3F7180",
    secondary: "#DCEFF2",
  },
  {
    id: "rose",
    name: "Rosa editorial",
    primary: "#8A3F5D",
    secondary: "#F7E0E8",
  },
  {
    id: "peach",
    name: "Durazno",
    primary: "#9A5B32",
    secondary: "#F8E4D7",
  },
  {
    id: "mist",
    name: "Azul niebla",
    primary: "#4E5A78",
    secondary: "#DFE7FD",
  },
];

const FONT_OPTIONS = [
  {
    id: "Alegreya",
    name: "Alegreya",
    category: "Serif",
  },
  {
    id: "CMU Serif",
    name: "CMU Serif",
    category: "Serif",
  },
  {
    id: "DM Serif Display",
    name: "DM Serif Display",
    category: "Serif",
  },
  {
    id: "Montserrat",
    name: "Montserrat",
    category: "Sans",
  },
  {
    id: "Poppins",
    name: "Poppins",
    category: "Sans",
  },
  {
    id: "Quicksand",
    name: "Quicksand",
    category: "Sans",
  },
  {
    id: "TeX Gyre Termes",
    name: "TeX Gyre Termes",
    category: "Serif",
  },
];

type CoverOption = {
  id: string;
  name: string;
  background: string;
  accent: string;
  imageUrl?: string;
};

const COVER_OPTIONS: CoverOption[] = [
  {
    id: "petal",
    name: "Pétalo",
    background:
      "linear-gradient(135deg, #FDE2E4, #FBECEF)",
    accent: "#8A3F5D",
  },
  {
    id: "rose",
    name: "Rosé",
    background:
      "linear-gradient(135deg, #FAD2E1, #F8E4EC)",
    accent: "#8A3F5D",
  },
  {
    id: "sage",
    name: "Salvia",
    background:
      "linear-gradient(135deg, #E2ECE9, #EEF4F1)",
    accent: "#4F6D5A",
  },
  {
    id: "breeze",
    name: "Brisa",
    background:
      "linear-gradient(135deg, #BEE1E6, #E5F4F6)",
    accent: "#3F7180",
  },
  {
    id: "cloud",
    name: "Nube",
    background:
      "linear-gradient(135deg, #DFE7FD, #EEF2FF)",
    accent: "#4E5A78",
  },
  {
    id: "peach",
    name: "Durazno",
    background:
      "linear-gradient(135deg, #F6D7C3, #FCEBE0)",
    accent: "#9A5B32",
  },
];
  

const ILLUSTRATED_COVERS = [
  "/hypertext/covers/1.png",
  "/hypertext/covers/2.png",
  "/hypertext/covers/3.png",
  "/hypertext/covers/4.png",
  "/hypertext/covers/5.png",
  "/hypertext/covers/6.png",
  "/hypertext/covers/7.png",
  "/hypertext/covers/8.png",
  "/hypertext/covers/9.png",
  "/hypertext/covers/10.png",
];

export function HypertextEditor({
  hypertext,
}: HypertextEditorProps) {
  const router = useRouter();

  const [primaryColor, setPrimaryColor] = useState(
    hypertext.primaryColor || "#7D5DFF",
  );

  const [copied, setCopied] = useState(false);

  const [secondaryColor, setSecondaryColor] = useState(
    hypertext.secondaryColor || "#5EE1E6",
  );

  const [fontFamily, setFontFamily] = useState(
    hypertext.fontFamily || "Montserrat",
  );

  const [theme, setTheme] = useState<Theme>(
    hypertext.theme || "LIGHT",
  );

  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
  hypertext.coverImageUrl || null,
);

const [isPublished, setIsPublished] = useState(
  hypertext.isPublished,
);

const [publicUrl, setPublicUrl] =
  useState<string | null>(
    hypertext.publicUrl || null,
  );
  
const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

const [selectedCover, setSelectedCover] =
  useState<CoverOption | null>(null);

  const [activeSection, setActiveSection] = useState<
    "edit" | "share" | "publish"
  >("edit");

  const selectedPalette = useMemo(() => {
    return (
      PALETTES.find(
        (palette) =>
          palette.primary === primaryColor &&
          palette.secondary === secondaryColor,
      ) ?? null
    );
  }, [primaryColor, secondaryColor]);

  const previewHypertext = useMemo(
  () => ({
    ...hypertext,
    primaryColor,
    secondaryColor,
    fontFamily,
    theme,
    coverImageUrl,
  }),
  [
    hypertext,
    primaryColor,
    secondaryColor,
    fontFamily,
    theme,
    coverImageUrl,
  ],
);

async function handlePublish() {
  try {
    const result = await post<{
      message: string;
      publicUrl: string;
    }>(
      `/hypertexts/${hypertext.id}/publish`,
      {},
    );

    console.log(
      "Hipertexto publicado:",
      result,
    );

    setIsPublished(true);
    setPublicUrl(result.publicUrl);
  } catch (error) {
    console.error(
      "Error al publicar el hipertexto:",
      error,
    );
  }
}

async function handleCopyLink() {
  if (!publicUrl) return;

  try {
    const fullUrl = `${window.location.origin}${publicUrl}`;

    await navigator.clipboard.writeText(fullUrl);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  } catch (error) {
    console.error(
      "No se pudo copiar el enlace:",
      error,
    );
  }
}

  function handlePaletteChange(palette: Palette) {
    setPrimaryColor(palette.primary);
    setSecondaryColor(palette.secondary);
  }

  function handleCoverApply() {
  if (!selectedCover) return;

  // Si es una portada ilustrada, usamos directamente su imagen.
  if (selectedCover.imageUrl) {
    setCoverImageUrl(selectedCover.imageUrl);
    setIsCoverModalOpen(false);
    setSelectedCover(null);
    return;
  }

  /*
   * Para las portadas minimalistas conservamos
   * nuestro sistema visual provisional.
   */
  const svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1200"
      height="900"
      viewBox="0 0 1200 900"
    >
      <defs>
        <linearGradient
          id="background"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop
            offset="0%"
            stop-color="${selectedCover.accent}"
            stop-opacity="0.18"
          />
          <stop
            offset="100%"
            stop-color="${selectedCover.accent}"
            stop-opacity="0.04"
          />
        </linearGradient>
      </defs>

      <rect
        width="1200"
        height="900"
        fill="#FFFFFF"
      />

      <rect
        width="1200"
        height="900"
        fill="url(#background)"
      />

      <circle
        cx="950"
        cy="220"
        r="180"
        fill="${selectedCover.accent}"
        opacity="0.12"
      />

      <circle
        cx="300"
        cy="720"
        r="230"
        fill="${selectedCover.accent}"
        opacity="0.08"
      />

      <rect
        x="480"
        y="300"
        width="240"
        height="240"
        rx="60"
        fill="${selectedCover.accent}"
        opacity="0.12"
      />

      <path
        d="M545 350
           C545 315 590 300 600 345
           C610 300 655 315 655 350
           V505
           C655 530 625 545 600 515
           C575 545 545 530 545 505 Z"
        fill="none"
        stroke="${selectedCover.accent}"
        stroke-width="18"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;

  const dataUrl =
    `data:image/svg+xml;charset=UTF-8,` +
    encodeURIComponent(svg);

  setCoverImageUrl(dataUrl);
  setIsCoverModalOpen(false);
  setSelectedCover(null);
}

  return (
    <div className="min-h-screen bg-[#F7F1E7]">

      {/* =========================================================
          SIDEBAR PRINCIPAL DEL EDITOR
      ========================================================= */}
      <aside className="fixed left-0 top-0 z-[60] flex h-screen w-[88px] flex-col border-r border-[#E5E7EB] bg-white">

        {/* LOGO / IDENTIDAD */}
        <div className="flex h-20 items-center justify-center border-b border-[#E5E7EB]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF2F7]">
            <span className="text-lg font-semibold text-[#7D5DFF]">
              A
            </span>
          </div>
        </div>

        {/* HERRAMIENTAS */}
        <nav className="flex flex-1 flex-col items-center gap-3 px-2 py-5">

          {/* EDITAR */}
          <button
            type="button"
            onClick={() => setActiveSection("edit")}
            className={`group flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition ${
              activeSection === "edit"
                ? "bg-[#EEF2F7] text-[#7D5DFF]"
                : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#7D5DFF]"
            }`}
          >
            <Pencil className="h-5 w-5" />

            <span
              className={`text-[11px] leading-tight ${
                activeSection === "edit"
                  ? "font-semibold"
                  : "font-medium"
              }`}
            >
              Editar
            </span>
          </button>


          {/* COMPARTIR */}
          <button
            type="button"
            onClick={() => setActiveSection("share")}
            className={`group flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition ${
              activeSection === "share"
                ? "bg-[#EEF2F7] text-[#7D5DFF]"
                : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#7D5DFF]"
            }`}
          >
            <Share2 className="h-5 w-5" />

            <span
              className={`text-[11px] leading-tight ${
                activeSection === "share"
                  ? "font-semibold"
                  : "font-medium"
              }`}
            >
              Compartir
            </span>
          </button>


          {/* PUBLICAR */}
          <button
            type="button"
            onClick={() => setActiveSection("publish")}
            className={`group flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-3 transition ${
              activeSection === "publish"
                ? "bg-[#EEF2F7] text-[#7D5DFF]"
                : "text-[#6B7280] hover:bg-[#F7F8FA] hover:text-[#7D5DFF]"
            }`}
          >
            <Globe2 className="h-5 w-5" />

            <span
              className={`text-[11px] leading-tight ${
                activeSection === "publish"
                  ? "font-semibold"
                  : "font-medium"
              }`}
            >
              Publicar
            </span>
          </button>

        </nav>

      </aside>


      {/* =========================================================
          PANEL DE EDICIÓN
      ========================================================= */}
      <aside className="fixed left-[88px] top-0 z-50 h-screen w-[300px] overflow-y-auto border-r border-[#E5E7EB] bg-white">

        {/* HEADER DEL PANEL */}
        {/* HEADER DEL PANEL */}
<div className="border-b border-[#E5E7EB] px-5 py-6">

  <button
    type="button"
    onClick={() =>
      router.push(
        `/teacher/subjects/${hypertext.subject.id}?tab=informacion`,
      )
    }
    className="group mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#6B7280] transition-colors hover:text-[#7D5DFF]"
  >
    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
    Volver a la materia
  </button>

  <p className="text-xs font-medium text-gray-500">
    Editando
  </p>

  <h1 className="mt-1 truncate text-base font-semibold text-[#1E2430]">
    {hypertext.title}
  </h1>

  <p className="mt-2 text-xs leading-5 text-gray-500">
    Personaliza la apariencia de tu hipertexto.
  </p>

</div>


        {/* =======================================================
            PANEL EDITAR
        ======================================================= */}
        {activeSection === "edit" && (
          <div className="px-5 py-6">

            {/* ===================================================
                APARIENCIA
            =================================================== */}
            <section className="mt-8 border-t border-[#E5E7EB] pt-8">

  <h3 className="text-sm font-medium text-[#1E2430]">
    Elementos visuales
  </h3>

  <p className="mt-1 text-xs leading-5 text-gray-500">
    Personaliza los elementos visuales principales de tu
    hipertexto.
  </p>


  {/* ===================================================
      PORTADA
  =================================================== */}
  <div className="mt-5">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm font-medium text-[#1E2430]">
          Portada
        </p>

        <p className="mt-0.5 text-[11px] text-gray-400">
          Imagen principal del hipertexto
        </p>
      </div>

    </div>


    {/* PREVIEW */}
    <div
      className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[#E5E7EB]"
      style={{
        background:
          "linear-gradient(135deg, #F3EFFF, #EEF2F7)",
      }}
    >

      {coverImageUrl ? (
        <img
          src={coverImageUrl}
          alt="Portada del hipertexto"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center">

          <ImageIcon className="h-8 w-8 text-[#9CA3AF]" />

          <p className="mt-2 text-xs text-[#9CA3AF]">
            Sin portada
          </p>

        </div>
      )}

    </div>


    {/* BOTÓN */}
    <button
      type="button"
      onClick={() => setIsCoverModalOpen(true)}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#1E2430] transition hover:border-[#D8DCE3] hover:bg-[#FAFAFB]"
    >
      <ImageIcon className="h-4 w-4 text-[#7D5DFF]" />
      Cambiar portada
    </button>

  </div>

</section>


            {/* ===================================================
                PALETA
            =================================================== */}
            <section className="mt-8">

              <div className="flex items-center justify-between">

                <h3 className="text-sm font-medium text-[#1E2430]">
                  Paleta
                </h3>

                <span className="text-[11px] text-gray-400">
                  Aura Atlas
                </span>

              </div>


              <div className="mt-4 grid grid-cols-3 gap-3">

                {PALETTES.map((palette) => {
                  const isSelected =
                    selectedPalette?.id === palette.id;

                  return (
                    <button
                      key={palette.id}
                      type="button"
                      title={palette.name}
                      aria-label={`Seleccionar paleta ${palette.name}`}
                      onClick={() =>
                        handlePaletteChange(palette)
                      }
                      className={`group relative h-12 overflow-hidden rounded-xl border transition hover:scale-[1.03] ${
                        isSelected
                          ? "border-[#7D5DFF] ring-2 ring-[#7D5DFF]/20"
                          : "border-[#E5E7EB]"
                      }`}
                    >

                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: palette.secondary,
                        }}
                      />

                      <div
                        className="absolute inset-y-0 left-0 w-1/2 rounded-r-full"
                        style={{
                          backgroundColor: palette.primary,
                        }}
                      />

                      {isSelected && (
                        <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                          <Check className="h-3 w-3 text-[#7D5DFF]" />
                        </div>
                      )}

                    </button>
                  );
                })}

              </div>


              {selectedPalette && (
                <p className="mt-3 text-[11px] text-gray-400">
                  {selectedPalette.name}
                </p>
              )}

            </section>


            {/* ===================================================
                TIPOGRAFÍA
            =================================================== */}
            <section className="mt-8">

              <h3 className="text-sm font-medium text-[#1E2430]">
                Tipografía
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Elige la tipografía principal de tu hipertexto.
              </p>


              <div className="mt-3 space-y-2">

                {FONT_OPTIONS.map((font) => {
                  const isSelected =
                    fontFamily === font.id;

                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() =>
                        setFontFamily(font.id)
                      }
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left transition ${
                        isSelected
                          ? "border-[#7D5DFF] bg-[#F8F7FF]"
                          : "border-[#E5E7EB] bg-white hover:border-[#D8DCE3] hover:bg-[#FAFAFB]"
                      }`}
                    >

                      <div>

                        <p
                          className="text-sm font-medium text-[#1E2430]"
                          style={{
                            fontFamily: font.id,
                          }}
                        >
                          {font.name}
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          {font.category}
                        </p>

                      </div>


                      {isSelected && (
                        <Check className="h-4 w-4 text-[#7D5DFF]" />
                      )}

                    </button>
                  );
                })}

              </div>

            </section>


            {/* ===================================================
                TEMA
            =================================================== */}
            <section className="mt-8 border-t border-[#E5E7EB] pt-8">

              <h3 className="text-sm font-medium text-[#1E2430]">
                Tema
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Define si tu hipertexto se mostrará en modo
                claro u oscuro.
              </p>


              <div className="mt-3 grid grid-cols-2 gap-2">

                <button
                  type="button"
                  onClick={() => setTheme("LIGHT")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition ${
                    theme === "LIGHT"
                      ? "border-[#7D5DFF] bg-[#F8F7FF] text-[#7D5DFF]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#FAFAFB]"
                  }`}
                >
                  <Sun className="h-4 w-4" />
                  Claro
                </button>


                <button
                  type="button"
                  onClick={() => setTheme("DARK")}
                  className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition ${
                    theme === "DARK"
                      ? "border-[#7D5DFF] bg-[#F8F7FF] text-[#7D5DFF]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#FAFAFB]"
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  Oscuro
                </button>

              </div>

            </section>


          </div>
        )}



        {/* =======================================================
            PANEL COMPARTIR
        ======================================================= */}
        {activeSection === "share" && (
          <div className="px-5 py-6">

            <h2 className="text-sm font-semibold text-[#1E2430]">
              Compartir
            </h2>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Comparte tu hipertexto cuando esté publicado.
            </p>


            <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] p-4">

              <p className="text-xs font-medium text-[#1E2430]">
                Estado
              </p>

              <p className="mt-1 text-xs text-gray-500">
                {hypertext.isPublished
                  ? "Tu hipertexto está publicado."
                  : "Tu hipertexto todavía no está publicado."}
              </p>

            </div>

          </div>
        )}


        {/* =======================================================
            PANEL PUBLICAR
        ======================================================= */}
        {activeSection === "publish" && (
          <div className="px-5 py-6">

            <h2 className="text-sm font-semibold text-[#1E2430]">
              Publicar hipertexto
            </h2>

            <p className="mt-1 text-xs leading-5 text-gray-500">
              Cuando publiques tu hipertexto, los estudiantes
              podrán acceder a él mediante su enlace público.
            </p>


            <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F8F9FB] p-4">

              <div className="flex items-center gap-2">

                <Globe2 className="h-4 w-4 text-[#7D5DFF]" />

                <p className="text-xs font-medium text-[#1E2430]">
                  Estado de publicación
                </p>

              </div>


              <p className="mt-2 text-xs leading-5 text-gray-500">
                {isPublished
  ? "Este hipertexto ya está publicado."
  : "Este hipertexto aún no ha sido publicado."}
              </p>

            </div>


            <button
  type="button"
  onClick={handlePublish}
  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7D5DFF] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#6E4FE8]"
>
              <Globe2 className="h-4 w-4" />
              {isPublished
  ? "Hipertexto publicado"
  : "Publicar hipertexto"}
            </button>

            {isPublished && publicUrl && (
  <div className="mt-4 space-y-3">
    <div>
      <p className="text-xs font-medium text-[#1E2430]">
        Enlace público
      </p>

      <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FAFAFB] p-2">
        <div className="min-w-0 flex-1 px-2">
          <p
            className="truncate text-xs text-[#6B7280]"
            title={`${window.location.origin}${publicUrl}`}
          >
            {`${window.location.origin}${publicUrl}`}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition hover:bg-white"
          aria-label="Copiar enlace público"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4 text-[#6B7280]" />
          )}
        </button>
      </div>
    </div>

    <button
      type="button"
      onClick={() => {
        const fullUrl =
          `${window.location.origin}${publicUrl}`;

        window.open(
          fullUrl,
          "_blank",
          "noopener,noreferrer",
        );
      }}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-medium text-[#1E2430] transition hover:bg-[#FAFAFB]"
    >
      Ver hipertexto
      <ExternalLink className="h-4 w-4" />
    </button>
  </div>
)}

          </div>
        )}

      </aside>

      {/* =========================================================
    MODAL — ELEGIR PORTADA
========================================================= */}
{isCoverModalOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">

    <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">

        <div>
          <h2 className="text-base font-semibold text-[#1E2430]">
            Elegir portada
          </h2>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            Selecciona una portada para representar tu hipertexto.
          </p>
        </div>


        <button
          type="button"
          onClick={() => {
            setIsCoverModalOpen(false);
            setSelectedCover(null);
          }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#F7F8FA] hover:text-[#1E2430]"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

      </div>


      {/* CONTENIDO */}
      <div className="px-6 py-6">

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">

          {COVER_OPTIONS.map((cover) => {
            const isSelected =
              selectedCover?.id === cover.id;

            return (
              <button
                key={cover.id}
                type="button"
                onClick={() => setSelectedCover(cover)}
                className={`group relative overflow-hidden rounded-2xl border text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  isSelected
                    ? "border-[#7D5DFF] ring-2 ring-[#7D5DFF]/20"
                    : "border-[#E5E7EB]"
                }`}
              >

                {/* PREVIEW */}
                <div
                  className="aspect-[4/3] w-full"
                  style={{
                    background: cover.background,
                  }}
                >

                  <div className="flex h-full items-center justify-center">

                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: `${cover.accent}20`,
                      }}
                    >
                      <ImageIcon
                        className="h-6 w-6"
                        style={{
                          color: cover.accent,
                        }}
                      />
                    </div>

                  </div>

                </div>


                {/* NOMBRE */}
                <div className="flex items-center justify-between px-3 py-2.5">

                  <span className="text-xs font-medium text-[#1E2430]">
                    {cover.name}
                  </span>

                  {isSelected && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7D5DFF]">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}

                </div>

              </button>
            );
          })
          
          
          }

          {/* ===================================================
    PORTADAS ILUSTRADAS
=================================================== */}
<div className="col-span-full mt-4">

  <div className="mb-4">
    <h3 className="text-sm font-semibold text-[#1E2430]">
      Portadas ilustradas
    </h3>

    <p className="mt-1 text-xs text-gray-500">
      Elige una portada ilustrada para tu hipertexto.
    </p>
  </div>

  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">

    {ILLUSTRATED_COVERS.map((cover, index) => {
      const isSelected =
        selectedCover?.id === `illustrated-${index + 1}`;

      return (
        <button
          key={cover}
          type="button"
          onClick={() =>
            setSelectedCover({
  id: `illustrated-${index + 1}`,
  name: `Portada ${index + 1}`,
  background: `url(${cover})`,
  accent: primaryColor,
  imageUrl: cover,
})
          }
          className={`group relative overflow-hidden rounded-2xl border transition hover:-translate-y-0.5 hover:shadow-md ${
            isSelected
              ? "border-[#7D5DFF] ring-2 ring-[#7D5DFF]/20"
              : "border-[#E5E7EB]"
          }`}
        >

          <div className="aspect-[4/3] w-full overflow-hidden bg-[#F7F8FA]">

            <img
              src={cover}
              alt={`Portada ilustrada ${index + 1}`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />

          </div>

          {isSelected && (
            <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#7D5DFF] shadow-sm">
              <Check className="h-3.5 w-3.5 text-white" />
            </div>
          )}

        </button>
      );
    })}

  </div>

</div>

        </div>

      </div>


      {/* FOOTER */}
      <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-6 py-4">

        <button
          type="button"
          onClick={() => {
            setIsCoverModalOpen(false);
            setSelectedCover(null);
          }}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-[#6B7280] transition hover:bg-[#F7F8FA]"
        >
          Cancelar
        </button>


        <button
          type="button"
          disabled={!selectedCover}
          onClick={handleCoverApply}
          className="rounded-xl bg-[#7D5DFF] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#6E4FE8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Aplicar portada
        </button>

      </div>

    </div>

  </div>
)}


      {/* =========================================================
          ÁREA PRINCIPAL DEL HIPERTEXTO
      ========================================================= */}
      <main className="ml-[388px] min-h-screen">

        <HypertextRenderer
          hypertext={previewHypertext}
          mode="editor"
        />

      </main>

    </div>
  );
}
