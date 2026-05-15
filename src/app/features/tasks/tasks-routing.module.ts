import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasksPage } from './tasks.page';

/**
 * Rutas hijas del módulo de tareas.
 * La ruta vacía ('') carga el TasksPage como componente principal.
 * Al ser un módulo lazy, estas rutas son relativas al path definido en AppRoutingModule.
 */
const routes: Routes = [
  {
    path: '',
    component: TasksPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TasksPageRoutingModule {}
