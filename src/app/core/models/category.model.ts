/**
 * Representa una categoría para agrupar tareas.
 * Cada categoría tiene un nombre y un ícono de Ionic.
 */
export interface Category {
  /** Identificador único */
  id: string;
  /** Nombre descriptivo de la categoría */
  name: string;
  /** Nombre del ícono de Ionic (ej: 'briefcase-outline') */
  icon: string;
}
