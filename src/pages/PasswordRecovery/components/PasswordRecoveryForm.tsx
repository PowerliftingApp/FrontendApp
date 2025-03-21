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
import { useNavigate } from "react-router";

import { useState } from "react";
import { PasswordRecoverySchema } from "../schemas/PasswordRecovery.schema";

export function PasswordRecoveryForm() {
  const form = useForm<z.infer<typeof PasswordRecoverySchema>>({
    resolver: zodResolver(PasswordRecoverySchema),
    defaultValues: {
      email: "",
    },
  });

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof PasswordRecoverySchema>) {
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
