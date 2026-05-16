import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { CategoryService } from '../../core/services/category.service';
import { RemoteConfigService } from '../../core/services/remote-config.service';
import { Category } from '../../core/models/category.model';
import { CategoryFormComponent } from './components/category-form/category-form.component';

/**
 * Página de gestión de categorías.
 * CRUD completo: crear, editar y eliminar categorías con persistencia automática.
 * Botones controlados por Remote Config (enable_create, enable_edit, enable_delete).
 * Incluye buscador con debounce de 300ms para filtrar por nombre.
 */
@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesPage {
  /** Servicio de categorías inyectado (CRUD + señales reactivas) */
  categoryService = inject(CategoryService);
  /** Servicio de feature flags vía Firebase Remote Config */
  remoteConfig = inject(RemoteConfigService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);

  /** Texto ingresado en el buscador (sin debounce, para binding con ion-searchbar) */
  searchQuery = signal('');
  /** Texto de búsqueda ya debounced (300ms), usado por filteredCategories */
  private debouncedSearch = signal('');
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  /** Señal computada: categorías filtradas por texto de búsqueda (memoizada) */
  readonly filteredCategories = computed(() => {
    const query = this.debouncedSearch();
    if (!query) return this.categoryService.categories();
    const q = query.toLowerCase();
    return this.categoryService.categories().filter((c) =>
      c.name.toLowerCase().includes(q)
    );
  });

  /**
   * Maneja el input del buscador con debounce de 300ms para evitar
   * recálculos excesivos de filteredCategories mientras el usuario escribe.
   * @param event - Evento ionInput del ion-searchbar.
   */
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value ?? '';
    this.searchQuery.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.debouncedSearch.set(value);
    }, 300);
  }

  /**
   * Abre el modal de creación de categoría vía ModalController.
   * Si el modal retorna datos, persiste la categoría con CategoryService.
   */
  async openAddModal(): Promise<void> {
    const modal = await this.modalController.create({
      component: CategoryFormComponent,
      componentProps: { category: null },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.categoryService.add(data.name, data.icon);
    }
  }

  /**
   * Abre el modal de edición precargado con los datos de la categoría.
   * @param category - Categoría a editar.
   */
  async openEditModal(category: Category): Promise<void> {
    const modal = await this.modalController.create({
      component: CategoryFormComponent,
      componentProps: { category },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.categoryService.update(category.id, {
        name: data.name,
        icon: data.icon,
      });
    }
  }

  /**
   * Muestra un AlertController de confirmación antes de eliminar la categoría.
   * Las tareas asociadas no se eliminan, solo pierden su categoría.
   * @param category - Categoría a eliminar.
   */
  async confirmDelete(category: Category): Promise<void> {
    const alert = await this.alertController.create({
      header: '¿Eliminar categoría?',
      message: `"${category.name}" se eliminará. Las tareas asociadas no se borrarán.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Eliminar', role: 'destructive',
          handler: () => { this.categoryService.delete(category.id); } },
      ],
    });
    await alert.present();
  }
}