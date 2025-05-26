import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es as esES } from "date-fns/locale";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Session,
  TrainingPlan,
} from "../TrainingPlans/TrainingPlansTable/columns";

const locales = {
  es: esES,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setIsLoading(true);
        const plansData: TrainingPlan[] = await fetchPlans();

        if (!plansData) return;

        const allEvents = plansData.flatMap((plan) =>
          plan.sessions.map((session: Session) => ({
            title:
              `${plan.athleteId.fullName} - ${plan.name}: ` +
              session.exercises
                .map((e) => `${e.name} ${e.sets}×${e.reps}`)
                .join(", "),
            start: new Date(session.date),
            end: new Date(session.date),
            allDay: true,
            resource: { ...session, planName: plan.name },
          }))
        );

        setEvents(allEvents);
      } catch (error) {
        console.error("Error al cargar los planes:", error);
        toast.error("Error al cargar los planes de entrenamiento");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlans();
  }, []);

  return (
    <div className="flex flex-col gap-y-3 mt-16">
      <h1 className="text-2xl font-bold mb-6">Entrenamientos</h1>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Cargando planes de entrenamiento...</p>
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={["month"]}
          messages={{
            month: "Mes",
            week: "Semana",
            day: "Día",
            today: "Hoy",
            previous: "Anterior",
            next: "Siguiente",
          }}
        />
      )}
    </div>
  );
}
