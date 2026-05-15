import { Component, inject, signal } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/task.model';
import { TaskFormComponent } from './components/task-form/task-form.component';

/**
 * Página de gestión de tareas.
 *
 * Responsabilidades:
 * - Renderizar la lista de tareas con secciones Pendientes / Completadas.
 * - Orquestar la creación y edición de tareas a través de TaskFormComponent (modal).
 * - Manejar confirmaciones de eliminación y completado vía AlertController.
 *
 * La lógica del formulario está delegada a TaskFormComponent
 * para mantener esta página ligera y enfocada en la lista.
 */
@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  standalone: false,
})
export class TasksPage {
  showCompleted = signal(false);

  taskService = inject(TaskService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);

  /* ==================== MODAL: CREAR / EDITAR ==================== */

  /** Abre el modal en modo creación. */
  async openAddModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: TaskFormComponent,
      componentProps: { task: null },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.taskService.add(data.title, data.description);
    }
  }

  /** Abre el modal en modo edición con los datos de la tarea. */
  async openEditModal(task: Task): Promise<void> {
    if (task.completed) return;
    const modal = await this.modalController.create({
      component: TaskFormComponent,
      componentProps: { task },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.taskService.update(task.id, {
        title: data.title,
        description: data.description,
      });
    }
  }

  /* ==================== CONFIRMACIONES ==================== */

  async confirmComplete(task: Task): Promise<void> {
    if (task.completed) return;
    const alert = await this.alertController.create({
      header: '¿Completar tarea?',
      message: `"${task.title}" se marcará como finalizada. No podrás editarla después.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Completar', handler: () => { this.taskService.toggleComplete(task.id); } },
      ],
    });
    await alert.present();
  }

  async confirmDelete(task: Task): Promise<void> {
    if (task.completed) return;
    const alert = await this.alertController.create({
      header: '¿Eliminar tarea?',
      message: `"${task.title}" se eliminará permanentemente.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => { this.taskService.delete(task.id); },
        },
      ],
    });
    await alert.present();
  }

  /* ==================== FILTROS ==================== */

  pendingTasks(): Task[] {
    return this.taskService.tasks().filter((t) => !t.completed);
  }

  completedTasks(): Task[] {
    return this.taskService.tasks().filter((t) => t.completed);
  }

  /* ==================== FORMATO ==================== */

  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  formatId(id: string): string {
    return '#' + id.substring(0, 8);
  }
}
