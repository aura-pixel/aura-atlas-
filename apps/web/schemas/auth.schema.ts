import { z } from "zod";

const email = z.email("Correo electrónico inválido.");

const password = z
  .string()
  .max(72).min(12, "La contraseña debe tener al menos 12 caracteres.");

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres."),

  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(72),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;