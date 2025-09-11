import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axiosInstance";

interface Athlete {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  coach: string;
}

interface Template {
  _id: string;
  name: string;
  description: string;
  type: string;
  sessions: any[];
}

interface InitialConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (
    selectedAthleteId: string,
    selectedTemplate: Template | null
  ) => void;
}

export default function InitialConfigurationModal({
  isOpen,
  onClose,
  onContinue,
}: InitialConfigurationModalProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user") || "{}");
        const coachId = user.coachId;
        
        if (!coachId) {
          throw new Error("Coach ID not found");
        }

        // Fetch athletes
        const athletesResponse = await axiosInstance.get("/users/athletes/" + coachId);
        setAthletes(athletesResponse.data);

        // Fetch templates
        setIsLoadingTemplates(true);
        const templatesResponse = await axiosInstance.get("/templates");
        
        // Filtrar plantillas disponibles para el coach (predefinidas + propias)
        const availableTemplates = templatesResponse.data.filter((template: Template) => 
          template.type === 'predefined' || template.type === 'user_created'
        );
        
        setTemplates(availableTemplates);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleContinue = async () => {
    if (selectedAthleteId) {
      let selectedTemplate: Template | null = null;
      
      if (selectedTemplateId && selectedTemplateId !== 'ninguna' && selectedTemplateId !== 'loading') {
        try {
          const templateResponse = await axiosInstance.get(`/templates/${selectedTemplateId}`);
          selectedTemplate = templateResponse.data;
        } catch (error) {
          console.error("Error fetching template details:", error);
        }
      }
      
      onContinue(selectedAthleteId, selectedTemplate);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configuración Inicial del Plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2 w-full">
            <Label htmlFor="template">Plantilla (Opcional)</Label>
            <Select
              value={selectedTemplateId || ""}
              onValueChange={(value) => setSelectedTemplateId(value || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguna">
                  Crear desde cero
                </SelectItem>
                {isLoadingTemplates ? (
                  <SelectItem value="loading" disabled>Cargando plantillas...</SelectItem>
                ) : (
                  templates.map((template) => (
                    <SelectItem key={template._id} value={template._id}>
                      {template.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {selectedTemplateId && selectedTemplateId !== 'ninguna' && selectedTemplateId !== 'loading' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  💡 Se precargará la estructura de la plantilla. Podrás modificar todos los datos antes de guardar.
                </p>
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="athlete">Atleta</Label>
            <Select
              value={selectedAthleteId}
              onValueChange={setSelectedAthleteId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un atleta" />
              </SelectTrigger>
              <SelectContent>
                {athletes.map((athlete) => (
                  <SelectItem key={athlete._id} value={athlete._id}>
                    {athlete.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleContinue} disabled={!selectedAthleteId}>
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
