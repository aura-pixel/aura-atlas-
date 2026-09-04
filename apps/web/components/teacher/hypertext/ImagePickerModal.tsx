"use client";

import {
  Check,
  ImageIcon,
  Search,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type ImagePickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (imageUrl: string | null) => void;
  initialImageUrl?: string | null;
  libraryImages?: string[];
  title?: string;
  description?: string;
};

type Tab = "library" | "upload" | "online";

export function ImagePickerModal({
  isOpen,
  onClose,
  onApply,
  initialImageUrl = null,
  libraryImages = [],
  title = "Agregar imagen",
  description = "Selecciona una imagen para personalizar esta sección.",
}: ImagePickerModalProps) {
  const [activeTab, setActiveTab] =
    useState<Tab>("library");

  const [selectedImage, setSelectedImage] =
    useState<string | null>(
      initialImageUrl,
    );

  const [uploadedImage, setUploadedImage] =
    useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(initialImageUrl);
      setUploadedImage(null);
      setActiveTab("library");
    }
  }, [isOpen, initialImageUrl]);

  useEffect(() => {
    return () => {
      if (uploadedImage?.startsWith("blob:")) {
        URL.revokeObjectURL(uploadedImage);
      }
    };
  }, [uploadedImage]);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    if (uploadedImage?.startsWith("blob:")) {
      URL.revokeObjectURL(uploadedImage);
    }

    const previewUrl =
      URL.createObjectURL(file);

    setUploadedImage(previewUrl);
    setSelectedImage(previewUrl);
  };

  const handleApply = () => {
    onApply(selectedImage);
    onClose();
  };

  const tabs = [
    {
      id: "library" as const,
      label: "Biblioteca",
      icon: ImageIcon,
    },
    {
      id: "upload" as const,
      label: "Subir imagen",
      icon: Upload,
    },
    {
      id: "online" as const,
      label: "Buscar en línea",
      icon: Search,
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E5E7EB] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#1E2430]">
              {title}
            </h2>

            <p className="mt-1 text-sm text-[#6B7280]">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#1E2430]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#E5E7EB] px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition"
                  style={{
                    color: isActive
                      ? "#7D5DFF"
                      : "#6B7280",
                  }}
                >
                  <Icon className="h-4 w-4" />

                  {tab.label}

                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                      style={{
                        backgroundColor:
                          "#7D5DFF",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[360px] flex-1 overflow-y-auto px-6 py-6">
          {/* Biblioteca */}
          {activeTab === "library" && (
            <>
              {libraryImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {libraryImages.map(
                    (imageUrl, index) => {
                      const isSelected =
                        selectedImage ===
                        imageUrl;

                      return (
                        <button
                          key={`${imageUrl}-${index}`}
                          type="button"
                          onClick={() =>
                            setSelectedImage(
                              imageUrl,
                            )
                          }
                          className="group relative aspect-[4/3] overflow-hidden rounded-2xl border-2 bg-[#F8F9FB] transition hover:-translate-y-0.5 hover:shadow-md"
                          style={{
                            borderColor:
                              isSelected
                                ? "#7D5DFF"
                                : "#E5E7EB",
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={`Imagen ${index + 1}`}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />

                          {isSelected && (
                            <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
                              <Check
                                className="h-4 w-4"
                                style={{
                                  color:
                                    "#7D5DFF",
                                }}
                              />
                            </div>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8DCE3] bg-[#FAFAFB] text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2F7]">
                    <ImageIcon className="h-6 w-6 text-[#9CA3AF]" />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#1E2430]">
                    Tu biblioteca está vacía
                  </p>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-[#9CA3AF]">
                    Puedes subir una imagen para
                    comenzar a personalizar tu
                    hipertexto.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Subir */}
          {activeTab === "upload" && (
            <label className="flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8DCE3] bg-[#FAFAFB] px-6 text-center transition hover:border-[#CFC7FF] hover:bg-[#FCFBFF]">
              {uploadedImage ? (
                <>
                  <div className="relative aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl">
                    <img
                      src={uploadedImage}
                      alt="Vista previa"
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#1E2430]">
                    Imagen seleccionada
                  </p>

                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Haz clic para elegir otra
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Upload
                      className="h-6 w-6"
                      style={{
                        color: "#7D5DFF",
                      }}
                    />
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#1E2430]">
                    Sube una imagen
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#9CA3AF]">
                    Haz clic aquí para seleccionar
                    una imagen desde tu dispositivo.
                  </p>

                  <span className="mt-4 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-[#7D5DFF] shadow-sm">
                    Seleccionar archivo
                  </span>
                </>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}

          {/* Buscar en línea */}
          {activeTab === "online" && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#D8DCE3] bg-[#FAFAFB] px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                <Search
                  className="h-6 w-6"
                  style={{
                    color: "#7D5DFF",
                  }}
                />
              </div>

              <p className="mt-4 text-sm font-semibold text-[#1E2430]">
                Buscar imágenes en línea
              </p>

              <p className="mt-1 max-w-sm text-xs leading-5 text-[#9CA3AF]">
                Esta función estará disponible
                próximamente.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-6 py-4">
          <button
            type="button"
            onClick={() => {
              setSelectedImage(null);
              onApply(null);
              onClose();
            }}
            className="text-sm font-medium text-[#6B7280] transition hover:text-[#1E2430]"
          >
            Quitar imagen
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E5E7EB] px-4 py-2.5 text-sm font-medium text-[#6B7280] transition hover:bg-[#F8F9FB]"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              style={{
                backgroundColor: "#7D5DFF",
              }}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}