import { useEffect, useState } from 'react';
import { AthleteDashboardKPIs } from '@/components/AthleteDashboardKPIs';
import { AthleteProgressChart } from '@/components/AthleteProgressChart';
import { AthleteTrainingPlans } from '@/components/AthleteTrainingPlans';
import { AthleteUpcomingSessions } from '@/components/AthleteUpcomingSessions';
import axios from '@/lib/axiosInstance';

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

interface UpcomingSession {
  id: string;
  planName: string;
  sessionName: string;
  date: string;
  exercisesCount: number;
  completed: boolean;
  status: 'pending' | 'completed' | 'in_progress';
}

interface WeeklyProgress {
  day: string;
  completed: number;
  scheduled: number;
}

// Datos por defecto para el gráfico semanal
const defaultWeeklyProgress: WeeklyProgress[] = [
  { day: 'Lun', completed: 0, scheduled: 0 },
  { day: 'Mar', completed: 0, scheduled: 0 },
  { day: 'Mié', completed: 0, scheduled: 0 },
  { day: 'Jue', completed: 0, scheduled: 0 },
  { day: 'Vie', completed: 0, scheduled: 0 },
  { day: 'Sáb', completed: 0, scheduled: 0 },
  { day: 'Dom', completed: 0, scheduled: 0 },
];

export default function AthleteDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalPlans: 0,
    activeSessions: 0,
    completedSessions: 0,
    completionRate: 0,
    plans: [] as TrainingPlan[],
    upcomingSessions: [] as UpcomingSession[],
  });

  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>(defaultWeeklyProgress);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAthleteDashboardData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const token = sessionStorage.getItem('token');

        if (!user.id) return;

        // Obtener planes de entrenamiento del atleta
        const plansResponse = await axios.get(`/training-plans?athleteId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const plans: TrainingPlan[] = plansResponse.data;

        // Calcular métricas
        const totalPlans = plans.length;
        const allSessions = plans.flatMap(plan => plan.sessions);
        const activeSessions = allSessions.filter(session => !session.completed).length;
        const completedSessions = allSessions.filter(session => session.completed).length;
        const completionRate = allSessions.length > 0 
          ? Math.round((completedSessions / allSessions.length) * 100) 
          : 0;

        // Formatear sesiones próximas (próximos 7 días)
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcomingSessions: UpcomingSession[] = [];
        plans.forEach(plan => {
          plan.sessions.forEach(session => {
            const sessionDate = new Date(session.date);
            if (sessionDate >= now && sessionDate <= nextWeek) {
              upcomingSessions.push({
                id: `${plan._id}-${session.sessionId}`,
                planName: plan.name,
                sessionName: session.sessionName,
                date: session.date,
                exercisesCount: session.exercises.length,
                completed: session.completed,
                status: session.completed ? 'completed' : 'pending',
              });
            }
          });
        });

        // Ordenar por fecha
        upcomingSessions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Calcular progreso semanal
        const weeklyProgressData: WeeklyProgress[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });

          let completed = 0;
          let scheduled = 0;

          allSessions.forEach(session => {
            const sessionDate = new Date(session.date);
            if (sessionDate.toDateString() === date.toDateString()) {
              scheduled++;
              if (session.completed) completed++;
            }
          });

          weeklyProgressData.push({
            day: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            completed,
            scheduled,
          });
        }

        setDashboardData({
          totalPlans,
          activeSessions,
          completedSessions,
          completionRate,
          plans,
          upcomingSessions: upcomingSessions.slice(0, 5), // Solo las próximas 5
        });

        setWeeklyProgress(weeklyProgressData);

      } catch (error) {
        console.error('Error fetching athlete dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAthleteDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta. Aquí tienes un resumen de tu progreso de entrenamiento.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <AthleteDashboardKPIs
        totalPlans={dashboardData.totalPlans}
        activeSessions={dashboardData.activeSessions}
        completedSessions={dashboardData.completedSessions}
        completionRate={dashboardData.completionRate}
      />

      {/* Gráfico de progreso */}
      <AthleteProgressChart weeklyProgress={weeklyProgress} />

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planes de entrenamiento */}
        <AthleteTrainingPlans plans={dashboardData.plans} />

        {/* Sesiones próximas */}
        <AthleteUpcomingSessions sessions={dashboardData.upcomingSessions} />
      </div>
    </div>
  );
}
