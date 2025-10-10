import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Calendar, Target, TrendingUp } from 'lucide-react';

interface AthleteDashboardKPIsProps {
  totalPlans: number;
  activeSessions: number;
  completedSessions: number;
  completionRate: number;
}

export function AthleteDashboardKPIs({
  totalPlans,
  activeSessions,
  completedSessions,
  completionRate,
}: AthleteDashboardKPIsProps) {
  const kpis = [
    {
      title: 'Planes Activos',
      value: totalPlans,
      icon: Dumbbell,
      description: 'Planes de entrenamiento asignados',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Sesiones Activas',
      value: activeSessions,
      icon: Calendar,
      description: 'Sesiones pendientes de completar',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Sesiones Completadas',
      value: completedSessions,
      icon: Target,
      description: 'Sesiones finalizadas',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Tasa de Completado',
      value: `${completionRate}%`,
      icon: TrendingUp,
      description: 'Progreso general',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, index) => {
        const IconComponent = kpi.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
