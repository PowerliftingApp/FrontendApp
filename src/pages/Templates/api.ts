import axiosInstance from "@/lib/axiosInstance";
import { Template, TemplateType } from "./types";

// Obtener todas las plantillas con filtros opcionales
export async function fetchTemplates(params?: {
  type?: TemplateType;
  createdBy?: string;
  predefined?: boolean;
}): Promise<Template[]> {
  try {
    const searchParams = new URLSearchParams();
    
    if (params?.type) {
      searchParams.append('type', params.type);
    }
    if (params?.createdBy) {
      searchParams.append('createdBy', params.createdBy);
    }
    if (params?.predefined) {
      searchParams.append('predefined', 'true');
    }

    const url = `/templates${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener plantillas');
  }
}

// Obtener plantillas para un entrenador específico
export async function fetchTemplatesForCoach(coachId: string): Promise<Template[]> {
  try {
    // Obtener plantillas predefinidas y las creadas por el entrenador
    const [predefinedTemplates, userTemplates] = await Promise.all([
      fetchTemplates({ predefined: true }),
      fetchTemplates({ createdBy: coachId })
    ]);

    return [...predefinedTemplates, ...userTemplates];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener plantillas del entrenador');
  }
}

// Obtener una plantilla específica
export async function fetchTemplate(id: string): Promise<Template> {
  try {
    const response = await axiosInstance.get(`/templates/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener la plantilla');
  }
}

// Obtener plantillas más utilizadas
export async function fetchMostUsedTemplates(limit: number = 10): Promise<Template[]> {
  try {
    const response = await axiosInstance.get(`/templates/most-used?limit=${limit}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al obtener plantillas más utilizadas');
  }
}

// Eliminar una plantilla (solo las creadas por usuario)
export async function deleteTemplate(id: string): Promise<void> {
  try {
    await axiosInstance.delete(`/templates/${id}`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al eliminar la plantilla');
  }
}

// Incrementar contador de uso de una plantilla
export async function incrementTemplateUsage(id: string): Promise<void> {
  try {
    await axiosInstance.patch(`/templates/${id}/increment-usage`);
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al incrementar uso de la plantilla');
  }
}

// Crear plantilla desde un plan de entrenamiento
export async function createTemplateFromPlan(data: {
  planId: string;
  name: string;
  description: string;
  createdBy: string;
}): Promise<Template> {
  try {
    const response = await axiosInstance.post('/templates/from-plan', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Error al crear plantilla desde plan');
  }
}
