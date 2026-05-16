import { Injectable, inject, signal, computed } from '@angular/core';
import { Task } from '../models/task.model';
import { StorageService } from './storage.service';

/**
 * Servicio de gestión de tareas (To-Do List).
 *
 * Responsable de toda la lógica de negocio relacionada con tareas:
 * CRUD, toggle de completado, filtrado por categoría, reordenamiento
 * y persistencia automática a través de Ionic Storage (SQLite/IndexedDB).
 *
 * Utiliza Signals de Angular como fuente de verdad reactiva,
 * evitando suscripciones manuales y mejorando el rendimiento
 * al reducir ciclos de detección de cambios innecesarios.
 *
 * La inicialización de datos se realiza mediante APP_INITIALIZER
 * en AppModule, no en el constructor, respetando el ciclo de vida de Angular.
 *
 * @providedIn 'root' - Singleton global.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  /** Clave usada para persistir el array de tareas en Ionic Storage */
  private readonly storageKey = 'tasks';

  /**
   * Señal writable que contiene el array completo de tareas.
   * Es la fuente de verdad de la aplicación. Cualquier componente
   * que lea esta señal se actualizará automáticamente al cambiar los datos.
   */
  readonly tasks = signal<Task[]>([]);

  /** Señal computada: total de tareas registradas */
  readonly taskCount = computed(() => this.tasks().length);

  /** Señal computada: total de tareas pendientes (no completadas) */
  readonly pendingCount = computed(() => this.tasks().filter((t) => !t.completed).length);

  /** Señal computada: total de tareas completadas */
  readonly completedCount = computed(() => this.tasks().filter((t) => t.completed).length);

  /** Señal computada: array de tareas pendientes (más nuevas primero) */
  readonly pendingTasks = computed(() =>
    this.tasks()
      .filter((t) => !t.completed)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  );

  /** Señal computada: array de tareas completadas (más recientes primero) */
  readonly completedTasks = computed(() =>
    this.tasks()
      .filter((t) => t.completed)
      .sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))
  );

  private storage = inject(StorageService);

  /**
   * Inicializa el servicio cargando los datos desde Ionic Storage.
   * Invocado por APP_INITIALIZER antes del primer render.
   * La carga es asíncrona porque Ionic Storage usa IndexedDB/SQLite internamente.
   */
  async init(): Promise<void> {
    const stored = await this.storage.get<Task[]>(this.storageKey);
    if (stored && stored.length > 0) {
      // Al serializar/deserializar JSON, las fechas se convierten a string.
      // Las restauramos a objetos Date para poder formatearlas correctamente.
      const deserialized = stored.map((t) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        completedAt: t.completedAt ? new Date(t.completedAt) : null,
      }));
      this.tasks.set(deserialized);
    }
  }

  /** Genera 100 tareas de prueba con categorías aleatorias (solo en dev, si no hay datos) */
  seedIfEmpty(categoryIds: string[]): void {
    if (this.tasks().length > 0) return;
    const titles = [
      'Comprar víveres', 'Revisar correos', 'Actualizar el perfil', 'Hacer ejercicio',
      'Leer documentación', 'Preparar presentación', 'Llamar al cliente', 'Enviar reporte',
      'Revisar pull request', 'Escribir tests', 'Hacer deploy', 'Planificar sprint',
      'Revisar bugs', 'Actualizar dependencias', 'Refactorizar servicio', 'Crear componente',
      'Migrar base de datos', 'Optimizar queries', 'Configurar CI/CD', 'Documentar API',
      'Diseñar mockups', 'Implementar auth', 'Agregar validaciones', 'Corregir estilos',
      'Hacer code review', 'Actualizar README', 'Configurar logging', 'Crear backups',
      'Auditar seguridad', 'Optimizar imágenes', 'Agregar i18n', 'Migrar a signals',
      'Revisar accesibilidad', 'Escribir documentación', 'Hacer benchmark', 'Limpiar código',
      'Agregar analytics', 'Configurar alerts', 'Revisar memory leaks', 'Actualizar packages',
      'Diseñar arquitectura', 'Crear diagramas', 'Hacer user testing', 'Escribir historias',
      'Priorizar backlog', 'Revisar métricas', 'Configurar entornos', 'Crear scripts',
      'Auditar dependencias', 'Optimizar bundle', 'Agregar feature flags', 'Migrar storage',
      'Crear seed data', 'Agregar rate limiting', 'Configurar CORS', 'Revisar logs',
      'Actualizar certificados', 'Hacer pentesting', 'Configurar CDN', 'Optimizar lazy loading',
      'Agregar skeletons', 'Crear interceptors', 'Migrar formularios', 'Agregar guards',
      'Configurar interceptores', 'Revisar suscripciones', 'Optimizar change detection',
      'Agregar error handling', 'Crear pipes', 'Migrar a standalone', 'Agregar temas',
      'Configurar dark mode', 'Revisar animations', 'Agregar skeletons', 'Crear estado vacío',
      'Agregar paginación', 'Configurar infinite scroll', 'Revisar polyfills', 'Agregar service worker',
      'Configurar PWA', 'Revisar bundle size', 'Agregar trackBy', 'Optimizar ngFor',
      'Crear resolvers', 'Agregar breadcrumbs', 'Configurar meta tags', 'Revisar SEO',
      'Agregar sitemap', 'Crear RSS feed', 'Configurar redirects', 'Revisar dead code',
      'Agregar code splitting', 'Crear shared module', 'Migrar pipes puros', 'Agregar tipado estricto',
      'Revisar any types', 'Agregar generics', 'Crear utility types', 'Revisar imports circulares',
    ];
    const now = Date.now();
    for (let i = 0; i < 100; i++) {
      const completed = i >= 75;
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date(now - daysAgo * 86400000 - Math.random() * 86400000);
      this.tasks.update((tasks) => [...tasks, {
        id: crypto.randomUUID(),
        title: titles[i % titles.length] + (i >= titles.length ? ` #${Math.floor(i / titles.length) + 1}` : ''),
        description: Math.random() > 0.5 ? `Detalle de la tarea de prueba #${i + 1}` : '',
        completed,
        categoryId: categoryIds.length > 0 ? categoryIds[Math.floor(Math.random() * categoryIds.length)] : null,
        createdAt,
        completedAt: completed ? new Date(createdAt.getTime() + Math.random() * 86400000) : null,
      }]);
    }
    this.persist();
  }

  /**
   * Retorna una copia del array de tareas filtradas por categoría.
   *
   * @param categoryId - ID de la categoría a filtrar.
   */
  getByCategory(categoryId: string): Task[] {
    return this.tasks().filter((t) => t.categoryId === categoryId);
  }

  /**
   * Busca una tarea por su ID único.
   * @returns La tarea encontrada o undefined.
   */
  getById(id: string): Task | undefined {
    return this.tasks().find((t) => t.id === id);
  }

  /**
   * Crea una nueva tarea y la agrega al array.
   * Dispara automáticamente la persistencia en Ionic Storage (asíncrona, fire-and-forget).
   *
   * @param title - Título de la tarea (requerido, se aplica trim).
   * @param description - Descripción opcional.
   * @param categoryId - ID de la categoría asignada (opcional).
   * @returns La tarea recién creada.
   */
  add(title: string, description = '', categoryId: string | null = null): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      completed: false,
      categoryId,
      createdAt: new Date(),
      completedAt: null,
    };
    this.tasks.update((tasks) => [task, ...tasks]);
    this.persist();
    return task;
  }

  /**
   * Actualiza campos específicos de una tarea existente.
   * @param id - ID de la tarea a modificar.
   * @param changes - Objeto parcial con los campos a actualizar.
   *                  No permite modificar id ni createdAt.
   * @returns La tarea actualizada o null si no se encontró.
   */
  update(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
    let updated: Task | null = null;
    this.tasks.update((tasks) =>
      tasks.map((t) => {
        if (t.id !== id) return t;
        updated = { ...t, ...changes };
        return updated;
      }),
    );
    if (updated) {
      this.persist();
    }
    return updated;
  }

  /**
   * Alterna el estado completado/pendiente de una tarea.
   * Si se completa, registra la fecha de completado; si se desmarca, la borra.
   * @returns La tarea actualizada o null si no se encontró.
   */
  toggleComplete(id: string): Task | null {
    const task = this.tasks().find((t) => t.id === id);
    if (!task) return null;
    return this.update(id, {
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : null,
    });
  }

  /**
   * Elimina una tarea permanentemente.
   * @returns true si se eliminó, false si el ID no existía.
   */
  delete(id: string): boolean {
    const before = this.tasks().length;
    this.tasks.update((tasks) => tasks.filter((t) => t.id !== id));
    if (this.tasks().length < before) {
      this.persist();
      return true;
    }
    return false;
  }

  /**
   * Reordena las tareas moviendo un elemento de una posición a otra.
   * Útil para implementar drag & drop o botones de subir/bajar.
   */
  reorder(fromIndex: number, toIndex: number): void {
    this.tasks.update((tasks) => {
      const copy = [...tasks];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
    this.persist();
  }

  /**
   * Persiste el array de tareas en Ionic Storage.
   * Se ejecuta como fire-and-forget: no bloqueamos la UI esperando la escritura.
   * Si falla, los datos en memoria (señal) siguen siendo consistentes.
   */
  private persist(): void {
    this.storage.set(this.storageKey, this.tasks());
  }
}
