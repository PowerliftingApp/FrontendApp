"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, Copy } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

// Backend response example:
// {
//     "athleteId": "681fd4c52c8548045b13b43a",
//     "coachId": "COACH-1GMTFP",
//     "name": "Plan de Fuerza - Mes 1",
//     "startDate": "2024-03-20T00:00:00.000Z",
//     "endDate": "2024-04-20T00:00:00.000Z",
//     "sessions": [
//       {
//         "sessionName": "Entrenamiento de Fuerza - Día 1",
//         "date": "2024-03-20",
//         "exercises": [
//           {
//             "name": "Sentadilla",
//             "sets": 5,
//             "reps": 5,
//             "rpe": 8,
//             "rir": 2,
//             "rm": 85,
//             "notes": "Enfocarse en la técnica",
//             "performedSets": [
//               {
//                 "setNumber": 1,
//                 "repsPerformed": 5,
//                 "loadUsed": 100,
//                 "measureAchieved": 100
//               },
//               {
//                 "setNumber": 2,
//                 "repsPerformed": 5,
//                 "loadUsed": 105,
//                 "measureAchieved": 105
//               }
//             ]
//           },
//           {
//             "name": "Press de Banca",
//             "sets": 4,
//             "reps": 8,
//             "rpe": 7,
//             "notes": "Mantener los hombros retraídos",
//             "performedSets": [
//               {
//                 "setNumber": 1,
//                 "repsPerformed": 8,
//                 "loadUsed": 80,
//                 "measureAchieved": 80
//               }
//             ]
//           }
//         ]
//       },
//       {
//         "sessionName": "Entrenamiento de Fuerza - Día 2",
//         "date": "2024-03-22",
//         "exercises": [
//           {
//             "name": "Peso Muerto",
//             "sets": 5,
//             "reps": 3,
//             "rpe": 8.5,
//             "performedSets": [
//               {
//                 "setNumber": 1,
//                 "repsPerformed": 3,
//                 "loadUsed": 150,
//                 "measureAchieved": 150
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   }

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

export const columns: ColumnDef<TrainingPlan>[] = [
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
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
