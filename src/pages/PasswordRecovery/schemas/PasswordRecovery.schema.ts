import { z } from "zod";

// Esquema de validación para el formulario de inicio de sesión
export const PasswordRecoverySchema = z.object({
  email: z.string().email({
    message: "Ingresa un correo electrónico válido.",
  }),
});
