import { z } from "zod";

export const RegisterFormAtletaSchema = z
  .object({
    fullName: z
      .string()
      .nonempty({ message: "El nombre completo es requerido" }),
    email: z
      .string()
      .email({ message: "El correo electrónico debe tener un formato válido" }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        message:
          "La contraseña debe incluir al menos una mayúscula, un número y un carácter especial",
      }),
    passwordConfirmation: z.string(),
    coach: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"], // Asociar el error al campo passwordConfirmation
  });

export const RegisterFormCoachSchema = z
  .object({
    fullName: z
      .string()
      .nonempty({ message: "El nombre completo es requerido" }),
    email: z
      .string()
      .email({ message: "El correo electrónico debe tener un formato válido" }),
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres" })
      .regex(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
        message:
          "La contraseña debe incluir al menos una mayúscula, un número y un carácter especial",
      }),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"], // Asociar el error al campo passwordConfirmation
  });
