import { z } from "zod";

export const subjectSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio.")
    .max(150, "Máximo 150 caracteres."),

  abbreviation: z
    .string()
    .max(20, "Máximo 20 caracteres.")
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .max(500, "Máximo 500 caracteres.")
    .optional()
    .or(z.literal("")),

  color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6})$/,
      "Selecciona un color válido."
    )
    .optional()
    .or(z.literal("")),
});

export type SubjectSchema = z.infer<
  typeof subjectSchema
>;