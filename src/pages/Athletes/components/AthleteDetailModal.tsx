"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { 
  LoaderCircle, 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  Clock,
  CheckCircle,
  XCircle,
  Activity
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface AthleteDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  athleteId: string | null;
}

interface AthleteDetails {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
  coach: string;
  profilePicture?: string;
  joinDate: string;
  daysSinceJoin: number;
  stats: {
    totalTrainingPlans: number;
    activePlans: number;
    completedSessions: number;
  };
}

export function AthleteDetailModal({ isOpen, onClose, athleteId }: AthleteDetailModalProps) {
  const [athlete, setAthlete] = useState<AthleteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && athleteId) {
      fetchAthleteDetails();
    }
  }, [isOpen, athleteId]);

  const fetchAthleteDetails = async () => {
    if (!athleteId) return;

    setIsLoading(true);
    try {
      const response = await axiosInstance.get(`/users/athlete/${athleteId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      setAthlete(response.data);
    } catch (error: any) {
      console.error("Error al obtener detalles del atleta:", error);
      toast.error("Error al cargar los detalles del atleta", {
        description: error.response?.data?.message || "Intenta nuevamente",
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'inactive':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Activo';
      case 'pending':
        return 'Pendiente';
      case 'inactive':
        return 'Inactivo';
      default:
        return status;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles del Atleta
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoaderCircle className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Cargando detalles...</span>
          </div>
        ) : athlete ? (
          <div className="space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Foto de Perfil */}
                <div className="flex justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={athlete.profilePicture ? `${axiosInstance.defaults.baseURL}/uploads/${athlete.profilePicture}` : undefined}
                      alt={`Foto de perfil de ${athlete.fullName}`}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials(athlete.fullName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Nombre completo:</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{athlete.fullName}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Email:</span>
                    </div>
                    <p className="text-gray-700">{athlete.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Estado:</span>
                    </div>
                    <Badge className={`${getStatusColor(athlete.status)} flex items-center gap-1 w-fit`}>
                      {getStatusIcon(athlete.status)}
                      {getStatusText(athlete.status)}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Fecha de registro:</span>
                    </div>
                    <p className="text-gray-700">
                      {format(new Date(athlete.joinDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Hace {formatDistanceToNow(new Date(athlete.joinDate), { locale: es })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Estadísticas de Entrenamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">{athlete.stats.totalTrainingPlans}</p>
                    <p className="text-sm text-blue-700">Planes Totales</p>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{athlete.stats.activePlans}</p>
                    <p className="text-sm text-green-700">Planes Activos</p>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{athlete.stats.completedSessions}</p>
                    <p className="text-sm text-purple-700">Sesiones Completadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tiempo con el Entrenador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {athlete.daysSinceJoin} días
                    </p>
                    <p className="text-sm text-gray-600">
                      Entrenando contigo desde {format(new Date(athlete.joinDate), "MMMM yyyy", { locale: es })}
                    </p>
                  </div>
                  <Calendar className="h-12 w-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">No se pudieron cargar los detalles del atleta</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
