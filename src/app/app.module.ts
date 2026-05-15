import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TaskService } from './core/services/task.service';
import { StorageService } from './core/services/storage.service';

/**
 * Factory function para APP_INITIALIZER.
 *
 * Orquesta la inicialización de los servicios de persistencia:
 * 1. Inicializa el motor de Ionic Storage (SQLite/IndexedDB).
 * 2. Carga los datos de tareas desde el almacenamiento local.
 *
 * Ambas operaciones son asíncronas y se ejecutan antes de que Angular
 * renderice la aplicación, garantizando que los datos estén disponibles
 * desde el primer paint.
 */
function initializeApp(storageService: StorageService, taskService: TaskService): () => Promise<void> {
  return async () => {
    await storageService.init();
    await taskService.init();
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
      deps: [StorageService, TaskService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
