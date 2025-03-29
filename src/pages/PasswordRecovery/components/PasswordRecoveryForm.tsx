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
import { PasswordRecoverySchema } from "../schemas/PasswordRecovery.schema";
import axios from "axios";

export function PasswordRecoveryForm() {
  const form = useForm<z.infer<typeof PasswordRecoverySchema>>({
    resolver: zodResolver(PasswordRecoverySchema),
    defaultValues: {
      email: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof PasswordRecoverySchema>) {
    try {
      setIsLoading(true);
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "users/recover-password",
        data
      );
      if (response.status === 201) {
        toast.success(
          "Se ha enviado un correo con las instrucciones para recuperar tu contraseña"
        );
        form.reset();
      }
      if (response.status === 404) {
        toast.error("No se encontró un usuario con ese correo electrónico");
      }
    } catch (error: any) {
      toast.error("Ha ocurrido un error al procesar tu solicitud", {
        description: error.response.data.message,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-2/3 space-y-6"
        >
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
          <LoadingButton loading={isLoading} type="submit" className="w-full">
            Recuperar contraseña
          </LoadingButton>
        </form>
      </Form>
    </>
  );
}
