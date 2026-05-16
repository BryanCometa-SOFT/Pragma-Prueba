import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Category } from '../../../../core/models/category.model';

/**
 * Componente modal para crear o editar una categoría.
 *
 * Incluye selector visual de íconos con 12 opciones predefinidas.
 * Recibe una categoría vía @Input(). Si es null, modo creación;
 * si tiene datos, precarga el formulario para edición.
 */
@Component({
  selector: 'app-category-form',
  templateUrl: 'category-form.component.html',
  standalone: false,
})
export class CategoryFormComponent implements OnInit {
  /** Categoría a editar. null = modo creación. */
  @Input() category: Category | null = null;

  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);

  /** Formulario reactivo: nombre requerido (2-30), ícono requerido (default folder) */
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    icon: ['folder-outline', Validators.required],
  });

  /** Opciones de íconos disponibles en el selector visual */
  readonly iconOptions = [
    { value: 'briefcase-outline', label: 'Trabajo' },
    { value: 'cart-outline', label: 'Compras' },
    { value: 'fitness-outline', label: 'Ejercicio' },
    { value: 'book-outline', label: 'Estudio' },
    { value: 'cafe-outline', label: 'Café' },
    { value: 'home-outline', label: 'Hogar' },
    { value: 'airplane-outline', label: 'Viaje' },
    { value: 'heart-outline', label: 'Salud' },
    { value: 'school-outline', label: 'Escuela' },
    { value: 'game-controller-outline', label: 'Juegos' },
    { value: 'musical-notes-outline', label: 'Música' },
    { value: 'paw-outline', label: 'Mascota' },
  ];

  /** Ícono actualmente seleccionado (para destacar en el selector visual) */
  get selectedIcon(): string {
    return this.form.controls.icon.value ?? 'folder-outline';
  }

  /** Precarga los datos de la categoría si estamos en modo edición */
  ngOnInit(): void {
    if (this.category) {
      this.form.patchValue({
        name: this.category.name,
        icon: this.category.icon,
      });
    }
  }

  /** True si estamos editando una categoría existente */
  get isEditing(): boolean { return this.category !== null; }
  /** Acceso rápido al control de nombre para mostrar errores en el template */
  get name() { return this.form.get('name'); }

  /** Cierra el modal sin guardar cambios */
  dismiss(): void { this.modalController.dismiss(); }

  /** Valida el formulario y retorna los datos al ModalController */
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.modalController.dismiss(this.form.value);
  }
}