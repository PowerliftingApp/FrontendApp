import { z } from "zod";

// Esquema de validación para el formulario de inicio de sesión
export const LoginFormSchema = z.object({
  email: z.string().email({
    message: "Ingresa un correo electrónico válido.",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
});
