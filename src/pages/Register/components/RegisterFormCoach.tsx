"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { LoadingButton } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { RegisterFormCoachSchema } from "../schemas/RegisterForm.schema";
import axios from "axios";
import { toast } from "sonner";

export function RegisterFormCoach() {
  const form = useForm<z.infer<typeof RegisterFormCoachSchema>>({
    resolver: zodResolver(RegisterFormCoachSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  async function onSubmit(data: z.infer<typeof RegisterFormCoachSchema>) {
    setIsLoading(true);

    const newUser = {
      ...data,
      role: "coach",
    };

    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "users/register",
        newUser
      );

      if (response.status === 201) {
        toast.success(
          "Usuario registrado correctamente. Por favor, revisa tu correo para activar la cuenta."
        );
        setIsRegistered(true);
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Ha ocurrido un error al registrar el usuario", {
        description: error.response.data.message,
      });
    }

    setIsLoading(false);
  }

  if (isRegistered) {
    return (
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold">¡Registro exitoso!</h2>
        <div className="space-y-2">
          <p>Hemos enviado un correo de verificación a tu dirección de email.</p>
          <p>Por favor, revisa tu bandeja de entrada y sigue el enlace para activar tu cuenta.</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Si no encuentras el correo, revisa tu carpeta de spam.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 items-start gap-x-6 space-y-6 mt-6"
      >
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre completo</FormLabel>
              <FormControl>
                <Input placeholder="José López" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo eléctronico</FormLabel>
              <FormControl>
                <Input placeholder="jlopez@gmail.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contraseña</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passwordConfirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <LoadingButton
          loading={isLoading}
          type="submit"
          className="w-full col-span-full mt-5"
        >
          Registrarse como entrenador
        </LoadingButton>
      </form>
    </Form>
  );
}
