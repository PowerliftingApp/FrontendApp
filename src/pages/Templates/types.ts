// Interfaces para Templates
export interface PerformedSet {
  setId?: string;
  setNumber: number;
  repsPerformed?: number;
  loadUsed?: number;
  measureAchieved?: number;
  notes?: string;
}

export interface Exercise {
  exerciseId?: string;
  name: string;
  sets: number;
  reps: number;
  rpe?: number;
  rir?: number;
  rm?: number;
  notes?: string;
  weight?: number;
  performedSets: PerformedSet[];
}

export interface Session {
  sessionId?: string;
  sessionName: string;
  date: string;
  exercises: Exercise[];
}

export enum TemplateType {
  PREDEFINED = 'predefined',
  USER_CREATED = 'user_created'
}

export enum TemplatePredefinedCategory {
  FUERZA_BASICO = 'fuerza_basico',
  HIPERTROFIA = 'hipertrofia',
  RESISTENCIA = 'resistencia'
}

export interface Template {
  _id: string;
  name: string;
  description: string;
  type: TemplateType;
  predefinedCategory?: TemplatePredefinedCategory;
  createdBy?: string; // coachId string en lugar de objeto populated
  originalPlanId?: string;
  sessions: Session[];
  usageCount: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Mapeo de categorías para mostrar en español
export const CATEGORY_LABELS: Record<TemplatePredefinedCategory, string> = {
  [TemplatePredefinedCategory.FUERZA_BASICO]: 'Fuerza Básico',
  [TemplatePredefinedCategory.HIPERTROFIA]: 'Hipertrofia',
  [TemplatePredefinedCategory.RESISTENCIA]: 'Resistencia',
};

// Mapeo de tipos para mostrar en español
export const TYPE_LABELS: Record<TemplateType, string> = {
  [TemplateType.PREDEFINED]: 'Predefinida',
  [TemplateType.USER_CREATED]: 'Personalizada',
};
