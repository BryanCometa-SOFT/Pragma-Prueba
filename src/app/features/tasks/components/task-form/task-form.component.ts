import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Task } from '../../../../core/models/task.model';

/**
 * Componente de formulario para crear o editar tareas.
 *
 * Se presenta como un modal a través de ModalController.
 * Recibe opcionalmente una tarea vía componentProps:
 * - Si recibe task → modo edición (precarga título y descripción).
 * - Si no recibe task → modo creación (formulario vacío).
 *
 * Al guardar, retorna los datos mediante modalController.dismiss({ title, description }).
 * Al cancelar, retorna sin datos (undefined).
 */
@Component({
  selector: 'app-task-form',
  templateUrl: 'task-form.component.html',
  styleUrls: ['task-form.component.scss'],
  standalone: false,
})
export class TaskFormComponent implements OnInit {
  /** Tarea a editar. Si es null, el componente opera en modo creación. */
  @Input() task: Task | null = null;

  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  /** Al inicializar, si hay tarea precargamos los valores. */
  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue(
        { title: this.task.title, description: this.task.description },
        { emitEvent: false },
      );
    }
  }

  get isEditing(): boolean {
    return this.task !== null;
  }

  get title() {
    return this.taskForm.get('title');
  }

  get description() {
    return this.taskForm.get('description');
  }

  /** Cierra el modal sin guardar. */
  dismiss(): void {
    this.modalController.dismiss();
  }

  /** Valida el formulario y cierra el modal retornando los datos. */
  save(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }
    const { title, description } = this.taskForm.value;
    this.modalController.dismiss({
      title: (title as string).trim(),
      description: (description as string || '').trim(),
    });
  }
}
