import { useEffect, useState } from "react";
import { TrainingPlansTable } from "./TrainingPlansTable/TrainingPlansTable";
import { createColumns } from "./TrainingPlansTable/columns";
import { TrainingPlan } from "./TrainingPlansTable/columns";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { useSearchParams } from 'react-router';

async function fetchPlans(athleteId?: string) {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  if (!user.coachId || user.role !== "coach") {
    throw new Error("Usuario no autorizado");
  }
  try {
    let url = `/training-plans/?coachId=${user.coachId}`;
    if (athleteId) {
      url += `&athleteId=${athleteId}`;
    }
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    toast.error("Error al obtener planes", {
      description: error.message,
    });
  }
}

export default function TrainingPlans() {
  const [data, setData] = useState<TrainingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const athleteId = searchParams.get('athleteId') || undefined;

  const loadPlans = async () => {
    try {
      setIsLoading(true);
      const plansData = await fetchPlans(athleteId);
      setData(plansData || []);
    } catch (error) {
      console.error('Error al cargar los planes:', error);
      toast.error('Error al cargar los planes de entrenamiento');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, [athleteId]);

  const handlePlanDeleted = () => {
    loadPlans();
  };

  const columns = createColumns(handlePlanDeleted);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Planes de Entrenamiento</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Cargando planes de entrenamiento...</p>
        </div>
      ) : (
        <TrainingPlansTable 
          columns={columns} 
          data={data} 
        />
      )}
    </div>
  );
}
