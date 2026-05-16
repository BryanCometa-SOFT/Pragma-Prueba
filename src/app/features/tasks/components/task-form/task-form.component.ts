import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Task } from '../../../../core/models/task.model';
import { CategoryService } from '../../../../core/services/category.service';

@Component({
  selector: 'app-task-form',
  templateUrl: 'task-form.component.html',
  styleUrls: ['task-form.component.scss'],
  standalone: false,
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;

  private fb = inject(FormBuilder);
  private modalController = inject(ModalController);
  categoryService = inject(CategoryService);

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    categoryId: [''],
  });

  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        categoryId: this.task.categoryId || '',
      }, { emitEvent: false });
    }
  }

  get isEditing(): boolean { return this.task !== null; }
  get title() { return this.taskForm.get('title'); }
  get description() { return this.taskForm.get('description'); }

  dismiss(): void { this.modalController.dismiss(); }

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
