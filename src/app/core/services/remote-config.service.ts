import { Injectable, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getRemoteConfig,
  fetchAndActivate,
  getValue,
  onConfigUpdate,
} from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

/**
 * Servicio de Feature Flags vía Firebase Remote Config.
 *
 * Permite activar/desactivar funcionalidades desde Firebase Console
 * sin necesidad de recompilar ni publicar una nueva versión de la app.
 *
 * Flags definidos:
 * - enable_create:     Muestra/oculta el botón de crear tareas o categorias.
 * - enable_edit:       Muestra/oculta el botón de editar en cada tarea o categoria.
 * - enable_delete:     Muestra/oculta el botón de eliminar en cada tarea o categoria.
 * - enable_complete:   Muestra/oculta el botón de completar tareas o categorias.
 * - enable_categories: Muestra/oculta la sección de categorías.
 *
 * Valores por defecto: todos true (mientras no se reciban de Remote Config).
 *
 * Usa onConfigUpdate (Server-Sent Events) para recibir cambios en tiempo real
 * sin polling, lo cual:
 * - No consume batería ni datos en segundo plano.
 * - No arriesga throttling de Firebase por peticiones repetidas.
 * - Refleja cambios al instante tras publicar en Firebase Console.
 */
@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {
  private remoteConfig: ReturnType<typeof getRemoteConfig>;
  private unsubscribe: (() => void) | null = null;

  /** Controla la visibilidad del botón de crear (FAB +) en tareas y categorías */
  readonly enableCreate = signal(true);
  /** Controla la visibilidad del botón de editar ✏️ en tareas y categorías */
  readonly enableEdit = signal(true);
  /** Controla la visibilidad del botón de eliminar 🗑️ en tareas y categorías */
  readonly enableDelete = signal(true);
  /** Controla la visibilidad del botón de completar ✓ en tareas */
  readonly enableComplete = signal(true);
  /** Controla la visibilidad de la sección de categorías en el menú y filtro */
  readonly enableCategories = signal(true);

  constructor() {
    const app = initializeApp(environment.firebase);
    this.remoteConfig = getRemoteConfig(app);
    // Cache alto: no necesitamos polling frecuente porque usamos onConfigUpdate.
    // Solo se usa como fallback si el listener SSE no está disponible.
    this.remoteConfig.settings.minimumFetchIntervalMillis = 43_200_000; // 12 horas
  }

  /**
   * Obtiene los flags iniciales y activa el listener en tiempo real.
   * Invocado por APP_INITIALIZER antes del primer render.
   */
  async init(): Promise<void> {
    await this.refresh();
    this.startRealtimeListener();
  }

  /** Fuerza una recarga inmediata de flags desde Firebase (usado por pull-to-refresh) */
  async refresh(): Promise<void> {
    try {
      await fetchAndActivate(this.remoteConfig);
      console.log('[RemoteConfig] Flags remotos obtenidos correctamente');
    } catch {
      console.warn('[RemoteConfig] Sin conexión, usando valores por defecto');
    }
    this.applyFlags();
  }

  /** Lee los valores remotos y actualiza las señales */
  private applyFlags(): void {
    this.enableCreate.set(getValue(this.remoteConfig, 'enable_create').asBoolean());
    this.enableEdit.set(getValue(this.remoteConfig, 'enable_edit').asBoolean());
    this.enableDelete.set(getValue(this.remoteConfig, 'enable_delete').asBoolean());
    this.enableComplete.set(getValue(this.remoteConfig, 'enable_complete').asBoolean());
    this.enableCategories.set(getValue(this.remoteConfig, 'enable_categories').asBoolean());
    console.log('[RemoteConfig] Flags:', {
      enable_create: this.enableCreate(),
      enable_edit: this.enableEdit(),
      enable_delete: this.enableDelete(),
      enable_complete: this.enableComplete(),
      enable_categories: this.enableCategories(),
    });
  }

  /**
   * Escucha cambios en tiempo real vía Server-Sent Events (SSE).
   * Cuando publicás en Firebase Console, la app se actualiza al instante.
   * Sin consumo de batería ni datos en segundo plano.
   */
  private startRealtimeListener(): void {
    try {
      this.unsubscribe = onConfigUpdate(this.remoteConfig, {
        next: (update) => {
          const keys = [...update.getUpdatedKeys()];
          console.log('[RemoteConfig] Firebase notificó cambios en:', keys);
          void this.onConfigChanged();
        },
        error: (err) => {
          console.warn('[RemoteConfig] Error en SSE:', err.message);
        },
        complete: () => {
          // El stream de Remote Config nunca se cierra, pero TS lo requiere
        },
      });
      console.log('[RemoteConfig] Listener en tiempo real activado (SSE)');
    } catch {
      console.warn('[RemoteConfig] onConfigUpdate no soportado en este entorno');
    }
  }

  /** Detiene el listener SSE al destruir la app */
  stopListener(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Invocado por el listener SSE cuando Firebase notifica cambios */
  private async onConfigChanged(): Promise<void> {
    await fetchAndActivate(this.remoteConfig);
    this.applyFlags();
  }
}