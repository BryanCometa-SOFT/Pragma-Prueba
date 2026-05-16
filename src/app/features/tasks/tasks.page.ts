import { Component, inject, signal } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { Task } from '../../core/models/task.model';
import { TaskFormComponent } from './components/task-form/task-form.component';

@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  standalone: false,
})
export class TasksPage {
  showCompleted = signal(false);
  /** ID de la categoría seleccionada para filtrar. null = mostrar todas */
  selectedCategoryId = signal<string | null>(null);

  taskService = inject(TaskService);
  categoryService = inject(CategoryService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);

  /* ==================== MODAL CREAR / EDITAR ==================== */

  async openAddModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: TaskFormComponent,
      componentProps: { task: null },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.taskService.add(data.title, data.description, data.categoryId);
    }
  }

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
        categoryId: data.categoryId,
      });
    }
  }

  /* ==================== CONFIRMACIONES ==================== */

  async confirmComplete(task: Task): Promise<void> {
    if (task.completed) return;
    const alert = await this.alertController.create({
      header: '¿Completar tarea?',
      message: `"${task.title}" se marcará como finalizada.`,
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
        { text: 'Eliminar', role: 'destructive',
          handler: () => { this.taskService.delete(task.id); } },
      ],
    });
    await alert.present();
  }

  /* ==================== FILTROS ==================== */

  /** Tareas filtradas por categoría y estado pendiente */
  filteredPendingTasks(): Task[] {
    let tasks = this.taskService.tasks().filter((t) => !t.completed);
    const catId = this.selectedCategoryId();
    if (catId) tasks = tasks.filter((t) => t.categoryId === catId);
    return tasks;
  }

  completedTasks(): Task[] {
    return this.taskService.tasks().filter((t) => t.completed);
  }

  /** Retorna la categoría dado su ID (para mostrar nombre en chips) */
  getCategory(id: string) {
    return this.categoryService.getById(id);
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

  formatId(id: string): string { return '#' + id.substring(0, 8); }
}
