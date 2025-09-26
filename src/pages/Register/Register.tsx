import { RegisterFormAtleta } from "./components/RegisterFormAtleta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RegisterFormCoach } from "./components/RegisterFormCoach";
import { Link } from "react-router";
export default function Register() {
  return (
    <main className="flex flex-col md:flex-row-reverse h-screen">
      {/* Columna del formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-12 bg-white overflow-y-auto">
        <div className="w-full max-w-lg space-y-8 py-8">
          <div className="text-left">
            <h1 className="text-4xl font-bold text-primary mb-2">Registrarse</h1>
            <p className="text-gray-600">Únete a nuestra comunidad</p>
          </div>

          <Tabs defaultValue="athlete" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="athlete" className="cursor-pointer">
                Atleta
              </TabsTrigger>
              <TabsTrigger value="coach" className="cursor-pointer">
                Entrenador
              </TabsTrigger>
            </TabsList>

            <TabsContent value="athlete" className="mt-6">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <CardTitle className="text-xl">Registro de Atleta</CardTitle>
                  <CardDescription className="text-sm">
                    Completa los siguientes campos. Si tienes el ID de tu entrenador,
                    ingrésalo; de lo contrario, puedes configurarlo después.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <RegisterFormAtleta />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coach" className="mt-6">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0">
                  <CardTitle className="text-xl">Registro de Entrenador</CardTitle>
                  <CardDescription className="text-sm">
                    Completa los siguientes campos para crear tu cuenta de entrenador.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <RegisterFormCoach />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="text-center">
            <Link to="/">
              <Label className="text-primary hover:underline cursor-pointer">
                ¿Ya tienes una cuenta? Inicia sesión
              </Label>
            </Link>
          </div>
        </div>
      </div>

      {/* Columna de la imagen */}
      <div className="w-full md:w-1/2 relative md:block hidden">
        <img
          className="w-full h-full object-cover brightness-50"
          src="https://images.unsplash.com/photo-1595905492198-262c337b9567?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Imagen de fondo"
        />
        <img
          src="/logo.png"
          alt="Logo"
          className="w-32 h-32 absolute bottom-8 right-8 opacity-90"
        />
      </div>
    </main>
  );
}
