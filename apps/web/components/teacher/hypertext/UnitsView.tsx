"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, FileText } from "lucide-react";

import { patch } from "@/lib/api";
import { UnitImage } from "./UnitImage";
import { ImagePickerModal } from "./ImagePickerModal";

type Material = {
  id: string;
  name: string;
  type: string;
  url?: string | null;
  mimeType?: string | null;
};

type Topic = {
  id: string;
  number: string;
  title: string;
  materials?: Material[];
};

type Unit = {
  id: string;
  number: number;
  title: string;
  objective?: string | null;
  imageUrl?: string | null;
  topics?: Topic[];
};

type UnitsViewProps = {
  hypertextId: string;
  units?: Unit[];
  subjectName?: string;
  primaryColor?: string;
  secondaryColor?: string;
  onUnitSelect?: (unit: Unit) => void;
};

const UNIT_IMAGE_LIBRARY = [
  "/hypertext/covers/1.png",
  "/hypertext/covers/2.png",
  "/hypertext/covers/3.png",
  "/hypertext/covers/4.png",
  "/hypertext/covers/5.png",
  "/hypertext/covers/6.png",
  "/hypertext/covers/7.png",
  "/hypertext/covers/8.png",
];

export function UnitsView({
  hypertextId,
  units = [],
  subjectName,
  primaryColor = "#7D5DFF",
  secondaryColor = "#5EE1E6",
  onUnitSelect,
}: UnitsViewProps) {
  const [unitImages, setUnitImages] = useState<
    Record<string, string | null>
  >({});

  const [imagePickerOpen, setImagePickerOpen] =
    useState(false);

  const [selectedUnitId, setSelectedUnitId] =
    useState<string | null>(null);

  const [isSavingImage, setIsSavingImage] =
    useState(false);

  /*
   * Inicializamos las imágenes con las que vienen
   * directamente desde la base de datos.
   */
  useEffect(() => {
    const initialImages = units.reduce<
      Record<string, string | null>
    >((images, unit) => {
      images[unit.id] = unit.imageUrl ?? null;
      return images;
    }, {});

    setUnitImages(initialImages);
  }, [units]);

  const visibleUnits = units
    .map((unit) => {
      const visibleTopics =
        unit.topics?.filter(
          (topic) =>
            topic.materials &&
            topic.materials.length > 0,
        ) ?? [];

      const materialCount = visibleTopics.reduce(
        (total, topic) =>
          total + (topic.materials?.length ?? 0),
        0,
      );

      return {
        ...unit,
        visibleTopics,
        materialCount,
      };
    })
    .filter(
      (unit) => unit.visibleTopics.length > 0,
    );

  const openImagePicker = (unitId: string) => {
    setSelectedUnitId(unitId);
    setImagePickerOpen(true);
  };

  const closeImagePicker = () => {
    if (isSavingImage) {
      return;
    }

    setImagePickerOpen(false);
    setSelectedUnitId(null);
  };

  const handleImageApply = async (
    imageUrl: string | null,
  ) => {
    if (!selectedUnitId) {
      return;
    }

    /*
     * Los blob: solamente existen durante la sesión
     * actual del navegador.
     *
     * Todavía no los guardamos en BD porque después
     * necesitaremos subir el archivo a R2.
     */
    if (imageUrl?.startsWith("blob:")) {
      setUnitImages((current) => ({
        ...current,
        [selectedUnitId]: imageUrl,
      }));

      setImagePickerOpen(false);
      setSelectedUnitId(null);

      return;
    }

    try {
      setIsSavingImage(true);

      /*
       * Guardamos la URL de la imagen en la unidad.
       */
      await patch(
        `/hypertexts/${hypertextId}/units/${selectedUnitId}/image`,
        {
          imageUrl,
        },
      );

      /*
       * Actualizamos inmediatamente la vista
       * para que el cambio se refleje sin recargar.
       */
      setUnitImages((current) => ({
        ...current,
        [selectedUnitId]: imageUrl,
      }));

      setImagePickerOpen(false);
      setSelectedUnitId(null);
    } catch (error) {
      console.error(
        "Error al guardar la imagen de la unidad:",
        error,
      );

      alert(
        "No se pudo guardar la imagen de la unidad.",
      );
    } finally {
      setIsSavingImage(false);
    }
  };

  const selectedUnitImage = selectedUnitId
    ? unitImages[selectedUnitId] ?? null
    : null;

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Encabezado */}
      <div
        className="border-b border-[#E5E7EB]"
        style={{
          background: `linear-gradient(135deg, ${secondaryColor}18, ${primaryColor}08)`,
        }}
      >
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-20">
          {subjectName && (
            <p
              className="text-sm font-medium"
              style={{
                color: primaryColor,
              }}
            >
              {subjectName}
            </p>
          )}

          <p
            className="mt-6 text-xs font-bold uppercase tracking-[0.22em]"
            style={{
              color: primaryColor,
            }}
          >
            Recorrido
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#1E2430] md:text-4xl">
            Explora las unidades
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#6B7280]">
            Avanza por el contenido de la materia siguiendo
            el recorrido de aprendizaje.
          </p>
        </div>
      </div>

      {/* Recorrido */}
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
        {visibleUnits.length > 0 ? (
          <div className="relative">
            {/* Camino central */}
            <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden -translate-x-1/2 md:block">
              <svg
                width="180"
                height="100%"
                viewBox="0 0 180 1000"
                preserveAspectRatio="none"
                className="h-full w-[180px]"
              >
                <path
                  d="
                    M90 0
                    C35 80, 145 150, 90 240
                    C35 330, 145 400, 90 500
                    C35 600, 145 670, 90 760
                    C35 850, 145 920, 90 1000
                  "
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="2"
                  strokeDasharray="4 9"
                  strokeLinecap="round"
                  opacity="0.25"
                />
              </svg>
            </div>

            <div className="space-y-20 md:space-y-28">
              {visibleUnits.map((unit, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={unit.id}
                    className="relative grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-0"
                  >
                    {/* Punto del recorrido */}
                    <div
                      className="absolute left-1/2 top-1/2 z-20 hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-sm md:block"
                      style={{
                        backgroundColor:
                          primaryColor,
                      }}
                    />

                    {/* Imagen */}
                    <div
                      className={`hidden md:flex ${
                        isLeft
                          ? "md:col-start-2 md:justify-start md:pl-20"
                          : "md:col-start-1 md:justify-end md:pr-20"
                      }`}
                    >
                      <UnitImage
                        imageUrl={
                          unitImages[unit.id] ??
                          null
                        }
                        primaryColor={
                          primaryColor
                        }
                        secondaryColor={
                          secondaryColor
                        }
                        onClick={() =>
                          openImagePicker(
                            unit.id,
                          )
                        }
                      />
                    </div>

                    {/* Tarjeta */}
                    <div
                      className={`${
                        isLeft
                          ? "md:col-start-1 md:row-start-1 md:justify-self-end md:pr-20"
                          : "md:col-start-2 md:row-start-1 md:justify-self-start md:pl-20"
                      } flex`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onUnitSelect?.(unit)
                        }
                        className="group w-full max-w-[430px] text-left"
                      >
                        <div className="relative overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-[#FAFAFB] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#DCD6FF] hover:bg-white hover:shadow-xl">
                          {/* Área visual */}
                          <div
                            className="relative h-28 overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, ${secondaryColor}55, ${primaryColor}12)`,
                            }}
                          >
                            <div
                              className="absolute -right-12 -top-16 h-36 w-36 rounded-full opacity-30"
                              style={{
                                backgroundColor:
                                  primaryColor,
                              }}
                            />

                            <div
                              className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full opacity-20"
                              style={{
                                backgroundColor:
                                  secondaryColor,
                              }}
                            />

                            {/* Número */}
                            <div
                              className="absolute left-5 top-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-semibold shadow-sm"
                              style={{
                                color:
                                  primaryColor,
                              }}
                            >
                              {unit.number}
                            </div>

                            {/* Flecha */}
                            <div className="absolute bottom-5 right-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/85 shadow-sm backdrop-blur-sm">
                              <ArrowRight
                                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                style={{
                                  color:
                                    primaryColor,
                                }}
                              />
                            </div>
                          </div>

                          {/* Información */}
                          <div className="p-6">
                            <p
                              className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                              style={{
                                color:
                                  primaryColor,
                              }}
                            >
                              Unidad {unit.number}
                            </p>

                            <h3 className="mt-2 text-xl font-semibold leading-7 text-[#1E2430]">
                              {unit.title}
                            </h3>

                            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
                              {/* Temas */}
                              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                                  style={{
                                    backgroundColor: `${primaryColor}12`,
                                  }}
                                >
                                  <BookOpen
                                    className="h-3.5 w-3.5"
                                    style={{
                                      color:
                                        primaryColor,
                                    }}
                                  />
                                </div>

                                <span>
                                  {
                                    unit
                                      .visibleTopics
                                      .length
                                  }{" "}
                                  {unit
                                    .visibleTopics
                                    .length ===
                                  1
                                    ? "tema"
                                    : "temas"}
                                </span>
                              </div>

                              {/* Materiales */}
                              <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                                <div
                                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                                  style={{
                                    backgroundColor: `${secondaryColor}35`,
                                  }}
                                >
                                  <FileText
                                    className="h-3.5 w-3.5"
                                    style={{
                                      color:
                                        primaryColor,
                                    }}
                                  />
                                </div>

                                <span>
                                  {
                                    unit.materialCount
                                  }{" "}
                                  {unit.materialCount ===
                                  1
                                    ? "material"
                                    : "materiales"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>

                    {/* Imagen móvil */}
                    <div className="flex justify-center md:hidden">
                      <UnitImage
                        imageUrl={
                          unitImages[unit.id] ??
                          null
                        }
                        primaryColor={
                          primaryColor
                        }
                        secondaryColor={
                          secondaryColor
                        }
                        onClick={() =>
                          openImagePicker(
                            unit.id,
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#D8DCE3] bg-[#FAFAFB] px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEF2F7]">
              <BookOpen className="h-6 w-6 text-[#9CA3AF]" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-[#1E2430]">
              No hay unidades disponibles
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6B7280]">
              Las unidades aparecerán cuando tengan
              temas con materiales disponibles.
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          SELECTOR DE IMÁGENES
      ====================================================== */}

      <ImagePickerModal
        isOpen={imagePickerOpen}
        onClose={closeImagePicker}
        onApply={handleImageApply}
        initialImageUrl={selectedUnitImage}
        libraryImages={UNIT_IMAGE_LIBRARY}
        title={
          selectedUnitId
            ? "Imagen de la unidad"
            : "Agregar imagen"
        }
        description="Selecciona una imagen para acompañar esta unidad."
      />
    </section>
  );
}