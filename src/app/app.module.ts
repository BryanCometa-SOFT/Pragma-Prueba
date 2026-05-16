import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TaskService } from './core/services/task.service';
import { CategoryService } from './core/services/category.service';
import { RemoteConfigService } from './core/services/remote-config.service';
import { StorageService } from './core/services/storage.service';

/**
 * Orquesta la inicialización asíncrona de todos los servicios:
 * 1. Ionic Storage (SQLite/IndexedDB)
 * 2. Datos locales (tareas y categorías)
 * 3. Firebase Remote Config (feature flags)
 */
function initializeApp(
  storageService: StorageService,
  taskService: TaskService,
  categoryService: CategoryService,
  remoteConfigService: RemoteConfigService,
): () => Promise<void> {
  return async () => {
    await storageService.init();
    await taskService.init();
    await categoryService.init();
    await remoteConfigService.init();
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [StorageService, TaskService, CategoryService, RemoteConfigService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
