import { useEffect, useState } from "react";
import { TemplatesTable } from "./TemplatesTable/TemplatesTable";
import { createColumns } from "./TemplatesTable/columns";
import { Template } from "./types";
import { fetchTemplatesForCoach } from "./api";
import { toast } from "sonner";

export default function Templates() {
  const [data, setData] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const user = JSON.parse(sessionStorage.getItem("user") || "{}");
      
      if (!user.coachId || user.role !== "coach") {
        toast.error("Usuario no autorizado");
        return;
      }

      const templatesData = await fetchTemplatesForCoach(user.coachId);
      setData(templatesData || []);
    } catch (error: any) {
      console.error('Error al cargar las plantillas:', error);
      toast.error('Error al cargar las plantillas', {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleTemplateDeleted = () => {
    loadTemplates();
  };

  const columns = createColumns(handleTemplateDeleted);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Plantillas de Entrenamiento</h1>
          <p className="text-muted-foreground">
            Gestiona tus plantillas predefinidas y personalizadas
          </p>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Cargando plantillas...</p>
        </div>
      ) : (
        <TemplatesTable 
          columns={columns} 
          data={data} 
        />
      )}
    </div>
  );
}
