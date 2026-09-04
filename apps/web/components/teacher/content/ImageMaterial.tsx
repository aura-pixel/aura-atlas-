"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { API_URL } from "@/lib/config";

type Material = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  mimeType?: string | null;
};

type ImageMaterialProps = {
  materials: Material[];
  primaryColor?: string;
};

export function ImageMaterial({
  materials,
  primaryColor = "#7D5DFF",
}: ImageMaterialProps) {
  const [selectedImage, setSelectedImage] =
    useState<Material | null>(null);

  const images = materials.filter(
    (material) => material.type?.toUpperCase() === "IMAGE",
  );

  /*
   * Cerrar el lightbox con Escape
   */
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedImage(null);
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [selectedImage]);

  /*
   * No hay material visual
   */
  if (images.length === 0) {
    return (
      <section className="mt-20">
        <div>
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: `${primaryColor}12`,
              color: primaryColor,
            }}
          >
            Material visual
          </span>

          <p className="mt-5 text-sm leading-7 text-[#6B7280]">
            No hay material para visualizar en este
            tema.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* =====================================================
          MATERIAL VISUAL
      ====================================================== */}

      <section className="mt-20">
        <div className="max-w-2xl">
          <span
            className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              backgroundColor: `${primaryColor}12`,
              color: primaryColor,
            }}
          >
            Material visual
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#1E2430] md:text-4xl">
            Explora el material visual
          </h2>

          <p className="mt-4 text-sm leading-7 text-[#6B7280]">
            Consulta las imágenes proporcionadas por el
            docente para complementar este tema.
          </p>
        </div>

        {/* =================================================
            GALERÍA MASONRY
        ================================================== */}

        <div className="mt-10 columns-1 gap-5 sm:columns-2">
          {images.map((image) => {
            const imageUrl = image.url
              ? image.url.startsWith("http")
                ? image.url
                : `${API_URL}${image.url}`
              : "";

            if (!imageUrl) return null;

            return (
              <button
                key={image.id}
                type="button"
                onClick={() =>
                  setSelectedImage(image)
                }
                className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-3xl border border-[#E5E7EB] bg-[#FAFAFB] text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{
                  // El color del tema se utiliza únicamente
                  // para el estado de enfoque.
                  ["--tw-ring-color" as string]:
                    primaryColor,
                }}
                aria-label={`Ver ${image.name}`}
              >
                <img
                  src={imageUrl}
                  alt={image.name}
                  className="block h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.015]"
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          LIGHTBOX
      ====================================================== */}

      {selectedImage && selectedImage.url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.name}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedImage(null);
            }
          }}
        >
          {/* Cerrar */}
          <button
            type="button"
            onClick={() =>
              setSelectedImage(null)
            }
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white md:right-8 md:top-8"
            aria-label="Cerrar imagen"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Imagen */}
          <img
            src={
              selectedImage.url.startsWith("http")
                ? selectedImage.url
                : `${API_URL}${selectedImage.url}`
            }
            alt={selectedImage.name}
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}