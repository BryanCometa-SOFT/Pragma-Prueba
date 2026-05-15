/**
 * Representa una tarea dentro de la aplicación de To-Do List.
 * Se utiliza como contrato de datos entre los servicios, componentes y el almacenamiento local.
 */
export interface Task {
  /** Identificador único generado con crypto.randomUUID() */
  id: string;
  /** Título descriptivo de la tarea (requerido) */
  title: string;
  /** Descripción opcional con detalles adicionales */
  description: string;
  /** Indica si la tarea ha sido completada */
  completed: boolean;
  /** ID de la categoría asignada, null si no tiene categoría */
  categoryId: string | null;
  /** Fecha y hora en que se creó la tarea */
  createdAt: Date;
  /** Fecha y hora en que se completó, null si sigue pendiente */
  completedAt: Date | null;
}
