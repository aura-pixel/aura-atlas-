"use client";

import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";

type ImageUploadProps = {
  label: string;
  helperText?: string;
  value: File | null;
  onChange: (file: File | null) => void;
};

export function ImageUpload({
  label,
  helperText,
  value,
  onChange,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(value);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Solo se permiten imágenes.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no puede superar los 5 MB.");
      return;
    }

    onChange(file);
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium">
          {label}
        </label>

        {helperText && (
          <p className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>

      <label className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 transition hover:border-primary hover:bg-primary/5">
        {preview ? (
          <img
            src={preview}
            alt="Vista previa"
            className="h-full w-full rounded-xl object-contain p-4"
          />
        ) : (
          <>
            <ImagePlus className="mb-4 h-10 w-10 text-muted-foreground" />

            <p className="font-medium">
              Selecciona una imagen
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              PNG, JPG o SVG (máx. 5 MB)
            </p>
          </>
        )}

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
    
  );
}