import { NgModule, provideAppInitializer, inject } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TaskService } from './core/services/task.service';
import { CategoryService } from './core/services/category.service';
import { RemoteConfigService } from './core/services/remote-config.service';
import { StorageService } from './core/services/storage.service';

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

    // Inicialización asíncrona antes del primer render (Angular 19+)
    provideAppInitializer(async () => {
      const storageService = inject(StorageService);
      const taskService = inject(TaskService);
      const categoryService = inject(CategoryService);
      const remoteConfigService = inject(RemoteConfigService);
      await storageService.init();
      await categoryService.init();
      categoryService.seedIfEmpty();
      await taskService.init();
      taskService.seedIfEmpty(categoryService.categories().map((c) => c.id));
      await remoteConfigService.init();
    }),

    // Animaciones (reemplaza BrowserAnimationsModule, deprecated en Angular 19+)
    provideAnimations(),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
