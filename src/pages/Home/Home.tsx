import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrainingPlan, Session } from "../TrainingPlans/TrainingPlansTable/columns";
import axiosInstance from "@/lib/axiosInstance";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Target, Eye } from "lucide-react";
import React from "react";

interface SheetData {
  type: 'plan' | 'session';
  plan?: TrainingPlan;
  session?: Session & { planName: string; athleteName: string };
}

export async function fetchPlans() {
  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  if (!user.coachId || user.role !== "coach") {
    throw new Error("Usuario no autorizado");
  }

  try {
    const response = await axiosInstance.get(
      `/training-plans/?coachId=${user.coachId}`
    );
    return response.data;
  } catch (error: any) {
    toast.error("Error al obtener planes", {
      description: error.message,
    });
  }
}

export default function MyCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetData, setSheetData] = useState<SheetData | null>(null);
  const navigate = useNavigate();

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  };

  const handleEventClick = (eventInfo: any) => {
    const eventType = eventInfo.event.extendedProps.type;
    const eventData = eventInfo.event.extendedProps.data;

    if (eventType === 'plan') {
      setSheetData({
        type: 'plan',
        plan: eventData
      });
    } else if (eventType === 'session') {
      setSheetData({
        type: 'session',
        session: eventData
      });
    }
    
    setIsSheetOpen(true);
  };

  function renderEventContent(eventInfo: any) {
    return (
      <div 
        style={{ padding: '6px 8px', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
        onClick={() => handleEventClick(eventInfo)}
      >
        <b>{eventInfo.event.title}</b>
      </div>
    );
  }

  useEffect(() => {
    const loadPlans = async () => {
      const plansData = await fetchPlans();
      if (!plansData) return;

      // Eventos de fondo (planes)
      const planEvents = plansData.map((plan: TrainingPlan) => ({
        title: `${plan.athleteId.fullName}: ${plan.name.toUpperCase()}`,
        start: format(new Date(plan.startDate), "yyyy-MM-dd"),
        end: format(new Date(plan.endDate), "yyyy-MM-dd"),
        color: "#5B4FFF",
        extendedProps: {
          type: 'plan',
          data: plan
        }
      }));

      // Eventos normales (sesiones)
      const sessionEvents = plansData.flatMap((plan: TrainingPlan) =>
        plan.sessions.map((session) => ({
          title: `${plan.athleteId.fullName}: ${session.sessionName}`,
          start: session.date,
          end: session.date,
          color: "#333369",
          textColor: "#fff",
          extendedProps: {
            type: 'session',
            data: {
              ...session,
              planName: plan.name,
              athleteName: plan.athleteId.fullName,
              planId: plan._id
            }
          }
        }))
      );

      setEvents([...planEvents, ...sessionEvents]);
    };

    loadPlans();
  }, []);

  const renderPlanSheet = () => {
    if (!sheetData?.plan) return null;
    
    const plan = sheetData.plan;
    
    return (
      <div className="space-y-6 p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Atleta</h4>
              <p className="text-sm font-semibold">{plan.athleteId.fullName}</p>
              <p className="text-xs text-muted-foreground">{plan.athleteId.email}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Duración</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(plan.startDate)} - {formatDate(plan.endDate)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Total de Sesiones</h4>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{plan.sessions.length}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Estado</h4>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Activo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Próximas Sesiones</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {plan.sessions.slice(0, 3).map((session, index) => (
              <div key={index} className="border rounded-lg p-3 bg-muted/30">
                <div className="flex items-center justify-between mb-1">
                  <h5 className="font-medium text-sm">{session.sessionName}</h5>
                  <Badge variant="outline" className="text-xs">
                    {formatDate(session.date)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {session.exercises.length} ejercicios programados
                </p>
              </div>
            ))}
            {plan.sessions.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                ... y {plan.sessions.length - 3} sesiones más
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={() => {
              navigate(`/dashboard/training-plans/detail?id=${plan._id}`);
              setIsSheetOpen(false);
            }}
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Plan Completo
          </Button>
        </div>
      </div>
    );
  };

  const renderSessionSheet = () => {
    if (!sheetData?.session) return null;
    
    const session = sheetData.session;
    
    return (
      <div className="space-y-6 p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Atleta</h4>
              <p className="text-sm font-semibold">{session.athleteName}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Plan</h4>
              <p className="text-sm">{session.planName}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Fecha</h4>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formatDate(session.date)}</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Ejercicios</h4>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">{session.exercises.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Ejercicios de la Sesión</h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {session.exercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} className="bg-muted/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{exercise.name}</CardTitle>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>{exercise.sets} series</span>
                      <span>•</span>
                      <span>{exercise.reps} reps</span>
                      {exercise.rpe && (
                        <>
                          <span>•</span>
                          <span>RPE {exercise.rpe}</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {exercise.notes && (
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Notas:</strong> {exercise.notes}
                    </p>
                  )}
                  
                  {exercise.performedSets.length > 0 && (
                    <div className="mt-2">
                      <h6 className="text-xs font-medium text-muted-foreground mb-1">
                        Series Realizadas
                      </h6>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        <div className="text-center font-medium text-muted-foreground">Serie</div>
                        <div className="text-center font-medium text-muted-foreground">Reps</div>
                        <div className="text-center font-medium text-muted-foreground">Carga</div>
                        <div className="text-center font-medium text-muted-foreground">Medida</div>
                        
                        {exercise.performedSets.slice(0, 3).map((set, setIndex) => (
                          <React.Fragment key={setIndex}>
                            <div className="text-center">{set.setNumber}</div>
                            <div className="text-center">{set.repsPerformed || '-'}</div>
                            <div className="text-center">{set.loadUsed || '-'}</div>
                            <div className="text-center">{set.measureAchieved || '-'}</div>
                          </React.Fragment>
                        ))}
                        
                        {exercise.performedSets.length > 3 && (
                          <div className="col-span-4 text-center text-muted-foreground text-xs">
                            ... y {exercise.performedSets.length - 3} series más
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={() => {
              navigate(`/dashboard/training-plans/detail?id=${(session as any).planId}`);
              setIsSheetOpen(false);
            }}
            variant="outline"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Plan Completo
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-16">
      <h1 className="text-2xl font-bold mb-6">Entrenamientos</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="es"
        events={events}
        height={800}
        eventDisplay="block"
        dayMaxEventRows={3}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        eventContent={renderEventContent}
      />
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>
              {sheetData?.type === 'plan' 
                ? `Plan: ${sheetData.plan?.name}`
                : `Sesión: ${sheetData?.session?.sessionName}`
              }
            </SheetTitle>
            <SheetDescription>
              {sheetData?.type === 'plan' 
                ? 'Información general del plan de entrenamiento'
                : 'Detalles de la sesión de entrenamiento'
              }
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6">
            {sheetData?.type === 'plan' && renderPlanSheet()}
            {sheetData?.type === 'session' && renderSessionSheet()}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
