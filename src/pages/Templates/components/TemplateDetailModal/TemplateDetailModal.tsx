import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Template, TemplateType, TYPE_LABELS, CATEGORY_LABELS } from "../../types";
import { ReactNode } from "react";
import React from "react";

interface TemplateDetailModalProps {
  template: Template;
  children: ReactNode;
}

export default function TemplateDetailModal({ template, children }: TemplateDetailModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="lg:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{template.name}</DialogTitle>
          <DialogDescription>
            Detalles completos de la plantilla de entrenamiento
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Información general */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Descripción</h4>
                    <p className="text-sm">{template.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Tipo</h4>
                    <Badge variant={template.type === TemplateType.PREDEFINED ? "default" : "secondary"}>
                      {TYPE_LABELS[template.type]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Categoría</h4>
                    {template.type === TemplateType.PREDEFINED && template.predefinedCategory ? (
                      <Badge variant="outline">
                        {CATEGORY_LABELS[template.predefinedCategory]}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">Personalizada</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Creado por</h4>
                    <p className="text-sm">
                      {template.type === TemplateType.PREDEFINED ? "Sistema" : (template.createdBy || "Sistema")}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Sesiones</h4>
                    <p className="text-sm font-semibold">{template.sessions.length}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Veces usada</h4>
                    <p className="text-sm font-semibold">{template.usageCount}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Estado</h4>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          template.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm">
                        {template.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sesiones */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sesiones de Entrenamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {template.sessions.map((session, sessionIndex) => (
                    <div key={sessionIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{session.sessionName}</h3>
                        <Badge variant="outline">{session.date}</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm text-muted-foreground">
                          Ejercicios ({session.exercises.length})
                        </h4>
                        
                        <div className="grid gap-3">
                          {session.exercises.map((exercise, exerciseIndex) => (
                            <div key={exerciseIndex} className="bg-transparent rounded p-3">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{exercise.name}</h5>
                                <div className="flex gap-2 text-sm text-muted-foreground">
                                  <span>{exercise.sets} series</span>
                                  <span>•</span>
                                  <span>{exercise.reps} reps</span>
                                  {exercise.rpe && (
                                    <>
                                      <span>•</span>
                                      <span>RPE {exercise.rpe}</span>
                                    </>
                                  )}
                                  {typeof (exercise as any).weight === 'number' && (
                                    <>
                                      <span>•</span>
                                      <span>Peso {String((exercise as any).weight)} kg</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {exercise.notes && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  <strong>Notas:</strong> {exercise.notes}
                                </p>
                              )}
                              
                              <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
                                <div className="text-center font-medium text-muted-foreground">Serie</div>
                                <div className="text-center font-medium text-muted-foreground">Reps</div>
                                <div className="text-center font-medium text-muted-foreground">Peso</div>
                                <div className="text-center font-medium text-muted-foreground">Notas</div>
                                
                                {exercise.performedSets.slice(0, 3).map((set, setIndex) => (
                                  <React.Fragment key={setIndex}>
                                    <div className="text-center">{set.setNumber}</div>
                                    <div className="text-center">{set.repsPerformed || '-'}</div>
                                    <div className="text-center">{set.loadUsed || '-'}</div>
                                    <div className="text-center">{set.notes || '-'}</div>
                                  </React.Fragment>
                                ))}
                                
                                {exercise.performedSets.length > 3 && (
                                  <div className="col-span-4 text-center text-muted-foreground text-xs">
                                    ... y {exercise.performedSets.length - 3} series más
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
