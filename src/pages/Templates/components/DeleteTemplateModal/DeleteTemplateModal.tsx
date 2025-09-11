import {
  AlertDialog,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Template } from "../../types";
import { deleteTemplate } from "../../api";

interface DeleteTemplateModalProps {
  template: Template;
  onDelete?: () => void;
}

export default function DeleteTemplateModal({ template, onDelete }: DeleteTemplateModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTemplate(template._id);
      toast.success("Plantilla eliminada exitosamente");
      onDelete?.();
    } catch (error: any) {
      toast.error("Error al eliminar la plantilla", {
        description: error.message
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente la
            plantilla <strong>"{template.name}"</strong> y todos los datos asociados.
            
            {template.originalPlanId && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-800">
                <strong>Nota:</strong> El plan de entrenamiento original se desmarcará automáticamente como plantilla.
              </div>
            )}
            
            {template.usageCount > 0 && (
              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-orange-800">
                <strong>Advertencia:</strong> Esta plantilla ha sido utilizada {template.usageCount} vez(es).
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
