import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'tasks',
    loadChildren: () => import('./features/tasks/tasks.module').then( m => m.TasksPageModule)
  },
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.module').then( m => m.CategoriesPageModule)
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
