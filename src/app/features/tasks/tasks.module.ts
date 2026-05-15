import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { TasksPage } from './tasks.page';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TasksPageRoutingModule } from './tasks-routing.module';

/**
 * Módulo de la feature de tareas (lazy-loaded).
 * Declara la página principal y el componente de formulario usado como modal.
 */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    TasksPageRoutingModule,
  ],
  declarations: [TasksPage, TaskFormComponent],
})
export class TasksPageModule {}
