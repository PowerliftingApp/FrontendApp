"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
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
import { ResetPasswordSchema } from "../schemas/ResetPassword.schema";
import axios from "axios";
import { useNavigate } from "react-router";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof ResetPasswordSchema>) {
    try {
      setIsLoading(true);

      if (!token) {
        navigate("/password-recovery");
        return;
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}users/reset-password`,
        { newPassword: data.password, token: token }
      );

      if (response.status === 201) {
        toast.success("Contraseña actualizada exitosamente");
        form.reset();
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error("El enlace ha expirado o no es válido");
        navigate("/password-recovery");
      } else {
        toast.error("Ha ocurrido un error al actualizar la contraseña");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 mx-auto space-y-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nueva contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmar contraseña</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <LoadingButton loading={isLoading} type="submit" className="w-full">
          Cambiar contraseña
        </LoadingButton>
      </form>
    </Form>
  );
}
