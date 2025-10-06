import { useEffect, useState } from "react";

import { ResetPasswordForm } from "./components/ResetPasswordForm";
import { useNavigate, useSearchParams } from "react-router";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isValidToken, setIsValidToken] = useState(false);
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigate("/password-recovery");
        return;
      }
    };

    setIsValidToken(true);

    verifyToken();
  }, [token, navigate]);

  if (!isValidToken) {
    return <div>Verificando token...</div>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Restablecer contraseña</h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu nueva contraseña
          </p>
        </div>
        <ResetPasswordForm token={token!} />
      </div>
    </div>
  );
} 