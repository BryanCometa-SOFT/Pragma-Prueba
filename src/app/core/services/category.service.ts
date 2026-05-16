import { Injectable, inject, signal, computed } from '@angular/core';
import { Category } from '../models/category.model';
import { StorageService } from './storage.service';

/**
 * Servicio de gestión de categorías.
 *
 * Responsable del CRUD de categorías con persistencia automática en Ionic Storage.
 * Expone señales reactivas para que los componentes se actualicen automáticamente.
 *
 * Misma arquitectura que TaskService: Signals + StorageService + APP_INITIALIZER.
 *
 * @providedIn 'root' - Singleton global.
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly storageKey = 'categories';
  private storage = inject(StorageService);

  /** Señal writable con el array completo de categorías */
  readonly categories = signal<Category[]>([]);

  /** Señal computada: total de categorías registradas */
  readonly count = computed(() => this.categories().length);

  /**
   * Inicializa el servicio cargando categorías desde Ionic Storage.
   * Invocado por APP_INITIALIZER en AppModule.
   */
  async init(): Promise<void> {
    const stored = await this.storage.get<Category[]>(this.storageKey);
    if (stored) {
      this.categories.set(stored);
    }
  }

  /**
   * Agrega una nueva categoría y persiste automáticamente.
   * @param name - Nombre de la categoría (se aplica trim).
   * @param color - Color hex (por defecto azul primario).
   * @param icon - Ícono de Ionic (por defecto folder).
   */
  add(name: string, icon = 'folder-outline'): Category {
    const category: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      icon,
    };
    this.categories.update((list) => [...list, category]);
    this.persist();
    return category;
  }

  /**
   * Actualiza campos de una categoría existente.
   * @returns La categoría actualizada o null si no se encontró.
   */
  update(id: string, changes: Partial<Omit<Category, 'id'>>): Category | null {
    let updated: Category | null = null;
    this.categories.update((list) =>
      list.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...changes };
        return updated;
      }),
    );
    if (updated) this.persist();
    return updated;
  }

  /**
   * Elimina una categoría permanentemente.
   * @returns true si se eliminó, false si el ID no existía.
   */
  delete(id: string): boolean {
    const before = this.categories().length;
    this.categories.update((list) => list.filter((c) => c.id !== id));
    if (this.categories().length < before) {
      this.persist();
      return true;
    }
    return false;
  }

  /** Busca una categoría por ID */
  getById(id: string): Category | undefined {
    return this.categories().find((c) => c.id === id);
  }

  private persist(): void {
    this.storage.set(this.storageKey, this.categories());
  }
}
