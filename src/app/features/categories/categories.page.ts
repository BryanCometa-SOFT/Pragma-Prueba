import { Component, inject } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { CategoryService } from '../../core/services/category.service';
import { Category } from '../../core/models/category.model';
import { CategoryFormComponent } from './components/category-form/category-form.component';

/**
 * Página de gestión de categorías.
 * CRUD completo: crear, editar y eliminar categorías con persistencia automática.
 */
@Component({
  selector: 'app-categories',
  templateUrl: 'categories.page.html',
  styleUrls: ['categories.page.scss'],
  standalone: false,
})
export class CategoriesPage {
  categoryService = inject(CategoryService);
  private modalController = inject(ModalController);
  private alertController = inject(AlertController);

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
