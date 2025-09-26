import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, User } from "lucide-react";
import { Link } from "react-router";

interface Athlete {
  _id: string;
  fullName: string;
  email: string;
  joinDate: string;
  lastActivity?: string;
  status: 'active' | 'inactive';
  progress?: number;
}

interface RecentAthletesProps {
  athletes: Athlete[];
}

export function RecentAthletes({ athletes }: RecentAthletesProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Activo' : 'Inactivo';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <User className="h-5 w-5" />
          Atletas Recientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {athletes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay atletas registrados aún</p>
              <Link to="/dashboard/athletes" className="text-primary hover:underline text-sm">
                Gestionar atletas
              </Link>
            </div>
          ) : (
            athletes.map((athlete) => (
              <div
                key={athlete._id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:scale-[1.01] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold text-sm">
                      {getInitials(athlete.fullName)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm">{athlete.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{athlete.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        <div className={`w-2 h-2 rounded-full mr-1 ${getStatusColor(athlete.status)}`} />
                        {getStatusText(athlete.status)}
                      </Badge>
                      {athlete.progress && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {athlete.progress}% progreso
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(athlete.joinDate).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  {athlete.lastActivity && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Última actividad: {new Date(athlete.lastActivity).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {athletes.length > 0 && (
          <div className="mt-4 text-center">
            <Link
              to="/dashboard/athletes"
              className="text-primary hover:underline text-sm font-medium"
            >
              Ver todos los atletas →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
