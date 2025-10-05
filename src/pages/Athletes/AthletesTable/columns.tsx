"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Ban } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface Athlete {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  coach: string;
  profilePicture?: string;
}

export const createColumns = (onViewDetails: (athleteId: string) => void): ColumnDef<Athlete>[] => [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "fullName",
    header: "Nombre del Atleta",
    cell: ({ row }) => {
      const athlete = row.original;
      const initials = athlete.fullName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {athlete.profilePicture && (
              <AvatarImage 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${athlete.profilePicture.slice(1)}`} 
                alt={athlete.fullName}
              />
            )}
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span>{athlete.fullName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Correo Electrónico",
  },
  {
    accessorKey: "coach",
    header: "Coach",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const handleUnlink = async () => {
        try {
          await axiosInstance.delete(
            `/users/athletes/${row.original._id}/coach`,
            {
              headers: {
                Authorization: `Bearer ${sessionStorage.getItem("token")}`,
              },
            }
          );
          toast.success("Atleta desvinculado correctamente");
          window.location.reload();
        } catch (error: any) {
          toast.error("No se pudo desvincular al atleta", {
            description: error?.response?.data?.message || "Intenta nuevamente",
          });
        }
      };
      let isCoach = false;
      try {
        const user = sessionStorage.getItem("user");
        if (user) {
          const parsed = JSON.parse(user);
          isCoach = parsed?.role === "coach";
        }
      } catch {}
      return (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => onViewDetails(row.original._id)}
            title="Ver detalles del atleta"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {/* Modal de confirmación para desvincular atleta */}
          {isCoach && row.original.coach && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" title="Desvincular atleta">
                  <Ban className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Desvincular atleta</AlertDialogTitle>
                  <AlertDialogDescription>
                    ¿Seguro que deseas desvincular a este atleta de tu cuenta? Esta acción se puede revertir asignando un nuevo coach más adelante.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleUnlink}>Desvincular</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      );
    },
  },
];

// Exportación por defecto para compatibilidad
export const columns = createColumns(() => {});
