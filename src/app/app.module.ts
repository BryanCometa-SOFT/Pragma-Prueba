import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TaskService } from './core/services/task.service';
import { CategoryService } from './core/services/category.service';
import { StorageService } from './core/services/storage.service';

/**
 * Factory function para APP_INITIALIZER.
 *
 * Orquesta la inicialización asíncrona de los servicios de persistencia:
 * 1. Inicializa el motor de Ionic Storage (SQLite/IndexedDB).
 * 2. Carga los datos de tareas y categorías desde el almacenamiento local.
 *
 * Se ejecuta antes del primer render, garantizando datos disponibles.
 */
function initializeApp(
  storageService: StorageService,
  taskService: TaskService,
  categoryService: CategoryService,
): () => Promise<void> {
  return async () => {
    await storageService.init();
    await taskService.init();
    await categoryService.init();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [StorageService, TaskService, CategoryService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
