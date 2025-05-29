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
  id: string;
  name: string;
}

interface InitialConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (
    selectedAthleteId: string,
    selectedTemplateId: string | null
  ) => void;
}

export default function InitialConfigurationModal({
  isOpen,
  onClose,
  onContinue,
}: InitialConfigurationModalProps) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  // Mock templates
  const templates: Template[] = [
    { id: "1", name: "Plan de Fuerza Básico" },
    { id: "2", name: "Plan de Hipertrofia" },
    { id: "3", name: "Plan de Resistencia" },
  ];

  useEffect(() => {
    const fetchAthletes = async () => {
      try {
        const coachId = JSON.parse(
          sessionStorage.getItem("user") || "{}"
        ).coachId;
        if (!coachId) {
          throw new Error("Coach ID not found");
        }

        const response = await axiosInstance.get("/users/athletes/" + coachId);
        const data = await response.data;
        setAthletes(data);
      } catch (error) {
        console.error("Error fetching athletes:", error);
      }
    };

    if (isOpen) {
      fetchAthletes();
    }
  }, [isOpen]);

  const handleContinue = () => {
    if (selectedAthleteId) {
      onContinue(selectedAthleteId, selectedTemplateId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
                <SelectItem value="ninguna">Sin plantilla</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
