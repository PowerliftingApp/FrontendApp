"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router";
import DeleteTrainingPlanModal from "../components/DeleteTrainingPlanModal/DeleteTrainingPlanModal";

export interface PerformedSet {
  setNumber: number;
  repsPerformed: number | null;
  loadUsed: number | null;
  measureAchieved: number | null;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rpe: number | null;
  rir: number | null;
  rm: number | null;
  notes: string | null;
  performedSets: PerformedSet[];
}

export interface Session {
  sessionName: string;
  date: string;
  exercises: Exercise[];
}

export interface TrainingPlan {
  _id: string;
  athleteId: {
    _id: string;
    fullName: string;
    email: string;
  };
  coachId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  sessions: Session[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const createColumns = (onPlanDeleted?: () => void): ColumnDef<TrainingPlan>[] => [
  {
    accessorKey: "name",
    header: "Nombre del Plan",
  },
  {
    accessorKey: "athleteId.fullName",
    header: "Nombre del Atleta",
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Inicio
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("startDate"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Fin
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("endDate"));
      return date.toLocaleDateString();
    },
  },
  {
    accessorKey: "sessions",
    header: "Sesiones",
    cell: ({ row }) => {
      const sessions = row.getValue("sessions") as Session[];
      return sessions.length;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex gap-2 justify-end">
          <Button variant="default" size="icon" asChild>
            <Link
              to={`/dashboard/training-plans/detail?id=${row.original._id}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="default" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
          <DeleteTrainingPlanModal id={row.original._id} onDelete={onPlanDeleted} />
        </div>
      );
    },
  },
];
