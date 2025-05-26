import { useEffect, useState } from "react";
import { TrainingPlansTable } from "./TrainingPlansTable/TrainingPlansTable";
import { columns } from "./TrainingPlansTable/columns";
import { TrainingPlan } from "./TrainingPlansTable/columns";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

const mockData: TrainingPlan[] = [
  {
    athleteId: {
      _id: "681fd4c52c8548045b13b43a",
      fullName: "José López",
      email: "fercitox@gmail.com",
    },
    coachId: "COACH-1GMTFP",
    name: "Plan de Fuerza - Mes 1",
    startDate: new Date("2024-03-20"),
    endDate: new Date("2024-04-20"),
    sessions: [
      {
        sessionName: "Entrenamiento de Fuerza - Día 1",
        date: "2024-03-20",
        exercises: [
          {
            name: "Sentadilla",
            sets: 5,
            reps: 5,
            rpe: 8,
            rir: 2,
            rm: 85,
            notes: "Enfocarse en la técnica",
            performedSets: [
              {
                setNumber: 1,
                repsPerformed: 5,
                loadUsed: 100,
                measureAchieved: 100,
              },
              {
                setNumber: 2,
                repsPerformed: 5,
                loadUsed: 105,
                measureAchieved: 105,
              },
            ],
          },
        ],
      },
    ],
  },
];

export async function fetchPlans() {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  if (!user.coachId || user.role !== "coach") {
    throw new Error("Usuario no autorizado");
  }
  try {
    const response = await axiosInstance.get(
      `/training-plans/?coachId=${user.coachId}`
    );
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

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        const plansData = await fetchPlans();
        setData(plansData || []);
      } catch (error) {
        console.error('Error al cargar los planes:', error);
        toast.error('Error al cargar los planes de entrenamiento');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Planes de Entrenamiento</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Cargando planes de entrenamiento...</p>
        </div>
      ) : (
        <TrainingPlansTable columns={columns} data={data} />
      )}
    </div>
  );
}
