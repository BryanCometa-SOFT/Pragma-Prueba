import { Injectable, inject, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue, RemoteConfig } from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

/**
 * Servicio de Feature Flags vía Firebase Remote Config.
 *
 * Permite activar/desactivar funcionalidades desde Firebase Console
 * sin necesidad de recompilar ni publicar una nueva versión de la app.
 *
 * Flags definidos:
 * - enable_create:     Muestra/oculta el botón de crear tareas.
 * - enable_edit:       Muestra/oculta el botón de editar en cada tarea.
 * - enable_delete:     Muestra/oculta el botón de eliminar en cada tarea.
 * - enable_categories: Muestra/oculta la sección de categorías.
 *
 * Valores por defecto: todos true (mientras no se reciban de Remote Config).
 */
@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {
  private remoteConfig: RemoteConfig;

  readonly enableCreate = signal(true);
  readonly enableEdit = signal(true);
  readonly enableDelete = signal(true);
  readonly enableCategories = signal(true);

  constructor() {
    const app = initializeApp(environment.firebase);
    this.remoteConfig = getRemoteConfig(app);
    // Cache de 1 hora en desarrollo
    this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
  }

  /**
   * Obtiene los flags desde Firebase Remote Config.
   * Invocado por APP_INITIALIZER antes del primer render.
   */
  async init(): Promise<void> {
    try {
      await fetchAndActivate(this.remoteConfig);
    } catch {
      // Si falla (sin conexión, proyecto no configurado), usamos defaults
    }
    this.applyFlags();
  }

  /** Lee los valores remotos y actualiza las señales */
  private applyFlags(): void {
    this.enableCreate.set(getValue(this.remoteConfig, 'enable_create').asBoolean());
    this.enableEdit.set(getValue(this.remoteConfig, 'enable_edit').asBoolean());
    this.enableDelete.set(getValue(this.remoteConfig, 'enable_delete').asBoolean());
    this.enableCategories.set(getValue(this.remoteConfig, 'enable_categories').asBoolean());
  }
}
