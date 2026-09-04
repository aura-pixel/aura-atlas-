import { z } from "zod";

export const universitySchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres."),

  abbreviation: z
    .string()
    .min(2, "La abreviatura es obligatoria."),

  description: z.string().optional(),
});

export type UniversitySchema = z.infer<
  typeof universitySchema
>;