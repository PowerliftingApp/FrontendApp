import { useState } from "react";
import { RegisterFormAtleta } from "./components/RegisterFormAtleta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterFormCoach } from "./components/RegisterFormCoach";
import { Link } from "react-router";
export default function Register() {
  const [selectedRole, setSelectedRole] = useState("athlete");

  return (
    <main className="flex flex-col gap-y-16 items-center justify-center max-w-2xl mx-auto h-screen">
      <h1 className="text-5xl font-bold text-primary">Registrarse</h1>

      <Tabs defaultValue="athlete" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="athlete" className="cursor-pointer">
            Atleta
          </TabsTrigger>
          <TabsTrigger value="coach" className="cursor-pointer">
            Entrenador
          </TabsTrigger>
        </TabsList>
        <TabsContent value="athlete">
          <Card>
            <CardHeader>
              <CardTitle>Atleta</CardTitle>
              <CardDescription>
                Para registrarte como atleta, completa los siguientes campos. Si
                tienes el id de tu entrenador, ingrésalo, de lo contrario,
                déjalo en blanco y configuralo despues.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <RegisterFormAtleta />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="coach">
          <Card>
            <CardHeader>
              <CardTitle>Entrenador</CardTitle>
              <CardDescription>
                Para registrarte como entrenador, completa los siguientes campos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <RegisterFormCoach />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Link to="/">
        <Label className="text-primary hover:underline cursor-pointer">¿Ya tienes una cuenta? Inicia sesión</Label>
      </Link>
    </main>
  );
}
