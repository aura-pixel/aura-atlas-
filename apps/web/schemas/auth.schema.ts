import { z } from "zod";

const email = z.email("Correo electrónico inválido.");

const password = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.");

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres."),

  email,
  password,
});

export const loginSchema = z.object({
  email,
  password,
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;