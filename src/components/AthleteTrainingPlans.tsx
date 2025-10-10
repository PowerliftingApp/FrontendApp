import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Calendar, Target } from 'lucide-react';

interface TrainingPlan {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  sessions: Array<{
    sessionId: string;
    sessionName: string;
    date: string;
    completed: boolean;
    exercises: Array<{
      exerciseId: string;
      name: string;
      completed: boolean;
    }>;
  }>;
}

interface AthleteTrainingPlansProps {
  plans: TrainingPlan[];
}

export function AthleteTrainingPlans({ plans }: AthleteTrainingPlansProps) {
  const calculatePlanProgress = (plan: TrainingPlan) => {
    const totalSessions = plan.sessions.length;
    const completedSessions = plan.sessions.filter(session => session.completed).length;
    return totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
  };

  const getTotalExercises = (plan: TrainingPlan) => {
    return plan.sessions.reduce((total, session) => total + session.exercises.length, 0);
  };

  const getCompletedExercises = (plan: TrainingPlan) => {
    return plan.sessions.reduce((total, session) => 
      total + session.exercises.filter(exercise => exercise.completed).length, 0
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (plan: TrainingPlan) => {
    const now = new Date();
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const progress = calculatePlanProgress(plan);

    if (progress === 100) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>;
    }
    if (now < startDate) {
      return <Badge variant="secondary">Próximo</Badge>;
    }
    if (now >= startDate && now <= endDate) {
      return <Badge variant="default">Activo</Badge>;
    }
    return <Badge variant="outline">Finalizado</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Mis Planes de Entrenamiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No tienes planes de entrenamiento asignados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => {
              const progress = calculatePlanProgress(plan);
              const totalExercises = getTotalExercises(plan);
              const completedExercises = getCompletedExercises(plan);

              return (
                <div
                  key={plan._id}
                  className="p-4 border rounded-lg transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                      </p>
                    </div>
                    {getStatusBadge(plan)}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progreso del Plan</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>{plan.sessions.length} sesiones</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span>{completedExercises}/{totalExercises} ejercicios</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
