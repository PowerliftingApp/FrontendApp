import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { TrainingPlan } from "../TrainingPlans/TrainingPlansTable/columns";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

export default function TrainingPlansDetail() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axiosInstance.get(`/training-plans/${id}`);
        if (response.status !== 200) {
          throw new Error('No se pudo cargar el plan de entrenamiento');
        }
        const data = await response.data;
        setPlan(data);
      } catch (err: any) {
        toast.error('Error al cargar el plan de entrenamiento');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlan();
    }
  }, [id]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="p-4">Cargando...</div>;
  }

  if (!plan) {
    return <div className="p-4">No se encontró el plan de entrenamiento</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">{plan.name}</h1>
      <div className="mb-4">
        <p><strong>Id Atleta:</strong> {plan.athleteId._id}</p>
        <p><strong>Atleta:</strong> {plan.athleteId.fullName}</p>
        <p><strong>Email:</strong> {plan.athleteId.email}</p>
        <p><strong>Fecha de inicio:</strong> {formatDate(plan.startDate)}</p>
        <p><strong>Fecha de fin:</strong> {formatDate(plan.endDate)}</p>
      </div>

      <div className="space-y-6">
        {plan.sessions.map((session, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{session.sessionName}</h2>
            <p className="text-gray-600 mb-4">{formatDate(session.date)}</p>
            
            <div className="space-y-4">
              {session.exercises.map((exercise, exIndex) => (
                <div key={exIndex} className="bg-gray-50 p-3 rounded">
                  <h3 className="font-medium">{exercise.name}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p>Series: {exercise.sets}</p>
                    <p>Repeticiones: {exercise.reps}</p>
                    {exercise.rpe && <p>RPE: {exercise.rpe}</p>}
                    {exercise.rir && <p>RIR: {exercise.rir}</p>}
                    {exercise.rm && <p>RM: {exercise.rm}</p>}
                    {exercise.notes && <p>Notas: {exercise.notes}</p>}
                  </div>
                  
                  {exercise.performedSets.length > 0 && (
                    <div className="mt-2">
                      <h4 className="font-medium">Series realizadas:</h4>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {exercise.performedSets.map((set, setIndex) => (
                          <div key={setIndex} className="text-sm">
                            <p>Serie {set.setNumber}:</p>
                            <p>Reps: {set.repsPerformed || '-'}</p>
                            <p>Carga: {set.loadUsed || '-'}</p>
                            {set.measureAchieved && (
                              <p>Medida: {set.measureAchieved}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
