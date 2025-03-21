import { Link } from "react-router";
import { LoginForm } from "./components/LoginForm";
import { Label } from "@/components/ui/label";

export default function Login() {
  return (
    <main className="flex flex-col gap-y-16 items-center justify-center max-w-2xl mx-auto h-full my-20">
      <h1 className="text-5xl font-bold text-primary">Iniciar sesión</h1>
      <LoginForm />
      <Link to="/register">
        <Label className="text-primary hover:underline cursor-pointer">
            ¿No tienes una cuenta? Regístrate aquí
        </Label>
      </Link>
    </main>
  );
}
