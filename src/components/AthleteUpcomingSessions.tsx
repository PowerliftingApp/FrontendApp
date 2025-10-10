import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, Circle } from 'lucide-react';

interface UpcomingSession {
  id: string;
  planName: string;
  sessionName: string;
  date: string;
  exercisesCount: number;
  completed: boolean;
  status: 'pending' | 'completed' | 'in_progress';
}

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
}

export function AthleteUpcomingSessions({ sessions }: UpcomingSessionsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: string, completed: boolean) => {
    if (completed) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (status === 'in_progress') {
      return <Clock className="h-4 w-4 text-orange-600" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusBadge = (status: string, completed: boolean) => {
    if (completed) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Completada</Badge>;
    }
    if (status === 'in_progress') {
      return <Badge variant="default" className="bg-orange-100 text-orange-800">En Progreso</Badge>;
    }
    return <Badge variant="secondary">Pendiente</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximas Sesiones
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay sesiones programadas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(session.status, session.completed)}
                  <div>
                    <h4 className="font-medium text-sm">{session.sessionName}</h4>
                    <p className="text-xs text-muted-foreground">
                      {session.planName} • {session.exercisesCount} ejercicios
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(session.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(session.status, session.completed)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
