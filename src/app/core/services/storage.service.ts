import { Injectable, inject } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

/**
 * Servicio de persistencia local basado en Ionic Storage.
 *
 * Ionic Storage abstrae el motor de almacenamiento según la plataforma:
 * - iOS / Android: SQLite (via Capacitor SQLite) — base de datos relacional nativa.
 * - Web / PWA: IndexedDB — almacenamiento asíncrono estructurado del navegador.
 * - Fallback: localStorage — solo si ninguna de las anteriores está disponible.
 *
 * Esta arquitectura garantiza:
 * - Operaciones asíncronas no bloqueantes (IndexedDB / SQLite).
 * - Seguridad: IndexedDB y SQLite no están expuestos a XSS como localStorage.
 * - Escalabilidad: permite almacenar grandes volúmenes de datos con índices.
 * - Preparación para compilación nativa sin cambiar una línea de código.
 *
 * El servicio actúa como fachada sobre Ionic Storage,
 * exponiendo una API simplificada (get/set/remove) tipada genéricamente.
 * Si en el futuro se migra a otro motor, solo cambia esta clase.
 *
 * @providedIn 'root' - Singleton global.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  /** Instancia del motor de almacenamiento inicializada por Ionic Storage */
  private store: Storage | null = null;

  /** Referencia al servicio Storage de Ionic Storage, inyectado vía inject() */
  private storage = inject(Storage);

  /**
   * Inicializa el motor de almacenamiento de Ionic Storage.
   * Debe ser llamado una sola vez antes de cualquier operación de lectura/escritura.
   * Se invoca desde APP_INITIALIZER en AppModule.
   */
  async init(): Promise<void> {
    this.store = await this.storage.create();
  }

  /**
   * Recupera un valor del almacenamiento local.
   * Operación asíncrona — no bloquea el hilo principal.
   *
   * @param key - Clave del dato a recuperar.
   * @returns El valor parseado como tipo T, o null si no existe.
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.store) {
      throw new Error('StorageService no ha sido inicializado. Llama a init() primero.');
    }
    const raw = await this.store.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /**
   * Guarda un valor serializado en formato JSON.
   * Operación asíncrona — no bloquea el hilo principal.
   *
   * @param key - Clave bajo la cual se almacena el dato.
   * @param value - Valor a almacenar (se serializa con JSON.stringify).
   */
  async set<T>(key: string, value: T): Promise<void> {
    if (!this.store) {
      throw new Error('StorageService no ha sido inicializado. Llama a init() primero.');
    }
    await this.store.set(key, JSON.stringify(value));
  }

  /**
   * Elimina una entrada del almacenamiento.
   * Operación asíncrona — no bloquea el hilo principal.
   *
   * @param key - Clave del dato a eliminar.
   */
  async remove(key: string): Promise<void> {
    if (!this.store) {
      throw new Error('StorageService no ha sido inicializado. Llama a init() primero.');
    }
    await this.store.remove(key);
  }
}
