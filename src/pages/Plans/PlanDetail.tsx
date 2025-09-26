import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axiosInstance from "@/lib/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Eye } from "lucide-react";

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
  const [openFeedbackExercise, setOpenFeedbackExercise] = useState<
    string | null
  >(null);
  const [openSetsExercise, setOpenSetsExercise] = useState<string | null>(null);
  const [openNotesSessionId, setOpenNotesSessionId] = useState<string | null>(
    null
  );

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
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        setPlan(res.data);
      } catch (err: any) {
        console.error(err);
        toast.error("Error al cargar el plan", {
          description: err?.response?.data?.message,
        });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, navigate]);

  const isSessionCompleted = (session: Session) =>
    session.exercises.length > 0 &&
    session.exercises.every((e) => !!e.completed);

  const handleSubmitExercise = async (
    sessionId: string,
    exerciseId: string,
    form: {
      completed?: boolean;
      performanceComment?: string;
      athleteNotes?: string;
      media?: File | null;
    }
  ) => {
    const data = new FormData();
    data.append("planId", String(id));
    data.append("sessionId", sessionId);
    data.append("exerciseId", exerciseId);
    if (typeof form.completed === "boolean") {
      data.append("completed", String(form.completed));
    }
    if (form.performanceComment)
      data.append("performanceComment", form.performanceComment);
    if (form.athleteNotes) data.append("athleteNotes", form.athleteNotes);
    if (form.media) {
      data.append("media", form.media);
    }

    try {
      await axiosInstance.post("/training-plans/feedback/exercise", data, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      toast.success("Feedback guardado");
      // refrescar plan
      const res = await axiosInstance.get(`/training-plans/${id}`);
      setPlan(res.data);
      setOpenFeedbackExercise(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Error guardando feedback", {
        description: err?.response?.data?.message,
      });
    }
  };

  const handleSubmitSessionNotes = async (
    sessionId: string,
    sessionNotes: string
  ) => {
    try {
      await axiosInstance.patch(
        "/training-plans/feedback/session-notes",
        {
          planId: id,
          sessionId,
          sessionNotes,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Notas de la sesión guardadas");
      const res = await axiosInstance.get(`/training-plans/${id}`);
      setPlan(res.data);
      setOpenNotesSessionId(null);
    } catch (err: any) {
      console.error(err);
      toast.error("Error guardando notas", {
        description: err?.response?.data?.message,
      });
    }
  };

  const {
    totalSessions,
    completedSessions,
    totalExercises,
    completedExercises,
    totalSets,
    completedSets,
    progressSessionsPct,
    totalDays,
    daysLeft,
  } = useMemo(() => {
    if (!plan) {
      return {
        totalSessions: 0,
        completedSessions: 0,
        totalExercises: 0,
        completedExercises: 0,
        totalSets: 0,
        completedSets: 0,
        progressSessionsPct: 0,
        totalDays: 0,
        daysLeft: 0,
      };
    }
    const totalSessions = plan.sessions.length;
    const completedSessions = plan.sessions.filter(
      (s) => s.exercises.length > 0 && s.exercises.every((e) => !!e.completed)
    ).length;
    const allExercises = plan.sessions.flatMap((s) => s.exercises);
    const totalExercises = allExercises.length;
    const completedExercises = allExercises.filter((e) => !!e.completed).length;
    const totalSets = allExercises.reduce(
      (acc, e) => acc + (e.performedSets?.length || 0),
      0
    );
    const completedSets = allExercises.reduce(
      (acc, e) =>
        acc + (e.performedSets?.filter((ps) => !!ps.completed).length || 0),
      0
    );
    const progressSessionsPct = totalSessions
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0;
    const start = new Date(plan.startDate as any);
    const end = new Date(plan.endDate as any);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const totalDays = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / msPerDay)
    );
    const daysLeft = Math.max(
      0,
      Math.ceil((end.getTime() - now.getTime()) / msPerDay)
    );
    return {
      totalSessions,
      completedSessions,
      totalExercises,
      completedExercises,
      totalSets,
      completedSets,
      progressSessionsPct,
      totalDays,
      daysLeft,
    };
  }, [plan]);

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold mt-4">{plan.name}</h2>
        <div className="text-sm text-muted-foreground">
          {new Date(plan.startDate).toLocaleDateString()} -{" "}
          {new Date(plan.endDate).toLocaleDateString()}
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-md border p-3 bg-emerald-50 border-emerald-200">
              <div className="text-xs text-muted-foreground">Sesiones</div>
              <div className="text-lg font-semibold text-emerald-700">
                {completedSessions}/{totalSessions}
              </div>
            </div>
            <div className="rounded-md border p-3 bg-indigo-50 border-indigo-200">
              <div className="text-xs text-muted-foreground">Ejercicios</div>
              <div className="text-lg font-semibold text-indigo-700">
                {completedExercises}/{totalExercises}
              </div>
            </div>
            <div className="rounded-md border p-3 bg-sky-50 border-sky-200">
              <div className="text-xs text-muted-foreground">Series</div>
              <div className="text-lg font-semibold text-sky-700">
                {completedSets}/{totalSets}
              </div>
            </div>
            <div className="rounded-md border p-3 bg-purple-50 border-purple-200">
              <div className="text-xs text-muted-foreground">Progreso</div>
              <div className="text-lg font-semibold text-purple-700">
                {progressSessionsPct}%
              </div>
            </div>
            <div className="rounded-md border p-3 bg-zinc-50 border-zinc-200">
              <div className="text-xs text-muted-foreground">Duración</div>
              <div className="text-lg font-semibold text-zinc-700">
                {totalDays} días
              </div>
            </div>
            <div className="rounded-md border p-3 bg-amber-50 border-amber-200">
              <div className="text-xs text-muted-foreground">
                Días restantes
              </div>
              <div className="text-lg font-semibold text-amber-700">
                {daysLeft}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sesiones</h2>
        {plan.sessions.map((session) => {
          const disabled = isSessionCompleted(session);
          const sessionKey = (session.sessionId ||
            (session as any)._id ||
            session.sessionName) as string;
          const sessionStableId = (session.sessionId ||
            (session as any)._id ||
            "") as string;
          return (
            <Card
              key={sessionKey}
              className={`border-l-4 ${
                disabled ? "border-l-green-500" : "border-l-amber-500"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="max-w-lg">
                  <div className="flex items-center gap-2">
                    <CardTitle className="truncate">
                      {session.sessionName}
                    </CardTitle>
                    <Badge
                      className={
                        disabled
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : "bg-amber-500 text-white hover:bg-amber-600"
                      }
                    >
                      {disabled ? "Completada" : "Pendiente"}
                    </Badge>
                  </div>
                  {!!session.sessionNotes && (
                    <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap truncate">
                      {session.sessionNotes}
                    </div>
                  )}
                </div>
                <Dialog
                  open={openNotesSessionId === sessionStableId}
                  onOpenChange={(o) =>
                    setOpenNotesSessionId(o ? sessionStableId : null)
                  }
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">Añadir notas de sesión</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Notas de la sesión</DialogTitle>
                    </DialogHeader>
                    <SessionNotesForm
                      defaultNotes={session.sessionNotes || ""}
                      onSubmit={(notes) =>
                        handleSubmitSessionNotes(sessionStableId, notes)
                      }
                    />
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-3">
                <h4 className="text-sm font-medium">Ejercicios</h4>
                {session.exercises.map((ex) => {
                  const eid = (ex.exerciseId ||
                    (ex as any)._id ||
                    "") as string;
                  return (
                    <div
                      key={ex.exerciseId || ex.name}
                      className={`border rounded p-3 ${
                        ex.completed ? "border-green-500" : "border-amber-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{ex.name}</div>
                            <Badge
                              className={
                                ex.completed
                                  ? "bg-green-500 text-white"
                                  : "bg-amber-500 text-white"
                              }
                            >
                              {ex.completed ? "Completado" : "Pendiente"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {ex.sets}x{ex.reps}
                            {typeof ex.rpe === "number"
                              ? ` • RPE ${ex.rpe}`
                              : ""}
                            {typeof ex.rir === "number"
                              ? ` • RIR ${ex.rir}`
                              : ""}
                            {typeof ex.rm === "number" ? ` • RM ${ex.rm}` : ""}
                            {typeof ex.weight === "number"
                              ? ` • ${ex.weight} kg`
                              : ""}
                            {ex.notes ? ` • ${ex.notes}` : ""}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog
                            open={openSetsExercise === eid}
                            onOpenChange={(o) =>
                              setOpenSetsExercise(o ? eid : null)
                            }
                          >
                            <DialogTrigger asChild>
                              <Button variant="outline">Editar series</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Series de {ex.name}</DialogTitle>
                              </DialogHeader>
                              <ExerciseSetsForm
                                defaultSets={ex.performedSets}
                                onSubmit={async (sets) => {
                                  try {
                                    await axiosInstance.patch(
                                      "/training-plans/feedback/exercise-sets",
                                      {
                                        planId: id,
                                        sessionId: (session.sessionId ||
                                          (session as any)._id ||
                                          "") as string,
                                        exerciseId: (ex.exerciseId ||
                                          (ex as any)._id ||
                                          "") as string,
                                        sets: sets.map((s) => ({
                                          setId: s.setId || "",
                                          completed: s.completed,
                                          repsPerformed: s.repsPerformed,
                                          loadUsed: s.loadUsed,
                                          measureAchieved: s.measureAchieved,
                                        })),
                                      },
                                      {
                                        headers: {
                                          Authorization: `Bearer ${sessionStorage.getItem(
                                            "token"
                                          )}`,
                                        },
                                      }
                                    );
                                    toast.success("Series actualizadas");
                                    const res = await axiosInstance.get(
                                      `/training-plans/${id}`
                                    );
                                    setPlan(res.data);
                                    setOpenSetsExercise(null);
                                  } catch (err: any) {
                                    console.error(err);
                                    toast.error("Error actualizando series", {
                                      description: err?.response?.data?.message,
                                    });
                                  }
                                }}
                              />
                            </DialogContent>
                          </Dialog>

                          {ex.mediaUrl && (
                            <div>
                              <EvidenceModal
                                mediaUrl={ex.mediaUrl}
                                trigger={
                                  <Button
                                    variant="outline"
                                    className="w-full"
                                  >
                                    <Eye />
                                    Ver evidencia
                                  </Button>
                                }
                              />
                            </div>
                          )}

                          <Dialog
                            open={openFeedbackExercise === eid}
                            onOpenChange={(o) =>
                              setOpenFeedbackExercise(o ? eid : null)
                            }
                          >
                            <DialogTrigger asChild>
                              {ex.completed ? (
                                <Button variant="secondary">
                                  Editar feedback
                                </Button>
                              ) : (
                                <span />
                              )}
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Feedback de {ex.name}</DialogTitle>
                              </DialogHeader>
                              <ExerciseFeedbackForm
                                defaultCompleted={!!ex.completed}
                                defaultPerformanceComment={
                                  ex.performanceComment || ""
                                }
                                defaultAthleteNotes={ex.athleteNotes || ""}
                                onSubmit={(payload) => {
                                  const sid = (session.sessionId ||
                                    (session as any)._id ||
                                    "") as string;
                                  const eid2 = (ex.exerciseId ||
                                    (ex as any)._id ||
                                    "") as string;
                                  return handleSubmitExercise(
                                    sid,
                                    eid2,
                                    payload
                                  ).then(() => setOpenFeedbackExercise(null));
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">
                          Performed sets
                        </div>
                        <div className="grid grid-cols-4 gap-2 text-xs items-center">
                          <div className="text-center font-medium text-muted-foreground">
                            Serie
                          </div>
                          <div className="text-center font-medium text-muted-foreground">
                            Repeticiones
                          </div>
                          <div className="text-center font-medium text-muted-foreground">
                            Peso
                          </div>
                          <div className="text-center font-medium text-muted-foreground">
                            Completada
                          </div>
                          {ex.performedSets.map((ps) => (
                            <React.Fragment key={ps.setId || ps.setNumber}>
                              <div className="text-center">{ps.setNumber}</div>
                              <div className="text-center">
                                {typeof ps.repsPerformed === "number"
                                  ? ps.repsPerformed
                                  : "-"}
                              </div>
                              <div className="text-center">
                                {typeof ps.loadUsed === "number"
                                  ? ps.loadUsed
                                  : "-"}
                              </div>
                              <div className="text-center">
                                {ps.completed ? "Sí" : "—"}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseFeedbackForm({
  defaultPerformanceComment,
  defaultAthleteNotes,
  onSubmit,
}: {
  defaultCompleted: boolean;
  defaultPerformanceComment: string;
  defaultAthleteNotes: string;
  onSubmit: (data: {
    completed?: boolean;
    performanceComment?: string;
    athleteNotes?: string;
    media?: File | null;
  }) => void;
}) {
  const [performanceComment, setPerformanceComment] = useState(
    defaultPerformanceComment
  );
  const [athleteNotes, setAthleteNotes] = useState(defaultAthleteNotes);
  const [media, setMedia] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ performanceComment, athleteNotes, media });
      }}
      className="space-y-4"
    >
      <div className="grid gap-2">
        <Label>Comentario de desempeño</Label>
        <Input
          value={performanceComment}
          onChange={(e) => setPerformanceComment(e.target.value)}
          placeholder="¿Superaste RPE/RIR/RM?"
        />
      </div>
      <div className="grid gap-2">
        <Label>Notas adicionales</Label>
        <Textarea
          value={athleteNotes}
          onChange={(e) => setAthleteNotes(e.target.value)}
          placeholder="Escribe tus notas"
        />
      </div>
      <div className="grid gap-2">
        <Label>Evidencia (imagen o video, opcional)</Label>
        <Input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;
            setMedia(file);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            if (file) setPreviewUrl(URL.createObjectURL(file));
            else setPreviewUrl(null);
          }}
        />
        {previewUrl && (
          <div className="mt-2 flex justify-center">
            {media && /\.(mp4|webm|ogg)$/i.test(media.name) ? (
              <video
                src={previewUrl}
                className="max-w-full max-h-32 object-contain rounded"
                controls
              />
            ) : (
              <img
                src={previewUrl}
                className="max-w-full max-h-32 object-contain rounded"
                alt="Preview"
              />
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Guardar feedback</Button>
      </div>
    </form>
  );
}

function SessionNotesForm({
  defaultNotes,
  onSubmit,
}: {
  defaultNotes: string;
  onSubmit: (notes: string) => void;
}) {
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
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas generales de la sesión"
        />
      </div>
      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}

function ExerciseSetsForm({
  defaultSets,
  onSubmit,
}: {
  defaultSets: PerformedSet[];
  onSubmit: (sets: PerformedSet[]) => void;
}) {
  const [sets, setSets] = useState<PerformedSet[]>(defaultSets);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});

  const validateSets = (setsToValidate: PerformedSet[]): boolean => {
    const newErrors: { [key: number]: string } = {};
    let isValid = true;

    setsToValidate.forEach((set, index) => {
      if (set.completed) {
        if (set.repsPerformed === null || set.repsPerformed === undefined) {
          newErrors[index] = "Repeticiones requeridas";
          isValid = false;
        }
        if (set.loadUsed === null || set.loadUsed === undefined) {
          newErrors[index] = newErrors[index]
            ? "Repeticiones y peso requeridos"
            : "Peso requerido";
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateSets(sets)) {
      onSubmit(sets);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-5 gap-2 text-xs items-center">
        <div className="text-center font-medium text-muted-foreground">
          Serie
        </div>
        <div className="text-center font-medium text-muted-foreground">
          Reps
        </div>
        <div className="text-center font-medium text-muted-foreground">
          Peso
        </div>
        <div className="text-center font-medium text-muted-foreground">RPE</div>
        <div className="text-center font-medium text-muted-foreground">
          Completada
        </div>
        {sets.map((s, i) => (
          <React.Fragment key={s.setId || i}>
            <div className="text-center">{s.setNumber}</div>
            <div className="text-center">
              <Input
                type="number"
                min={0}
                step={1}
                value={
                  typeof s.repsPerformed === "number" ? s.repsPerformed : ""
                }
                onChange={(e) => {
                  setSets((prev) =>
                    prev.map((p, idx) => {
                      if (idx !== i) return p;
                      const v = e.target.value
                        ? Math.max(0, parseInt(e.target.value))
                        : null;
                      return { ...p, repsPerformed: v };
                    })
                  );
                  // Limpiar error cuando se cambia el valor
                  if (errors[i]) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors[i];
                      return newErrors;
                    });
                  }
                }}
                className={errors[i] ? "border-red-500" : ""}
              />
            </div>
            <div className="text-center">
              <Input
                type="number"
                min={0}
                step={0.5}
                value={typeof s.loadUsed === "number" ? s.loadUsed : ""}
                onChange={(e) => {
                  setSets((prev) =>
                    prev.map((p, idx) => {
                      if (idx !== i) return p;
                      const v = e.target.value
                        ? Math.max(0, parseFloat(e.target.value))
                        : null;
                      return { ...p, loadUsed: v };
                    })
                  );
                  // Limpiar error cuando se cambia el valor
                  if (errors[i]) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors[i];
                      return newErrors;
                    });
                  }
                }}
                className={errors[i] ? "border-red-500" : ""}
              />
            </div>
            <div className="text-center">
              <Input
                type="number"
                min={0}
                step={0.5}
                value={
                  typeof s.measureAchieved === "number" ? s.measureAchieved : ""
                }
                onChange={(e) =>
                  setSets((prev) =>
                    prev.map((p, idx) => {
                      if (idx !== i) return p;
                      const v = e.target.value
                        ? Math.max(0, parseFloat(e.target.value))
                        : null;
                      return { ...p, measureAchieved: v };
                    })
                  )
                }
              />
            </div>
            <div className="flex items-center justify-center">
              <Switch
                checked={!!s.completed}
                onCheckedChange={(v: boolean) => {
                  setSets((prev) =>
                    prev.map((p, idx) =>
                      idx === i ? { ...p, completed: !!v } : p
                    )
                  );
                  // Limpiar error cuando se cambia el switch
                  if (errors[i]) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors[i];
                      return newErrors;
                    });
                  }
                }}
              />
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Mostrar errores de validación */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-800 font-medium mb-2">
            Por favor corrige los siguientes errores:
          </div>
          {Object.entries(errors).map(([index, error]) => (
            <div key={index} className="text-sm text-red-600">
              • Serie {parseInt(index) + 1}: {error}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit">Guardar series</Button>
      </div>
    </form>
  );
}

function EvidenceModal({
  mediaUrl,
  trigger,
}: {
  mediaUrl: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Evidencia del ejercicio</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center items-center min-h-[400px] bg-black rounded-lg overflow-hidden">
          {isVideo ? (
            <video
              src={`${
                import.meta.env.VITE_API_URL || "http://localhost:3000/"
              }${mediaUrl}`}
              className="max-w-full max-h-full"
              controls
              autoPlay
            />
          ) : (
            <img
              src={`${
                import.meta.env.VITE_API_URL || "http://localhost:3000/"
              }${mediaUrl}`}
              className="max-w-full max-h-full object-contain"
              alt="Evidencia del ejercicio"
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
