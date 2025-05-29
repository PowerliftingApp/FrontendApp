import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import InitialConfigurationModal from './components/InitialConfigurationModal/InitialConfigurationModal';
import { Exercise, Session } from '../TrainingPlans/TrainingPlansTable/columns';

interface TrainingPlanForm {
  athleteId: string;
  coachId: string;
  name: string;
  startDate: string;
  endDate: string;
  sessions: Session[];
}

export default function CreateTrainingPlan() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(true);
  const [plan, setPlan] = useState<TrainingPlanForm>({
    athleteId: "",
    coachId: "COACH-1GMTFP",
    name: "",
    startDate: "",
    endDate: "",
    sessions: []
  });

  const handleModalContinue = (athleteId: string, templateId: string | null) => {
    setPlan(prev => ({
      ...prev,
      athleteId
    }));
    setShowModal(false);
    // Aquí se cargaría la plantilla si se seleccionó una
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
    try {
      const response = await fetch('http://localhost:3000/training-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (response.ok) {
        navigate('/dashboard/training-plans');
      } else {
        console.error('Error creating training plan');
      }
    } catch (error) {
      console.error('Error:', error);
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
              <Input
                id="startDate"
                type="date"
                value={plan.startDate}
                onChange={(e) => setPlan(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Fecha de Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={plan.endDate}
                onChange={(e) => setPlan(prev => ({ ...prev, endDate: e.target.value }))}
                required
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
                    <Input
                      type="date"
                      value={session.date}
                      onChange={(e) => updateSession(sessionIndex, 'date', e.target.value)}
                      required
                    />
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
