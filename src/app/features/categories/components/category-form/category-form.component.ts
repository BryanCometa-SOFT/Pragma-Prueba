import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  templateUrl: 'category-form.component.html',
  standalone: false,
})
export class CategoryFormComponent implements OnInit {
  @Input() category: Category | null = null;

  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    icon: ['folder-outline', Validators.required],
  });

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

  get selectedIcon(): string {
    return this.form.controls.icon.value ?? 'folder-outline';
  }

  ngOnInit(): void {
    if (this.category) {
      this.form.patchValue({
        name: this.category.name,
        icon: this.category.icon,
      });
    }
  }

  get isEditing(): boolean { return this.category !== null; }
  get name() { return this.form.get('name'); }

  dismiss(): void { this.modalController.dismiss(); }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.modalController.dismiss(this.form.value);
  }
}
