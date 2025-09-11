import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type PerformedSet = {
  setId?: string;
  setNumber: number;
  repsPerformed?: number | null;
  loadUsed?: number | null;
  measureAchieved?: number | null;
};

type Exercise = {
  exerciseId?: string;
  name: string;
  sets: number;
  reps: number;
  rpe?: number | null;
  rir?: number | null;
  rm?: number | null;
  notes?: string | null;
  weight?: number | null;
  completed?: boolean;
  performedSets: PerformedSet[];
};

type Session = {
  sessionId?: string;
  sessionName: string;
  date: string;
  sessionNotes?: string | null;
  exercises: Exercise[];
};

type TrainingPlan = {
  _id: string;
  athleteId: string | { _id: string; fullName: string; email: string };
  coachId: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  sessions: Session[];
};

export default function Plans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const userStr = sessionStorage.getItem("user");
      if (!userStr) {
        navigate("/");
        return;
      }
      const user = JSON.parse(userStr);
      if (user.role !== "athlete") {
        navigate("/dashboard");
        return;
      }

      // Obtener athleteId
      let athleteId: string | undefined = user._id || user.id;

      try {
        if (!athleteId) {
          const profile = await axiosInstance.get("/users/profile", {
            headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
          });
          athleteId = profile.data?.userId;
        }

        if (!athleteId) {
          toast.error("No se pudo determinar el atleta actual");
          navigate("/");
          return;
        }

        const res = await axiosInstance.get(`/training-plans`, {
          params: { athleteId },
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
        setPlans(res.data || []);
      } catch (err: any) {
        console.error(err);
        toast.error("Error al cargar tus entrenamientos", {
          description: err?.response?.data?.message,
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [navigate]);

  const { totalPlans, activePlans, totalSessions, completedSessions } = useMemo(() => {
    const now = new Date();
    const toDate = (d: any) => (typeof d === "string" ? new Date(d) : d);
    const total = plans.length;
    const active = plans.filter(p => {
      const s = toDate(p.startDate);
      const e = toDate(p.endDate);
      return s && e && s <= now && now <= e;
    }).length;
    let sessions = 0;
    let completed = 0;
    plans.forEach(p => {
      p.sessions.forEach(ses => {
        sessions += 1;
        const allDone = ses.exercises.length > 0 && ses.exercises.every(ex => !!ex.completed);
        if (allDone) completed += 1;
      });
    });
    return { totalPlans: total, activePlans: active, totalSessions: sessions, completedSessions: completed };
  }, [plans]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle>Planes activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">{activePlans}</div>
            <div className="text-sm text-muted-foreground">de {totalPlans} planes</div>
          </CardContent>
        </Card>
        <Card className="bg-sky-50 border-sky-200">
          <CardHeader>
            <CardTitle>Sesiones completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-sky-700">{completedSessions}</div>
            <div className="text-sm text-muted-foreground">de {totalSessions} sesiones</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle>Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">completado</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        {plans.map(plan => {
          const start = new Date(plan.startDate);
          const end = new Date(plan.endDate);
          const sessions = plan.sessions.length;
          const done = plan.sessions.filter(s => s.exercises.length > 0 && s.exercises.every(e => !!e.completed)).length;
          const isActive = start <= new Date() && new Date() <= end;
          return (
            <section key={plan._id} className={`rounded-md border p-4 border-l-4 ${isActive ? 'border-l-emerald-500' : 'border-l-zinc-300'} bg-background`}>
              <header className="flex items-center justify-between">
                <h3 className="text-lg font-medium truncate">{plan.name}</h3>
                <Badge className={isActive ? 'bg-emerald-500 text-white' : 'bg-zinc-400 text-white'}>
                  {isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </header>
              <div className="mt-1 text-sm text-muted-foreground">
                {start.toLocaleDateString()} - {end.toLocaleDateString()}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm">Sesiones: {done}/{sessions}</div>
                <Button variant="outline" onClick={() => navigate(`/dashboard/plans/${plan._id}`)}>Ver detalle</Button>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}


