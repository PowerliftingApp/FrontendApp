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
import { LoginFormSchema } from "../schemas/LoginForm.schema";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";

export function LoginForm() {
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof LoginFormSchema>) {
    setIsLoading(true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + "auth/login",
        data
      );

      if (response.status === 401) {
        toast("Por favor, activa tu cuenta antes de iniciar sesión", {
          description: "Revisa tu correo para activar tu cuenta",
        });
      }

      if (response.status === 201) {
        sessionStorage.setItem("token", response.data.access_token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      toast.error("Ocurrió un error al iniciar sesión", {
        description: error.response?.data.message,
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
                <Link to="/password-recovery">
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
