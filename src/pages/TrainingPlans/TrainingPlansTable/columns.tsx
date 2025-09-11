"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router";
import DeleteTrainingPlanModal from "../components/DeleteTrainingPlanModal/DeleteTrainingPlanModal";
import ConvertToTemplateModal from "../components/ConvertToTemplateModal/ConvertToTemplateModal";

export interface PerformedSet {
  setId?: string;
  setNumber: number;
  repsPerformed: number | null;
  loadUsed: number | null;
  measureAchieved: number | null;
}

export interface Exercise {
  exerciseId?: string;
  name: string;
  sets: number;
  reps: number;
  rpe: number | null;
  rir: number | null;
  rm: number | null;
  notes: string | null;
  weight?: number | null;
  performedSets: PerformedSet[];
}

export interface Session {
  sessionId?: string;
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
  isTemplate?: boolean;
  templateId?: string;
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
      const plan = row.original;
      return (
        <div className="flex gap-2 justify-end">
          <ConvertToTemplateModal 
            planId={plan._id}
            planName={plan.name}
            isTemplate={plan.isTemplate || false}
            onConversion={onPlanDeleted}
          />
          <Button variant="outline" size="icon" asChild>
            <Link
              to={`/dashboard/training-plans/detail?id=${plan._id}`}
            >
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link to={`/dashboard/training-plans/edit?id=${plan._id}`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <DeleteTrainingPlanModal id={plan._id} onDelete={onPlanDeleted} />
        </div>
      );
    },
  },
];
