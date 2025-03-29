import { Button } from "@/components/ui/button";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

export default function VerifyAccount() {
  const [activatedAccount, setActivatedAccount] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtener el token de la URL
  const { token } = useParams();

  if (!token) {
    console.error("No se ha proporcionado un token de activación.");
    return;
  }

  const handleVerifyAccount = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}users/activate/${token}`
      );

      if (response.status === 200) {
        console.log(response.data.message);
        setActivatedAccount(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      handleVerifyAccount();
    }
  }, []);

  return (
    <main className="flex flex-col gap-y-6 items-center justify-center max-w-2xl mx-auto h-screen">
      {loading && (
        <>
          <h1 className="text-5xl font-bold text-primary">Activando cuenta</h1>
          <LoaderCircle className="animate-spin w-10 h-10" />
        </>
      )}
      {!loading && activatedAccount && (
        <>
          <h1 className="text-5xl font-bold text-primary">Cuenta activada</h1>
          <p className="text-lg text-center">
            Tu cuenta ha sido activada correctamente. Ahora puedes iniciar
            sesión.
          </p>
          <Button>
            <Link to="/">Iniciar sesión</Link>
          </Button>
        </>
      )}
      {!loading && !activatedAccount && (
        <>
          <h1 className="text-5xl font-bold text-primary">
            Error al activar cuenta
          </h1>
          <p className="text-lg text-center">
            Ha ocurrido un error al activar tu cuenta. Por favor, intenta
            nuevamente.
          </p>
        </>
      )}
    </main>
  );
}
