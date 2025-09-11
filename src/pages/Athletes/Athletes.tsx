import { AthletesTable } from "./AthletesTable/AthletesTable";
import { createColumns } from "./AthletesTable/columns";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Athlete } from "./AthletesTable/columns";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { LinkAthleteModal } from "./components/LinkAthleteModal";
import { AthleteDetailModal } from "./components/AthleteDetailModal";

export default function Athletes() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAthletes = async () => {
    try {
      // Obtener el usuario del sessionStorage
      const userStr = sessionStorage.getItem("user");
      if (!userStr) {
        toast.error("No se encontró información del usuario");
        navigate("/");
        return;
      }

      const user = JSON.parse(userStr);
      setUser(user);
      // Verificar que el usuario sea un coach
      if (user.role !== "coach") {
        toast.error("Solo los entrenadores pueden ver sus atletas");
        navigate("/dashboard");
        return;
      }

      // Verificar que tenga coachId
      if (!user.coachId) {
        toast.error("No se encontró el ID del entrenador");
        navigate("/dashboard");
        return;
      }

      // Hacer la petición al endpoint
      const response = await axiosInstance.get(`/users/athletes/${user.coachId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      setAthletes(response.data);
    } catch (error: any) {
      console.error("Error al obtener atletas:", error);
      toast.error("Error al cargar los atletas", {
        description: error.response?.data?.message || "Intenta nuevamente más tarde",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, [navigate]);

  const handleLinkSuccess = () => {
    // Recargar la lista de atletas después de vincular uno nuevo
    setIsLoading(true);
    fetchAthletes();
  };

  const handleViewDetails = (athleteId: string) => {
    setSelectedAthleteId(athleteId);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedAthleteId(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Tus Atletas</h1>
        <p>Cargando atletas...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-6">Tus Atletas</h1>
        {/* Mostrar el coach id de forma informativa */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="text-sm text-gray-500">
              <p>ID de entrenador: {user.coachId}</p>
            </div>
          )}
          <Button onClick={() => setIsLinkModalOpen(true)}>
            <PlusIcon className="w-4 h-4" />
            Vincular Atleta
          </Button>
        </div>
      </div>
      <AthletesTable columns={createColumns(handleViewDetails)} data={athletes} />
      
      <LinkAthleteModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={handleLinkSuccess}
      />

      <AthleteDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        athleteId={selectedAthleteId}
      />
    </div>
  );
}
