import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axiosInstance";

interface ConvertToTemplateModalProps {
  planId: string;
  planName: string;
  isTemplate: boolean;
  onConversion?: () => void;
}

export default function ConvertToTemplateModal({ 
  planId, 
  planName, 
  isTemplate, 
  onConversion 
}: ConvertToTemplateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [templateName, setTemplateName] = useState(`Plantilla - ${planName}`);
  const [templateDescription, setTemplateDescription] = useState("");

  const handleConvertToTemplate = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      
      if (!user.coachId || user.role !== "coach") {
        toast.error("Usuario no autorizado");
        return;
      }

      const templateData = {
        name: templateName,
        description: templateDescription,
        createdBy: user.coachId
      };

      await axiosInstance.post(`/training-plans/${planId}/convert-to-template`, templateData);
      
      toast.success("Plan convertido en plantilla exitosamente");
      setIsOpen(false);
      onConversion?.();
    } catch (error: any) {
      toast.error("Error al convertir el plan en plantilla", {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTemplateStatus = async () => {
    try {
      setIsLoading(true);
      
      await axiosInstance.patch(`/training-plans/${planId}/remove-template-status`);
      
      toast.success("Plan desmarcado como plantilla exitosamente");
      setIsOpen(false);
      onConversion?.();
    } catch (error: any) {
      toast.error("Error al desmarcar el plan como plantilla", {
        description: error.response?.data?.message || error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isTemplate) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="bg-green-700 hover:bg-green-800 text-white" size="icon" title="Plan marcado como plantilla">
            <FileText className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gestionar Plantilla</DialogTitle>
            <DialogDescription>
              Este plan está marcado como plantilla. ¿Deseas desmarcarlo?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Plan:</strong> {planName}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Este plan ya está disponible como plantilla en la sección de Plantillas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRemoveTemplateStatus}
              disabled={isLoading}
            >
              {isLoading ? "Desmarcando..." : "Desmarcar como Plantilla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Convertir en Plantilla">
          <FileText className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convertir en Plantilla</DialogTitle>
          <DialogDescription>
            Convierte este plan de entrenamiento en una plantilla reutilizable.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="templateName">Nombre de la plantilla</Label>
            <Input
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Nombre de la plantilla"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="templateDescription">Descripción</Label>
            <Textarea
              id="templateDescription"
              value={templateDescription}
              onChange={(e: any) => setTemplateDescription(e.target.value)}
              placeholder="Describe para qué tipo de atletas o objetivos es esta plantilla..."
              rows={3}
            />
          </div>

          <div className="p-3 bg-gray-50 border rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Plan original:</strong> {planName}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Se creará una plantilla basada en este plan que podrás usar para futuros entrenamientos.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConvertToTemplate}
            disabled={isLoading || !templateName.trim() || !templateDescription.trim()}
          >
            {isLoading ? "Convirtiendo..." : "Crear Plantilla"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
