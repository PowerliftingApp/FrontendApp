import { Link } from "react-router";
import { LoginForm } from "./components/LoginForm";
import { Label } from "@/components/ui/label";

export default function Login() {
  return (
    <main className="flex h-screen">
      {/* Columna del formulario */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-32 h-32 absolute bottom-8 right-8 opacity-90 md:hidden block"
          />
          <div className="text-left">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Iniciar sesión
            </h1>
            <p className="text-gray-600">Bienvenido de vuelta</p>
          </div>

          <LoginForm />

          <div className="text-left">
            <Link to="/register">
              <Label className="text-primary hover:underline cursor-pointer">
                ¿No tienes una cuenta? Regístrate aquí
              </Label>
            </Link>
          </div>
        </div>
      </div>

      {/* Columna de la imagen */}
      <div className="w-1/2 relative md:block hidden">
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
