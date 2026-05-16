import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Task } from '../../../../core/models/task.model';
import { CategoryService } from '../../../../core/services/category.service';

/**
 * Componente modal para crear o editar una tarea.
 *
 * Recibe una tarea vía @Input(). Si es null, está en modo creación;
 * si tiene datos, precarga el formulario para edición.
 * Al guardar, retorna los datos al ModalController que lo invocó.
 */
@Component({
  selector: 'app-task-form',
  templateUrl: 'task-form.component.html',
  styleUrls: ['task-form.component.scss'],
  standalone: false,
})
export class TaskFormComponent implements OnInit {
  /** Tarea a editar. null = modo creación. */
  @Input() task: Task | null = null;

  /** Servicio de categorías inyectado (para poblar el selector de categoría) */
  categoryService = inject(CategoryService);
  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);

  /** Formulario reactivo con validación: título requerido (3-100), descripción (máx 500) */
  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    categoryId: [''],
  });

  /** Precarga los datos de la tarea si estamos en modo edición */
  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        categoryId: this.task.categoryId || '',
      }, { emitEvent: false });
    }
  }

  /** True si estamos editando una tarea existente */
  get isEditing(): boolean { return this.task !== null; }
  /** Acceso rápido al control de título para mostrar errores en el template */
  get title() { return this.taskForm.get('title'); }
  /** Acceso rápido al control de descripción para mostrar errores en el template */
  get description() { return this.taskForm.get('description'); }

  /** Cierra el modal sin guardar cambios */
  dismiss(): void { this.modalController.dismiss(); }

  /**
   * Valida el formulario y retorna los datos al ModalController.
   * Aplica trim a título y descripción antes de retornar.
   */
  save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const { title, description, categoryId } = this.taskForm.value;
    this.modalController.dismiss({
      title: (title as string).trim(),
      description: (description as string || '').trim(),
      categoryId: categoryId || null,
    });
  }
}