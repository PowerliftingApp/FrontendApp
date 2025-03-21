import { PasswordRecoveryForm } from "./components/PasswordRecoveryForm";

export default function PasswordRecovery() {
  return (
    <main className="flex flex-col gap-y-16 items-center justify-center max-w-2xl mx-auto h-full my-20">
      <h1 className="text-5xl font-bold text-primary">Recuperar contraseña</h1>
      <PasswordRecoveryForm />
    </main>
  );
}
