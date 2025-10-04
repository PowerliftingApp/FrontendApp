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

export default function Home() {
  const [dashboardData, setDashboardData] = useState({
    totalAthletes: 0,
    activePlans: 0,
    completedSessions: 0,
    completionRate: 0,
    athletes: [] as Athlete[],
    sessions: [] as Session[],
  });

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

        // Obtener planes de entrenamiento
        const plansResponse = await axios.get(`/training-plans?coachId=${user.coachId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Calcular métricas
        const athletes = athletesResponse.data;
        const plans = plansResponse.data;

        // Calcular sesiones completadas (simulado por ahora)
        const completedSessions = plans.reduce((total: number, plan: any) => {
          return total + (plan.sessions?.filter((s: any) => s.completed)?.length || 0);
        }, 0);

        console.log("PLANS", plans);
        console.log("ATHLETES", athletes);

        // Calcular tasa de completitud
        const totalSessions = plans.reduce((total: number, plan: any) => {
          return total + (plan.sessions?.length || 0);
        }, 0);

        const completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

        // Formatear atletas para el componente
        const formattedAthletes: Athlete[] = athletes.slice(0, 5).map((athlete: any) => ({
          _id: athlete._id,
          fullName: athlete.fullName,
          email: athlete.email,
          joinDate: new Date().toISOString(), // Simulado
          status: 'active' as const,
          progress: Math.floor(Math.random() * 100), // Simulado
        }));

        // Crear sesiones simuladas para próximos días
        const sessions: Session[] = [];
        const today = new Date();

        athletes.slice(0, 3).forEach((athlete: any, index: number) => {
          const sessionDate = new Date(today);
          sessionDate.setDate(today.getDate() + index);

          sessions.push({
            id: `session-${index}`,
            athleteName: athlete.fullName,
            sessionName: ['Fuerza Superior', 'Fuerza Inferior', 'Core & Estabilidad'][index % 3],
            date: sessionDate.toISOString(),
            time: ['09:00', '14:00', '18:00'][index % 3],
            status: index === 0 ? 'in_progress' : 'scheduled' as const,
          });
        });

        setDashboardData({
          totalAthletes: athletes.length,
          activePlans: plans.filter((p: any) => !p.completed).length,
          completedSessions,
          completionRate,
          athletes: formattedAthletes,
          sessions,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Datos para gráficos (simulados por ahora)
  const weeklyProgress = [
    { day: 'Lun', completed: 4, scheduled: 6 },
    { day: 'Mar', completed: 6, scheduled: 7 },
    { day: 'Mié', completed: 5, scheduled: 8 },
    { day: 'Jue', completed: 7, scheduled: 6 },
    { day: 'Vie', completed: 8, scheduled: 8 },
    { day: 'Sáb', completed: 3, scheduled: 4 },
    { day: 'Dom', completed: 2, scheduled: 3 },
  ];

  const athleteDistribution = [
    { name: 'Avanzados', value: 35, color: '#D72638' },
    { name: 'Intermedios', value: 45, color: '#F5B700' },
    { name: 'Principiantes', value: 20, color: '#5A5A5A' },
  ];

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
        athleteDistribution={athleteDistribution}
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
