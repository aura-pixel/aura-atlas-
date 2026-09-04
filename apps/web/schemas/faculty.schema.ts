import { z } from "zod";

export const facultySchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres.")
    .max(120),

  abbreviation: z
    .string()
    .max(20)
    .optional()
    .or(z.literal("")),

  description: z
    .string()
    .max(500)
    .optional()
    .or(z.literal("")),

  color: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type FacultySchema = z.infer<typeof facultySchema>;