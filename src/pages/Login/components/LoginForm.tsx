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
import { Link, useNavigate } from "react-router";

import { useState } from "react";
import { LoginFormSchema } from "../schema/LoginForm.schema";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Extraer la logica de esta funcion a un hook o servicio separado
  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    console.log(data);
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
            name="username"
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
                <Link to="/">
                  <Label className="text-gray-400 hover:underline cursor-pointer items-end justify-self-end mt-2">
                    Olvidé mi contraseña
                  </Label>
                </Link>
              </FormItem>
            )}
          />

          <LoadingButton loading={isLoading} type="submit" className="w-full">
            Iniciar sesión
          </LoadingButton>
        </form>
      </Form>
    </>
  );
}
