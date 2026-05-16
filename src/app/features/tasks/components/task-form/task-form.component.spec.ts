import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { signal } from '@angular/core';
import { TaskFormComponent } from './task-form.component';
import { CategoryService } from '../../../../core/services/category.service';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let modalControllerMock: jasmine.SpyObj<ModalController>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;

  beforeEach(async () => {
    modalControllerMock = jasmine.createSpyObj<ModalController>('ModalController', ['dismiss']);
    categoryServiceMock = jasmine.createSpyObj<CategoryService>(
      'CategoryService', [],
      { categories: signal([]), count: signal(0) },
    );

    await TestBed.configureTestingModule({
      declarations: [TaskFormComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [
        { provide: ModalController, useValue: modalControllerMock },
        { provide: CategoryService, useValue: categoryServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
  });

  it('debería estar en modo creación cuando no recibe tarea', () => {
    fixture.detectChanges();
    expect(component.isEditing).toBeFalse();
  });

  it('debería precargar datos en modo edición', () => {
    component.task = { id: '1', title: 'Editar', description: 'Desc', completed: false,
      categoryId: null, createdAt: new Date(), completedAt: null };
    fixture.detectChanges();
    expect(component.isEditing).toBeTrue();
    expect(component.taskForm.get('title')?.value).toBe('Editar');
  });

  it('debería cerrar modal con datos al guardar formulario válido', () => {
    component.taskForm.patchValue({ title: 'Nueva tarea', description: 'Detalle' });
    component.save();
    expect(modalControllerMock.dismiss).toHaveBeenCalledWith({ title: 'Nueva tarea', description: 'Detalle', categoryId: null });
  });

  it('no debería cerrar modal si el formulario es inválido', () => {
    component.taskForm.patchValue({ title: 'ab', description: '' });
    component.save();
    expect(modalControllerMock.dismiss).not.toHaveBeenCalled();
  });
});
