import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { TrainingPlan } from "../TrainingPlans/TrainingPlansTable/columns";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
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

  // Calcular estadísticas del progreso
  const progressStats = React.useMemo(() => {
    if (!plan) return null;

    const totalSessions = plan.sessions.length;
    const completedSessions = plan.sessions.filter(s => s.exercises.length > 0 && s.exercises.every(e => e.completed)).length;

    const allExercises = plan.sessions.flatMap(s => s.exercises);
    const totalExercises = allExercises.length;
    const completedExercises = allExercises.filter(e => e.completed).length;

    const allSets = allExercises.flatMap(e => e.performedSets);
    const totalSets = allSets.length;
    const completedSets = allSets.filter(s => s.completed).length;

    const sessionsWithFeedback = plan.sessions.filter(s => s.sessionNotes).length;
    const exercisesWithFeedback = allExercises.filter(e => e.performanceComment || e.athleteNotes).length;
    const exercisesWithMedia = allExercises.filter(e => e.mediaUrl).length;

    return {
      totalSessions,
      completedSessions,
      totalExercises,
      completedExercises,
      totalSets,
      completedSets,
      sessionsWithFeedback,
      exercisesWithFeedback,
      exercisesWithMedia,
      sessionProgress: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      exerciseProgress: totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0,
      setProgress: totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0,
    };
  }, [plan]);

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
    <div className="container mx-auto sm:p-6">
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
              <div className="grid lg:grid-cols-2 gap-4">
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

              <div className="grid lg:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Fecha de Inicio</h4>
                  <Badge variant="default" className="mt-1">
                    {formatDate(plan.startDate)}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Fecha de Fin</h4>
                  <Badge variant="default" className="mt-1">
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

          {/* Estadísticas de progreso */}
          {progressStats && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Progreso del Atleta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{progressStats.sessionProgress}%</div>
                    <div className="text-sm text-muted-foreground">Sesiones</div>
                    <div className="text-xs text-blue-600">{progressStats.completedSessions}/{progressStats.totalSessions} completadas</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{progressStats.exerciseProgress}%</div>
                    <div className="text-sm text-muted-foreground">Ejercicios</div>
                    <div className="text-xs text-green-600">{progressStats.completedExercises}/{progressStats.totalExercises} completados</div>
                  </div>

                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{progressStats.setProgress}%</div>
                    <div className="text-sm text-muted-foreground">Series</div>
                    <div className="text-xs text-purple-600">{progressStats.completedSets}/{progressStats.totalSets} completadas</div>
                  </div>

                  <div className="text-center p-3 bg-amber-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{progressStats.sessionsWithFeedback}</div>
                    <div className="text-sm text-muted-foreground">Sesiones con notas</div>
                    <div className="text-xs text-amber-600">Feedback del atleta</div>
                  </div>

                  <div className="text-center p-3 bg-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-indigo-600">{progressStats.exercisesWithFeedback}</div>
                    <div className="text-sm text-muted-foreground">Ejercicios con feedback</div>
                    <div className="text-xs text-indigo-600">Comentarios del atleta</div>
                  </div>

                  <div className="text-center p-3 bg-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-pink-600">{progressStats.exercisesWithMedia}</div>
                    <div className="text-sm text-muted-foreground">Ejercicios con evidencia</div>
                    <div className="text-xs text-pink-600">Fotos/videos del atleta</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sesiones de entrenamiento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sesiones de Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.sessions.map((session, sessionIndex) => {
                  const sessionCompleted = session.exercises.length > 0 && session.exercises.every(e => e.completed);
                  return (
                    <div key={sessionIndex} className={`border rounded-lg p-4 ${sessionCompleted ? 'border-green-500 bg-green-50/20' : 'border-gray-200'}`}>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{session.sessionName}</h3>
                          <Badge className={sessionCompleted ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                            {sessionCompleted ? 'Sesión Completada' : 'Sesión Pendiente'}
                          </Badge>
                        </div>
                        <Badge variant="default" className="w-fit">{formatDate(session.date)}</Badge>
                      </div>

                      {/* Notas de sesión añadidas por el atleta */}
                      {session.sessionNotes && (
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <h4 className="font-medium text-sm text-amber-800 mb-1">
                            📝 Notas de Sesión (Atleta)
                          </h4>
                          <p className="text-sm text-amber-700">{session.sessionNotes}</p>
                        </div>
                      )}
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        Ejercicios ({session.exercises.length})
                      </h4>
                      
                      <div className="grid xl:grid-cols-2 gap-3">
                        {session.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className={`rounded p-3 border ${exercise.completed ? 'border-green-500 bg-green-50/30' : 'border-gray-200'}`}>
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h5 className="font-medium">{exercise.name}</h5>
                                <Badge className={exercise.completed ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                                  {exercise.completed ? 'Completado' : 'Pendiente'}
                                </Badge>
                              </div>
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
                                <strong>Notas del plan:</strong> {exercise.notes}
                              </p>
                            )}

                            {/* Feedback del atleta */}
                            {(exercise.performanceComment || exercise.athleteNotes) && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <h6 className="font-medium text-sm text-blue-800 mb-2">
                                  💬 Feedback del Atleta
                                </h6>
                                {exercise.performanceComment && (
                                  <p className="text-sm text-blue-700 mb-1">
                                    <strong>Comentario de desempeño:</strong> {exercise.performanceComment}
                                  </p>
                                )}
                                {exercise.athleteNotes && (
                                  <p className="text-sm text-blue-700">
                                    <strong>Notas adicionales:</strong> {exercise.athleteNotes}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Evidencia del atleta */}
                            {exercise.mediaUrl && (
                              <div className="mt-3">
                                <EvidenceModal
                                  mediaUrl={exercise.mediaUrl}
                                  trigger={
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4 mr-2" />
                                      Ver evidencia del atleta
                                    </Button>
                                  }
                                />
                              </div>
                            )}

                            {/* Series realizadas por el atleta */}
                            {exercise.performedSets.length > 0 && (
                              <div className="mt-3">
                                <h6 className="font-medium text-sm text-muted-foreground mb-2">
                                  📊 Series Realizadas por el Atleta
                                </h6>
                                <div className="grid grid-cols-5 gap-2 text-xs">
                                  <div className="text-center font-medium text-muted-foreground">Serie</div>
                                  <div className="text-center font-medium text-muted-foreground">Reps</div>
                                  <div className="text-center font-medium text-muted-foreground">Carga</div>
                                  <div className="text-center font-medium text-muted-foreground">RPE</div>
                                  <div className="text-center font-medium text-muted-foreground">Completada</div>

                                  {exercise.performedSets.map((set, setIndex) => (
                                    <React.Fragment key={setIndex}>
                                      <div className="text-center">{set.setNumber}</div>
                                      <div className="text-center">{set.repsPerformed || '-'}</div>
                                      <div className="text-center">{set.loadUsed ? `${set.loadUsed}kg` : '-'}</div>
                                      <div className="text-center">{set.measureAchieved || '-'}</div>
                                      <div className="text-center">
                                        {set.completed ? (
                                          <Badge className="bg-green-500 text-white text-xs">Sí</Badge>
                                        ) : (
                                          <Badge variant="secondary" className="text-xs">No</Badge>
                                        )}
                                      </div>
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

function EvidenceModal({
  mediaUrl,
  trigger,
}: {
  mediaUrl: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Evidencia del Atleta</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center min-h-[400px] bg-black rounded-lg overflow-hidden">
          {isVideo ? (
            <video
              src={`${
                import.meta.env.VITE_API_URL || "http://localhost:3000/"
              }${mediaUrl}`}
              className="max-w-full max-h-full"
              controls
              autoPlay
            />
          ) : (
            <img
              src={`${
                import.meta.env.VITE_API_URL || "http://localhost:3000/"
              }${mediaUrl}`}
              className="max-w-full max-h-full object-contain"
              alt="Evidencia del atleta"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
