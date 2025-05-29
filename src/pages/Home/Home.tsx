import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrainingPlan } from "../TrainingPlans/TrainingPlansTable/columns";
import axiosInstance from "@/lib/axiosInstance";
import { format } from "date-fns";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();

  const handleEventClick = (eventInfo: any) => {
    if (eventInfo.event.extendedProps.athleteId) {
      navigate(`/dashboard/training-plans?athleteId=${eventInfo.event.extendedProps.athleteId}`);
    }
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
        title:  `${plan.athleteId.fullName}: ${plan.name.toUpperCase()}`,
        start: format(new Date(plan.startDate), "yyyy-MM-dd"),
        end: format(new Date(plan.endDate), "yyyy-MM-dd"),
        color: "#5B4FFF",
        athleteId: plan.athleteId._id
      }));

      // Eventos normales (sesiones)
      const sessionEvents = plansData.flatMap((plan: TrainingPlan) =>
        plan.sessions.map((session) => ({
          title:
            `${plan.athleteId.fullName}: ${session.sessionName} - ` +
            session.exercises
              .map((e) => `${e.name} ${e.sets}×${e.reps}`)
              .join(", "),
          start: session.date,
          end: session.date,
          color: "#333369",
          textColor: "#fff",
        }))
      );

      setEvents([...planEvents, ...sessionEvents]);
    };

    loadPlans();
  }, []);

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
    </div>
  );
}
