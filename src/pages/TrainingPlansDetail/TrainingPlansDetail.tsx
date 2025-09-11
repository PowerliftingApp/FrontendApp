import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { TrainingPlan } from "../TrainingPlans/TrainingPlansTable/columns";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import React from "react";

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando plan de entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No se encontró el plan de entrenamiento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{plan.name}</h1>
        <p className="text-muted-foreground">
          Detalles completos del plan de entrenamiento
        </p>
      </div>
      
      <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
        <div className="space-y-6">
          {/* Información general del plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Atleta</h4>
                  <p className="text-sm font-semibold">{plan.athleteId.fullName}</p>
                  <p className="text-xs text-muted-foreground">{plan.athleteId.email}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">ID del Atleta</h4>
                  <p className="text-sm font-mono">{plan.athleteId._id}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Fecha de Inicio</h4>
                  <Badge variant="outline" className="mt-1">
                    {formatDate(plan.startDate)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Fecha de Fin</h4>
                  <Badge variant="outline" className="mt-1">
                    {formatDate(plan.endDate)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Sesiones</h4>
                  <p className="text-sm font-semibold">{plan.sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sesiones de entrenamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sesiones de Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.sessions.map((session, sessionIndex) => (
                  <div key={sessionIndex} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{session.sessionName}</h3>
                      <Badge variant="outline">{formatDate(session.date)}</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Ejercicios ({session.exercises.length})
                      </h4>
                      
                      <div className="grid gap-3">
                        {session.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="bg-muted/50 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium">{exercise.name}</h5>
                              <div className="flex gap-2 text-sm text-muted-foreground">
                                <span>{exercise.sets} series</span>
                                <span>•</span>
                                <span>{exercise.reps} reps</span>
                                {exercise.rpe && (
                                  <>
                                    <span>•</span>
                                    <span>RPE {exercise.rpe}</span>
                                  </>
                                )}
                                {exercise.rir && (
                                  <>
                                    <span>•</span>
                                    <span>RIR {exercise.rir}</span>
                                  </>
                                )}
                                {exercise.rm && (
                                  <>
                                    <span>•</span>
                                    <span>RM {exercise.rm}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            {exercise.notes && (
                              <p className="text-sm text-muted-foreground mt-1">
                                <strong>Notas:</strong> {exercise.notes}
                              </p>
                            )}
                            
                            {exercise.performedSets.length > 0 && (
                              <div className="mt-3">
                                <h6 className="font-medium text-sm text-muted-foreground mb-2">
                                  Series Realizadas
                                </h6>
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                  <div className="text-center font-medium text-muted-foreground">Serie</div>
                                  <div className="text-center font-medium text-muted-foreground">Reps</div>
                                  <div className="text-center font-medium text-muted-foreground">Carga</div>
                                  <div className="text-center font-medium text-muted-foreground">RPE</div>
                                  
                                  {exercise.performedSets.slice(0, 5).map((set, setIndex) => (
                                    <React.Fragment key={setIndex}>
                                      <div className="text-center">{set.setNumber}</div>
                                      <div className="text-center">{set.repsPerformed || '-'}</div>
                                      <div className="text-center">{set.loadUsed || '-'}</div>
                                      <div className="text-center">{set.measureAchieved || '-'}</div>
                                    </React.Fragment>
                                  ))}
                                  
                                  {exercise.performedSets.length > 5 && (
                                    <div className="col-span-4 text-center text-muted-foreground text-xs">
                                      ... y {exercise.performedSets.length - 5} series más
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
