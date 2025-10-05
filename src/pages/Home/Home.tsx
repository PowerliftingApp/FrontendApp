import { useEffect, useState } from 'react';
import { DashboardKPIs } from '@/components/DashboardKPIs';
import { DashboardCharts } from '@/components/DashboardCharts';
import { RecentAthletes } from '@/components/RecentAthletes';
import { UpcomingSessions } from '@/components/UpcomingSessions';
import axios from '@/lib/axiosInstance';

interface Athlete {
  _id: string;
  fullName: string;
  email: string;
  joinDate: string;
  lastActivity?: string;
  status: 'active' | 'inactive';
  progress?: number;
}

interface Session {
  id: string;
  athleteName: string;
  sessionName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'in_progress';
}

interface WeeklyProgress {
  day: string;
  completed: number;
  scheduled: number;
}

interface SessionDistribution {
  name: string;
  value: number;
  color: string;
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

// Datos por defecto para distribución de sesiones
const defaultSessionDistribution: SessionDistribution[] = [
  { name: 'Completadas', value: 0, color: '#D72638' },
  { name: 'Próximas (7 días)', value: 0, color: '#F5B700' },
  { name: 'Pendientes', value: 0, color: '#5A5A5A' },
];

export default function Home() {
  const [dashboardData, setDashboardData] = useState({
    totalAthletes: 0,
    activePlans: 0,
    completedSessions: 0,
    completionRate: 0,
    athletes: [] as Athlete[],
    sessions: [] as Session[],
  });

  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>(defaultWeeklyProgress);
  const [sessionDistribution, setSessionDistribution] = useState<SessionDistribution[]>(defaultSessionDistribution);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem('user') || '{}');
        const token = sessionStorage.getItem('token');

        if (!user.coachId) return;

        // Obtener atletas
        const athletesResponse = await axios.get(`/users/athletes/${user.coachId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Obtener métricas del dashboard del backend
        const dashboardResponse = await axios.get(`/training-plans/dashboard/${user.coachId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const athletes = athletesResponse.data;
        const dashboardStats = dashboardResponse.data;

        // Formatear atletas para el componente
        const formattedAthletes: Athlete[] = athletes.slice(0, 5).map((athlete: any) => ({
          _id: athlete._id,
          fullName: athlete.fullName,
          email: athlete.email,
          joinDate: new Date().toISOString(), // Simulado
          status: 'active' as const,
          progress: Math.floor(Math.random() * 100), // Simulado
        }));

        // Formatear sesiones próximas del backend
        const formattedSessions: Session[] = (dashboardStats.upcomingSessions || []).map((session: any) => ({
          id: session.id,
          athleteName: session.athleteName,
          sessionName: session.sessionName,
          date: session.date,
          time: session.time,
          status: session.status as 'scheduled' | 'completed' | 'in_progress',
        }));

        setDashboardData({
          totalAthletes: athletes.length,
          activePlans: dashboardStats.stats.activePlans,
          completedSessions: dashboardStats.stats.completedSessionsThisWeek,
          completionRate: dashboardStats.stats.completionRate,
          athletes: formattedAthletes,
          sessions: formattedSessions,
        });

        // Actualizar datos del progreso semanal desde el backend
        // Si no hay datos, usar el array por defecto

        console.log(dashboardStats.weeklyProgress);
        setWeeklyProgress(
          dashboardStats.weeklyProgress && dashboardStats.weeklyProgress.length > 0 
            ? dashboardStats.weeklyProgress 
            : defaultWeeklyProgress
        );

        // Actualizar distribución de sesiones desde el backend
        setSessionDistribution(
          dashboardStats.sessionDistribution && dashboardStats.sessionDistribution.length > 0
            ? dashboardStats.sessionDistribution
            : defaultSessionDistribution
        );
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta. Aquí tienes un resumen de tu actividad.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <DashboardKPIs
        totalAthletes={dashboardData.totalAthletes}
        activePlans={dashboardData.activePlans}
        completedSessions={dashboardData.completedSessions}
        completionRate={dashboardData.completionRate}
      />

      {/* Gráficos */}
      <DashboardCharts
        weeklyProgress={weeklyProgress}
        sessionDistribution={sessionDistribution}
      />

      {/* Contenido en dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atletas recientes */}
        <RecentAthletes athletes={dashboardData.athletes} />

        {/* Sesiones próximas */}
        <UpcomingSessions sessions={dashboardData.sessions} />
      </div>
    </div>
  );
}
