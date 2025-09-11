import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Trash2 } from "lucide-react";
import InitialConfigurationModal from './components/InitialConfigurationModal/InitialConfigurationModal';
import { Exercise, Session } from '../TrainingPlans/TrainingPlansTable/columns';
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { format, parseISO, isAfter, isBefore } from "date-fns";

interface TrainingPlanForm {
  athleteId: string;
  coachId: string;
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  sessions: Session[];
}

export default function CreateTrainingPlan() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [plan, setPlan] = useState<TrainingPlanForm>({
    athleteId: "",
    coachId: "",
    name: "",
    startDate: undefined,
    endDate: undefined,
    sessions: []
  });

  // Cargar el coachId del usuario autenticado al montar el componente
  useEffect(() => {
    const userStr = sessionStorage.getItem("user");
    if (!userStr) {
      toast.error("No se encontró información del usuario");
      navigate("/");
      return;
    }

    const user = JSON.parse(userStr);
    
    // Verificar que el usuario sea un coach
    if (user.role !== "coach") {
      toast.error("Solo los entrenadores pueden crear planes de entrenamiento");
      navigate("/dashboard");
      return;
    }

    // Verificar que tenga coachId
    if (!user.coachId) {
      toast.error("No se encontró el ID del entrenador");
      navigate("/dashboard");
      return;
    }

    // Cargar el coachId en el formulario
    setPlan(prev => ({
      ...prev,
      coachId: user.coachId
    }));
  }, [navigate]);

  // Validaciones de fechas
  const validateDates = () => {
    if (!plan.startDate || !plan.endDate) {
      toast.error("Debe seleccionar fechas de inicio y fin del plan");
      return false;
    }

    if (isAfter(plan.startDate, plan.endDate)) {
      toast.error("La fecha de inicio no puede ser posterior a la fecha de fin");
      return false;
    }

    // Validar fechas de sesiones (obligatorias y dentro del rango)
    for (let i = 0; i < plan.sessions.length; i++) {
      const session = plan.sessions[i];
      if (!session.date) {
        toast.error(`La sesión "${session.sessionName || `Sesión ${i + 1}`}" debe tener una fecha`);
        return false;
      }
      const sessionDate = parseISO(session.date);
      if (isBefore(sessionDate, plan.startDate) || isAfter(sessionDate, plan.endDate)) {
        toast.error(`La fecha de la sesión "${session.sessionName || `Sesión ${i + 1}`}" debe estar entre las fechas del plan`);
        return false;
      }
    }

    return true;
  };

  const isSessionDateDisabled = (date: Date) => {
    if (!plan.startDate || !plan.endDate) return false;
    return isBefore(date, plan.startDate) || isAfter(date, plan.endDate);
  };

  const handleModalContinue = async (athleteId: string, template: any | null) => {
    if (template) {
      // Incrementar contador de uso de la plantilla
      try {
        await axiosInstance.patch(`/templates/${template._id}/increment-usage`);
      } catch (error) {
        console.error("Error incrementing template usage:", error);
      }

      // Precargar datos desde la plantilla (forzamos fecha vacía para que el usuario seleccione una válida)
      setPlan(prev => ({
        ...prev,
        athleteId,
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        sessions: template.sessions.map((session: any) => ({
          ...session,
          date: '',
          exercises: session.exercises.map((exercise: any) => ({
            ...exercise,
            performedSets: exercise.performedSets.map((set: any) => ({
              ...set,
              repsPerformed: null,
              loadUsed: null,
              measureAchieved: null,
              notes: ""
            }))
          }))
        }))
      }));
      toast.success(`Plantilla "${template.name}" cargada exitosamente`);
      toast.message('Selecciona una fecha para cada sesión', { description: 'Las sesiones importadas requieren fecha dentro del rango del plan.' });
    } else {
      // Crear desde cero
      setPlan(prev => ({
        ...prev,
        athleteId
      }));
    }
    setShowModal(false);
  };

  const addSession = () => {
    const newSession: Session = {
      sessionName: "",
      date: "",
      exercises: []
    };
    setPlan(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession]
    }));
  };

  const removeSession = (index: number) => {
    setPlan(prev => ({
      ...prev,
      sessions: prev.sessions.filter((_, i) => i !== index)
    }));
  };

  const updateSession = (index: number, field: keyof Session, value: string) => {
    setPlan(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === index ? { ...session, [field]: value } : session
      )
    }));
  };

  const addExercise = (sessionIndex: number) => {
    const newExercise: Exercise = {
      name: "",
      sets: 0,
      reps: 0,
      rpe: null,
      rir: null,
      rm: null,
      notes: null,
      weight: null,
      performedSets: []
    };
    setPlan(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === sessionIndex 
          ? { ...session, exercises: [...session.exercises, newExercise] }
          : session
      )
    }));
  };

  const removeExercise = (sessionIndex: number, exerciseIndex: number) => {
    setPlan(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === sessionIndex 
          ? { 
              ...session, 
              exercises: session.exercises.filter((_, j) => j !== exerciseIndex)
            }
          : session
      )
    }));
  };

  const updateExercise = (
    sessionIndex: number, 
    exerciseIndex: number, 
    field: keyof Exercise, 
    value: any
  ) => {
    setPlan(prev => ({
      ...prev,
      sessions: prev.sessions.map((session, i) => 
        i === sessionIndex 
          ? {
              ...session,
              exercises: session.exercises.map((exercise, j) =>
                j === exerciseIndex
                  ? { ...exercise, [field]: value }
                  : exercise
              )
            }
          : session
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que todos los campos obligatorios estén completos
    if (!plan.coachId) {
      toast.error("Error: No se encontró el ID del entrenador");
      return;
    }
    
    if (!plan.athleteId) {
      toast.error("Error: No se seleccionó un atleta");
      return;
    }

    // Validar fechas
    if (!validateDates()) {
      return;
    }

    // Preparar los datos para enviar al backend
    const planData = {
      ...plan,
      startDate: plan.startDate ? format(plan.startDate, 'yyyy-MM-dd') : '',
      endDate: plan.endDate ? format(plan.endDate, 'yyyy-MM-dd') : ''
    };

    try {
      const response = await axiosInstance.post('/training-plans', planData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Plan de entrenamiento creado correctamente");
        navigate('/dashboard/training-plans');
      }
    } catch (error: any) {
      console.error('Error creating training plan:', error);
      toast.error("Error al crear el plan de entrenamiento", {
        description: error.response?.data?.message || "Intenta nuevamente más tarde",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Plan</Label>
            <Input
              id="name"
              placeholder="Ej: FUERZA"
              value={plan.name}
              onChange={(e) => setPlan(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Fecha de Inicio</Label>
              <DatePicker
                date={plan.startDate}
                onDateChange={(date) => setPlan(prev => ({ ...prev, startDate: date }))}
                placeholder="Seleccionar fecha de inicio"
                className="w-full"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <DatePicker
                date={plan.endDate}
                onDateChange={(date) => setPlan(prev => ({ ...prev, endDate: date }))}
                placeholder="Seleccionar fecha de fin"
                minDate={plan.startDate}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {plan.sessions.map((session, sessionIndex) => (
            <Card key={sessionIndex}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Sesión {sessionIndex + 1}</CardTitle>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => removeSession(sessionIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Nombre de la Sesión</Label>
                    <Input
                      value={session.sessionName}
                      placeholder="Ej: Sesión de fuerza"
                      onChange={(e) => updateSession(sessionIndex, 'sessionName', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Fecha</Label>
                    <DatePicker
                      date={session.date ? parseISO(session.date) : undefined}
                      onDateChange={(date) => updateSession(sessionIndex, 'date', date ? format(date, 'yyyy-MM-dd') : '')}
                      placeholder="Seleccionar fecha de la sesión"
                      disabled={isSessionDateDisabled}
                      minDate={plan.startDate}
                      maxDate={plan.endDate}
                      className="w-full"
                    />
                    {(!plan.startDate || !plan.endDate) && (
                      <p className="text-sm text-muted-foreground">
                        Primero selecciona las fechas del plan
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {session.exercises.map((exercise, exerciseIndex) => (
                    <Card key={exerciseIndex}>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Ejercicio {exerciseIndex + 1}</CardTitle>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeExercise(sessionIndex, exerciseIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                          <Label>Nombre del Ejercicio</Label>
                          <Input
                            value={exercise.name}
                            placeholder="Ej: Press Banca"
                            onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label>Series</Label>
                            <Input
                              type="number"
                              value={exercise.sets}
                              onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'sets', parseInt(e.target.value))}
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Repeticiones</Label>
                            <Input
                              type="number"
                              value={exercise.reps}
                              onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'reps', parseInt(e.target.value))}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="grid gap-2">
                            <Label>RPE</Label>
                            <Input
                              type="number"
                              value={exercise.rpe || ''}
                              onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'rpe', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>RIR</Label>
                            <Input
                              type="number"
                              value={exercise.rir || ''}
                              onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'rir', e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>Peso (kg)</Label>
                            <Input
                              type="number"
                              value={exercise.weight || ''}
                              onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'weight', e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label>RM</Label>
                            <Input
                              type="number"
                              value={exercise.rm || ''}
                              onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'rm', e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label>Notas</Label>
                          <Input
                            value={exercise.notes || ''}
                            placeholder="Ej: Notas del ejercicio"
                            onChange={(e) => updateExercise(sessionIndex, exerciseIndex, 'notes', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addExercise(sessionIndex)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Ejercicio
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={addSession}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Añadir Sesión
          </Button>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/training-plans')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            Crear Plan
          </Button>
        </div>
      </form>

      <InitialConfigurationModal
        isOpen={showModal}
        onClose={() => navigate('/dashboard/training-plans')}
        onContinue={handleModalContinue}
      />
    </div>
  );
}
