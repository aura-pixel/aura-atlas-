"use client";

import { ImagePlus } from "lucide-react";

type UnitImageProps = {
  imageUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  onClick?: () => void;
};

export function UnitImage({
  imageUrl,
  primaryColor = "#7D5DFF",
  secondaryColor = "#5EE1E6",
  onClick,
}: UnitImageProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-[230px] w-full max-w-[300px] overflow-hidden rounded-[2rem] border border-dashed border-[#D8DCE3] bg-[#FAFAFB] text-left transition-all duration-300 hover:-translate-y-1 hover:border-[#CFC7FF] hover:bg-white hover:shadow-lg"
      style={{
        background: imageUrl
          ? "#FFFFFF"
          : `linear-gradient(
              135deg,
              ${secondaryColor}18,
              ${primaryColor}08
            )`,
      }}
    >
      {imageUrl ? (
        <>
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
            <div className="translate-y-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-semibold text-[#1E2430] opacity-0 shadow-sm transition group-hover:translate-y-0 group-hover:opacity-100">
              Cambiar imagen
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="absolute -right-12 -top-14 h-32 w-32 rounded-full opacity-20"
            style={{
              backgroundColor: primaryColor,
            }}
          />

          <div
            className="absolute -bottom-16 -left-12 h-36 w-36 rounded-full opacity-20"
            style={{
              backgroundColor: secondaryColor,
            }}
          />

          <div className="relative flex h-full w-full flex-col items-center justify-center gap-3">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-105"
              style={{
                color: primaryColor,
              }}
            >
              <ImagePlus className="h-6 w-6" />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-[#1E2430]">
                Agregar imagen
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                Personaliza esta unidad
              </p>
            </div>
          </div>
        </>
      )}
    </button>
  );
}