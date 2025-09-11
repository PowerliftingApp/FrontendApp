"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { LoaderCircle, User, Mail, CheckCircle, AlertCircle } from "lucide-react";

interface LinkAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface AthleteSearchResult {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  coach: string | null;
  hasCoach: boolean;
}

export function LinkAthleteModal({ isOpen, onClose, onSuccess }: LinkAthleteModalProps) {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [athleteFound, setAthleteFound] = useState<AthleteSearchResult | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleReset = () => {
    setEmail("");
    setAthleteFound(null);
    setSearchPerformed(false);
    setIsSearching(false);
    setIsLinking(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSearchAthlete = async () => {
    if (!email.trim()) {
      toast.error("Por favor ingresa un email");
      return;
    }

    setIsSearching(true);
    setSearchPerformed(true);
    setAthleteFound(null);

    try {
      const response = await axiosInstance.get(`/users/search/${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (response.data.found) {
        setAthleteFound(response.data.athlete);
      } else {
        toast.error("Atleta no encontrado", {
          description: "Verifica que el email sea correcto y que el usuario sea un atleta activo",
        });
      }
    } catch (error: any) {
      console.error("Error al buscar atleta:", error);
      toast.error("Error al buscar atleta", {
        description: error.response?.data?.message || "Intenta nuevamente",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkAthlete = async () => {
    if (!athleteFound) return;

    setIsLinking(true);

    try {
      await axiosInstance.put(`/users/athletes/${athleteFound._id}/link-coach`, {}, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      toast.success("Atleta vinculado correctamente", {
        description: `${athleteFound.fullName} ahora está vinculado a tu cuenta`,
      });

      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error("Error al vincular atleta:", error);
      toast.error("Error al vincular atleta", {
        description: error.response?.data?.message || "Intenta nuevamente",
      });
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Vincular Atleta</DialogTitle>
          <DialogDescription>
            Busca un atleta por su email para vincularlo a tu cuenta de entrenador.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email del Atleta</Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isSearching) {
                    handleSearchAthlete();
                  }
                }}
                disabled={isSearching || isLinking}
              />
              <Button 
                onClick={handleSearchAthlete} 
                disabled={isSearching || isLinking || !email.trim()}
              >
                {isSearching ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
          </div>

          {/* Resultado de la búsqueda */}
          {searchPerformed && (
            <div className="border rounded-lg p-4">
              {athleteFound ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Atleta encontrado</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{athleteFound.fullName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{athleteFound.email}</span>
                    </div>
                  </div>

                  {athleteFound.hasCoach ? (
                    <div className="flex items-center space-x-2 text-orange-600 bg-orange-50 p-2 rounded">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">Este atleta ya tiene un entrenador asignado</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-2 rounded">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Disponible para vincular</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-gray-500">
                  <AlertCircle className="h-5 w-5" />
                  <span>No se encontró ningún atleta con ese email</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSearching || isLinking}>
            Cancelar
          </Button>
          {athleteFound && !athleteFound.hasCoach && (
            <Button 
              onClick={handleLinkAthlete} 
              disabled={isLinking}
            >
              {isLinking ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                  Vinculando...
                </>
              ) : (
                "Vincular Atleta"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
