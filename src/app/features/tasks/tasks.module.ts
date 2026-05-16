import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TasksPage } from './tasks.page';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TasksPageRoutingModule } from './tasks-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule,
    TasksPageRoutingModule,
  ],
  declarations: [TasksPage, TaskFormComponent],
})
export class TasksPageModule {}
