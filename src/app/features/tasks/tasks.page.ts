import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { AlertController, ModalController } from '@ionic/angular';
import { TaskService } from '../../core/services/task.service';
import { CategoryService } from '../../core/services/category.service';
import { RemoteConfigService } from '../../core/services/remote-config.service';
import { Task } from '../../core/models/task.model';
import { TaskFormComponent } from './components/task-form/task-form.component';

@Component({
  selector: 'app-tasks',
  templateUrl: 'tasks.page.html',
  styleUrls: ['tasks.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('taskItem', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-16px)' }),
        animate('250ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateX(60px)' })),
      ]),
    ]),
    trigger('sectionFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class TasksPage {
  /** Controla la visibilidad de la sección de tareas completadas */
  showCompleted = signal(false);
  /** ID de la categoría seleccionada para filtrar, null = sin filtro */
  selectedCategoryId = signal<string | null>(null);
  /** Cantidad de tareas visibles (infinite scroll), se resetea al cambiar filtro/búsqueda */
  displayCount = signal(20);
  /** Cantidad de completadas visibles en infinite scroll */
  displayCompletedCount = signal(10);
  /** Texto ingresado en el buscador (sin debounce) */
  searchQuery = signal('');
  /** Texto de búsqueda ya debounced (300ms), usado por la señal computada */
  private debouncedSearch = signal('');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Servicio de tareas inyectado (CRUD + señales reactivas) */
  taskService = inject(TaskService);
  /** Servicio de categorías inyectado (usado en chips de filtro) */
  categoryService = inject(CategoryService);
  /** Servicio de feature flags vía Firebase Remote Config */
  remoteConfig = inject(RemoteConfigService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);

  /* ==================== MODAL CREAR / EDITAR ==================== */

  /**
   * Abre el modal de creación de tarea.
   * Si el modal retorna datos, crea la tarea vía TaskService.
   */
  async openAddModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: TaskFormComponent,
      componentProps: { task: null },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.taskService.add(data.title, data.description, data.categoryId);
      this.clearFilters();
    }
  }

  /** Limpia filtros y búsqueda para mostrar la tarea recién creada */
  private clearFilters(): void {
    this.selectedCategoryId.set(null);
    this.searchQuery.set('');
    this.debouncedSearch.set('');
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.displayCount.set(20);
  }

  /**
   * Abre el modal de edición precargado con los datos de la tarea.
   * No permite editar tareas completadas.
   * @param task - Tarea a editar.
   */
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

  /**
   * Muestra un AlertController de confirmación antes de completar la tarea.
   * @param task - Tarea a completar.
   */
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

  /**
   * Muestra un AlertController de confirmación antes de eliminar la tarea.
   * @param task - Tarea a eliminar.
   */
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

  /** Señal computada: tareas pendientes filtradas por categoría y texto (memoizada) */
  readonly filteredPendingTasks = computed(() => {
    let tasks = this.taskService.pendingTasks();
    const catId = this.selectedCategoryId();
    if (catId) tasks = tasks.filter((t) => t.categoryId === catId);
    const query = this.debouncedSearch();
    if (query) {
      const q = query.toLowerCase();
      tasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    // Más nuevas primero
    return tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  });

  /** Señal computada: solo las primeras N tareas visibles (infinite scroll) */
  readonly visiblePendingTasks = computed(() =>
    this.filteredPendingTasks().slice(0, this.displayCount())
  );

  /** Retorna la categoría dado su ID (para mostrar nombre e ícono en chips) */
  getCategory(id: string) {
    return this.categoryService.getById(id);
  }

  /* ==================== INFINITE SCROLL ==================== */

  /** Cambia el filtro de categoría y resetea el infinite scroll */
  selectCategory(catId: string | null): void {
    this.selectedCategoryId.set(
      this.selectedCategoryId() === catId ? null : catId
    );
    this.resetDisplayCount();
  }

  /**
   * Carga 20 tareas más al hacer scroll hasta el final.
   * @param event - Evento ionInfinite del ion-infinite-scroll.
   */
  loadMore(event: any): void {
    this.displayCount.update((n) => n + 20);
    setTimeout(() => event.target.complete(), 50);
  }

  /** Señal computada: completadas visibles (infinite scroll) */
  readonly visibleCompletedTasks = computed(() =>
    this.taskService.completedTasks().slice(0, this.displayCompletedCount())
  );

  /** Carga 10 completadas más al hacer scroll */
  loadMoreCompleted(event: any): void {
    this.displayCompletedCount.update((n) => n + 10);
    setTimeout(() => event.target.complete(), 50);
  }

  /** Resetea el contador a 20 cuando cambia el filtro o la búsqueda */
  private resetDisplayCount(): void {
    this.displayCount.set(20);
  }

  /* ==================== BÚSQUEDA CON DEBOUNCE ==================== */

  /**
   * Maneja el input del buscador con debounce de 300ms.
   * La búsqueda real se aplica en filteredPendingTasks vía debouncedSearch.
   * @param event - Evento ionInput del ion-searchbar.
   */
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchQuery.set(value);
    this.resetDisplayCount();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debouncedSearch.set(value);
    }, 300);
  }

  /* ==================== PULL TO REFRESH ==================== */

  /**
   * Maneja el gesto pull-to-refresh. Fuerza una recarga inmediata
   * de los feature flags desde Firebase Remote Config.
   * @param event - Evento ionRefresh del ion-refresher.
   */
  async handleRefresh(event: any): Promise<void> {
    await this.remoteConfig.refresh();
    event.target.complete();
  }

  /* ==================== FORMATO ==================== */

  /**
   * Formatea una fecha al locale es-CO.
   * @returns Fecha formateada como "dd/mm/aa hh:mm" o string vacío si es null.
   */
  formatDate(date: Date | string | null): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-CO', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    });
  }

  /**
   * Abrevia un UUID a sus primeros 8 caracteres con prefijo #.
   * @returns String en formato "#xxxxxxxx".
   */
  formatId(id: string): string { return '#' + id.substring(0, 8); }
}
