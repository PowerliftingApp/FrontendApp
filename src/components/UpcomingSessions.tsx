import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";
import { Link } from "react-router";

interface Session {
  id: string;
  athleteName: string;
  sessionName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'in_progress';
}

interface UpcomingSessionsProps {
  sessions: Session[];
}

export function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      default:
        return 'bg-amber-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'in_progress':
        return 'En progreso';
      default:
        return 'Programada';
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date();
    const sessionDate = new Date(dateString);
    return today.toDateString() === sessionDate.toDateString();
  };

  const isTomorrow = (dateString: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sessionDate = new Date(dateString);
    return tomorrow.toDateString() === sessionDate.toDateString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(dateString)) return 'Hoy';
    if (isTomorrow(dateString)) return 'Mañana';
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Sesiones Próximas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay sesiones programadas</p>
              <Link to="/dashboard/training-plans" className="text-primary hover:underline text-sm">
                Crear plan de entrenamiento
              </Link>
            </div>
          ) : (
            sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:scale-[1.01] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(session.status)}`} />

                  <div>
                    <h4 className="font-medium text-sm">{session.sessionName}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {session.athleteName}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3" />
                    {session.time}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session.date)}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-xs"
                    >
                      {getStatusText(session.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {sessions.length > 5 && (
          <div className="mt-4 text-center">
            <Link
              to="/dashboard/calendar"
              className="text-primary hover:underline text-sm font-medium"
            >
              Ver calendario completo →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
