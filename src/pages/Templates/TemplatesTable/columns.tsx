import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Template, TemplateType, TYPE_LABELS, CATEGORY_LABELS } from "../types";
import DeleteTemplateModal from "../components/DeleteTemplateModal/DeleteTemplateModal";
import TemplateDetailModal from "../components/TemplateDetailModal/TemplateDetailModal";

export const createColumns = (onTemplateDeleted?: () => void): ColumnDef<Template>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nombre de la Plantilla
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
      const description = row.getValue("description") as string;
      return (
        <div className="max-w-[300px] truncate" title={description}>
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Tipo",
    cell: ({ row }) => {
      const type = row.getValue("type") as TemplateType;
      return (
        <Badge variant={type === TemplateType.PREDEFINED ? "default" : "secondary"}>
          {TYPE_LABELS[type]}
        </Badge>
      );
    },
    filterFn: "equals",
  },
  {
    accessorKey: "predefinedCategory",
    header: "Categoría",
    cell: ({ row }) => {
      const category = row.getValue("predefinedCategory");
      const type = row.original.type;
      
      if (type === TemplateType.PREDEFINED && category) {
        return (
          <Badge variant="outline">
            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
          </Badge>
        );
      }
      
      if (type === TemplateType.USER_CREATED) {
        return (
          <span className="text-sm text-muted-foreground">
            Personalizada
          </span>
        );
      }
      
      return "-";
    },
  },
  {
    accessorKey: "sessions",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No. Sesiones
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const sessions = row.getValue("sessions") as Template['sessions'];
      return (
        <div className="text-center">
          {sessions.length}
        </div>
      );
    },
  },
  {
    accessorKey: "usageCount",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Usos
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const usageCount = row.getValue("usageCount") as number;
      return (
        <div className="text-center">
          <Badge variant="outline">
            {usageCount}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Estado",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div className="flex items-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-sm">
            {isActive ? 'Activa' : 'Inactiva'}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const template = row.original;
      const canDelete = template.type === TemplateType.USER_CREATED;
      
      return (
        <div className="flex gap-2 justify-end">
          <TemplateDetailModal template={template}>
            <Button variant="default" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </TemplateDetailModal>
          
          {canDelete && (
            <DeleteTemplateModal 
              template={template} 
              onDelete={onTemplateDeleted} 
            />
          )}
        </div>
      );
    },
  },
];
