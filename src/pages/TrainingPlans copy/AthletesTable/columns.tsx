"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, Copy, Ban } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

// Backend response example:
// {
//   _id: "681fd4c52c8548045b13b43a",
//   fullName: "José López",
//   email: "fercitox@gmail.com",
//   role: "athlete",
//   coach: "COACH-1GMTFP",
// },

export interface Athlete {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  coach: string;
}

export const columns: ColumnDef<Athlete>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "fullName",
    header: "Nombre del Atleta",
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
      return (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon">
            <Ban className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
