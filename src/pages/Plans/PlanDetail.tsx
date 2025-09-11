import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type PerformedSet = {
  setId?: string;
  setNumber: number;
  repsPerformed?: number | null;
  loadUsed?: number | null;
  measureAchieved?: number | null;
  completed?: boolean;
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
  performanceComment?: string | null;
  athleteNotes?: string | null;
  mediaUrl?: string | null;
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
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  sessions: Session[];
};

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [openExercise, setOpenExercise] = useState<string | null>(null);
  const [openNotesSessionId, setOpenNotesSessionId] = useState<string | null>(null);

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

      try {
        const res = await axiosInstance.get(`/training-plans/${id}`, {
          headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
        });
        setPlan(res.data);
      } catch (err: any) {
        console.error(err);
        toast.error("Error al cargar el plan", { description: err?.response?.data?.message });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, navigate]);

  const isSessionCompleted = (session: Session) => session.exercises.length > 0 && session.exercises.every(e => !!e.completed);

  const handleSubmitExercise = async (
    sessionId: string,
    exerciseId: string,
    form: { completed: boolean; performanceComment?: string; athleteNotes?: string; media?: File | null }
  ) => {
    const data = new FormData();
    data.append('planId', String(id));
    data.append('sessionId', sessionId);
    data.append('exerciseId', exerciseId);
    data.append('completed', String(form.completed));
    if (form.performanceComment) data.append('performanceComment', form.performanceComment);
    if (form.athleteNotes) data.append('athleteNotes', form.athleteNotes);
    if (form.media) data.append('media', form.media);

    try {
      await axiosInstance.post('/training-plans/feedback/exercise', data, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      toast.success('Feedback guardado');
      // refrescar
      const res = await axiosInstance.get(`/training-plans/${id}`);
      setPlan(res.data);
      setOpenExercise(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Error guardando feedback', { description: err?.response?.data?.message });
    }
  };

  const handleSubmitSessionNotes = async (sessionId: string, sessionNotes: string) => {
    try {
      await axiosInstance.patch('/training-plans/feedback/session-notes', {
        planId: id,
        sessionId,
        sessionNotes,
      }, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
      });
      toast.success('Notas de la sesión guardadas');
      const res = await axiosInstance.get(`/training-plans/${id}`);
      setPlan(res.data);
      setOpenNotesSessionId(null);
    } catch (err: any) {
      console.error(err);
      toast.error('Error guardando notas', { description: err?.response?.data?.message });
    }
  };

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{plan.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {plan.sessions.map((session) => {
          const disabled = isSessionCompleted(session);
          return (
            <Card key={session.sessionId || session.sessionName} className={disabled ? 'opacity-60' : ''}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{session.sessionName}</CardTitle>
                <Dialog open={openNotesSessionId === (session.sessionId || '')} onOpenChange={(o) => setOpenNotesSessionId(o ? (session.sessionId || '') : null)}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Añadir notas de sesión</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Notas de la sesión</DialogTitle>
                    </DialogHeader>
                    <SessionNotesForm
                      defaultNotes={session.sessionNotes || ''}
                      onSubmit={(notes) => handleSubmitSessionNotes(session.sessionId || '', notes)}
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-3">
                {session.exercises.map((ex) => (
                  <div key={ex.exerciseId || ex.name} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{ex.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {ex.sets}x{ex.reps}
                          {typeof ex.rpe === 'number' ? ` • RPE ${ex.rpe}` : ''}
                          {typeof ex.weight === 'number' ? ` • ${ex.weight} kg` : ''}
                        </div>
                      </div>

                      <Dialog open={openExercise === (ex.exerciseId || '')} onOpenChange={(o) => setOpenExercise(o ? (ex.exerciseId || '') : null)}>
                        <DialogTrigger asChild>
                          <Button variant={ex.completed ? 'secondary' : 'default'}>
                            {ex.completed ? 'Editar feedback' : 'Marcar completado'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Feedback de {ex.name}</DialogTitle>
                          </DialogHeader>
                          <ExerciseFeedbackForm
                            defaultCompleted={!!ex.completed}
                            defaultPerformanceComment={ex.performanceComment || ''}
                            defaultAthleteNotes={ex.athleteNotes || ''}
                            defaultSets={ex.performedSets}
                            onSubmit={(payload) => {
                              const sid = (session.sessionId || (session as any)._id || '') as string;
                              const eid = (ex.exerciseId || (ex as any)._id || '') as string;
                              return handleSubmitExercise(sid, eid, payload);
                            }}
                            onSubmitSets={async (sets) => {
                              try {
                                await axiosInstance.patch('/training-plans/feedback/exercise-sets', {
                                  planId: id,
                                  sessionId: (session.sessionId || (session as any)._id || '') as string,
                                  exerciseId: (ex.exerciseId || (ex as any)._id || '') as string,
                                  sets: sets.map(s => ({
                                    setId: s.setId || '',
                                    completed: s.completed,
                                    repsPerformed: s.repsPerformed,
                                    loadUsed: s.loadUsed,
                                    measureAchieved: s.measureAchieved,
                                  })),
                                }, { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } });
                                toast.success('Series actualizadas');
                                const res = await axiosInstance.get(`/training-plans/${id}`);
                                setPlan(res.data);
                              } catch (err: any) {
                                console.error(err);
                                toast.error('Error actualizando series', { description: err?.response?.data?.message });
                              }
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>

                    {ex.mediaUrl && (
                      <div className="mt-2">
                        {ex.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={ex.mediaUrl} className="w-full max-w-md" controls />
                        ) : (
                          <img src={ex.mediaUrl} className="w-full max-w-md rounded" />
                        )}
                      </div>
                    )}

                    <div className="mt-3 grid grid-cols-4 gap-2 text-xs items-center">
                      <div className="text-center font-medium text-muted-foreground">Serie</div>
                      <div className="text-center font-medium text-muted-foreground">Reps</div>
                      <div className="text-center font-medium text-muted-foreground">Peso</div>
                      <div className="text-center font-medium text-muted-foreground">Completada</div>
                      {ex.performedSets.map((ps) => (
                        <React.Fragment key={ps.setId || ps.setNumber}>
                          <div className="text-center">{ps.setNumber}</div>
                          <div className="text-center">
                            {typeof ps.repsPerformed === 'number' ? ps.repsPerformed : '-'}
                          </div>
                          <div className="text-center">
                            {typeof ps.loadUsed === 'number' ? ps.loadUsed : '-'}
                          </div>
                          <div className="text-center">
                            {ps.completed ? 'Sí' : '—'}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseFeedbackForm({
  defaultCompleted,
  defaultPerformanceComment,
  defaultAthleteNotes,
  defaultSets,
  onSubmit,
  onSubmitSets,
}: {
  defaultCompleted: boolean;
  defaultPerformanceComment: string;
  defaultAthleteNotes: string;
  defaultSets: PerformedSet[];
  onSubmit: (data: { completed: boolean; performanceComment?: string; athleteNotes?: string; media?: File | null }) => void;
  onSubmitSets: (sets: PerformedSet[]) => void;
}) {
  const [completed, setCompleted] = useState(defaultCompleted);
  const [performanceComment, setPerformanceComment] = useState(defaultPerformanceComment);
  const [athleteNotes, setAthleteNotes] = useState(defaultAthleteNotes);
  const [media, setMedia] = useState<File | null>(null);
  const [sets, setSets] = useState<PerformedSet[]>(defaultSets);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ completed, performanceComment, athleteNotes, media });
      }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <input id="completed" type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
        <Label htmlFor="completed">Ejercicio completado</Label>
      </div>
      <div className="grid gap-2">
        <Label>Comentario de desempeño</Label>
        <Input value={performanceComment} onChange={(e) => setPerformanceComment(e.target.value)} placeholder="¿Superaste RPE/RIR/RM?" />
      </div>
      <div className="grid gap-2">
        <Label>Notas adicionales</Label>
        <Textarea value={athleteNotes} onChange={(e) => setAthleteNotes(e.target.value)} placeholder="Escribe tus notas" />
      </div>
      <div className="grid gap-2">
        <Label>Evidencia (imagen o video, opcional)</Label>
        <Input type="file" accept="image/*,video/*" onChange={(e) => setMedia(e.target.files?.[0] || null)} />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-2 text-xs items-center">
          <div className="text-center font-medium text-muted-foreground">Serie</div>
          <div className="text-center font-medium text-muted-foreground">Reps</div>
          <div className="text-center font-medium text-muted-foreground">Peso</div>
          <div className="text-center font-medium text-muted-foreground">Medida</div>
          <div className="text-center font-medium text-muted-foreground">OK</div>
          {sets.map((s, i) => (
            <React.Fragment key={s.setId || i}>
              <div className="text-center">{s.setNumber}</div>
              <div className="text-center">
                <Input
                  type="number"
                  value={typeof s.repsPerformed === 'number' ? s.repsPerformed : ''}
                  onChange={(e) => setSets(prev => prev.map((p, idx) => idx === i ? { ...p, repsPerformed: e.target.value ? parseInt(e.target.value) : null } : p))}
                />
              </div>
              <div className="text-center">
                <Input
                  type="number"
                  value={typeof s.loadUsed === 'number' ? s.loadUsed : ''}
                  onChange={(e) => setSets(prev => prev.map((p, idx) => idx === i ? { ...p, loadUsed: e.target.value ? parseFloat(e.target.value) : null } : p))}
                />
              </div>
              <div className="text-center">
                <Input
                  type="number"
                  value={typeof s.measureAchieved === 'number' ? s.measureAchieved : ''}
                  onChange={(e) => setSets(prev => prev.map((p, idx) => idx === i ? { ...p, measureAchieved: e.target.value ? parseFloat(e.target.value) : null } : p))}
                />
              </div>
              <div className="text-center">
                <input
                  type="checkbox"
                  checked={!!s.completed}
                  onChange={(e) => setSets(prev => prev.map((p, idx) => idx === i ? { ...p, completed: e.target.checked } : p))}
                />
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onSubmitSets(sets)}>Guardar series</Button>
          <Button type="submit">Guardar feedback</Button>
        </div>
      </div>
    </form>
  );
}

function SessionNotesForm({ defaultNotes, onSubmit }: { defaultNotes: string; onSubmit: (notes: string) => void }) {
  const [notes, setNotes] = useState(defaultNotes);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(notes);
      }}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label>Notas</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas generales de la sesión" />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}


