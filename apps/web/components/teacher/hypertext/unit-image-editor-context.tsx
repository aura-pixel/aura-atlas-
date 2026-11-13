"use client";
import { createContext } from "react";
export type UnitImageRequest = {
  unitId: string;
  title: string;
  imageUrl: string | null;
  preview: (url: string | null | undefined) => void;
  apply: (url: string | null) => Promise<void>;
  upload: (file: File) => Promise<void>;
};
export const UnitImageEditorContext = createContext<
  ((request: UnitImageRequest) => void) | null
>(null);
