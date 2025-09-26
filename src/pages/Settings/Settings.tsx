import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [id, setId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);

  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      navigate("/");
      return;
    }
    const user = JSON.parse(userStr);
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setProfilePicture(user.profilePicture || null);
    setId(user.id || "");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axiosInstance.put(
        "/users/profile",
        { fullName, email },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Perfil actualizado correctamente");

      if (response?.data?.user) {
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        setProfilePicture(response.data.user.profilePicture || null);
      }

      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Error al actualizar el perfil", {
        description:
          error?.response?.data?.message || "Intenta nuevamente más tarde",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten archivos de imagen");
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede ser mayor a 5MB");
      return;
    }

    setIsUploadingPicture(true);

    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axiosInstance.post(
        "/users/profile-picture",
        formData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Foto de perfil actualizada correctamente");

      if (response?.data?.user) {
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        setProfilePicture(response.data.user.profilePicture || null);
      }
    } catch (error: any) {
      toast.error("Error al actualizar la foto de perfil", {
        description:
          error?.response?.data?.message || "Intenta nuevamente más tarde",
      });
    } finally {
      setIsUploadingPicture(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Configuración de perfil</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Foto de perfil */}
          <div className="flex flex-col items-center space-y-4 pb-6 border-b">
            <div className="relative">
              <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage
                  src={
                    profilePicture
                      ? `${
                          import.meta.env.VITE_API_URL ||
                          "http://localhost:3000/"
                        }${profilePicture.slice(1)}`
                      : undefined
                  }
                  alt="Foto de perfil"
                />
                <AvatarFallback className="text-lg">
                  {fullName ? (
                    getInitials(fullName)
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="profile-picture"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="profile-picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePictureChange}
                  disabled={isUploadingPicture}
                />
              </label>
            </div>
            <p>
              <b>Id: </b>{id}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-6">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                required
                minLength={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="flex justify-end gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
