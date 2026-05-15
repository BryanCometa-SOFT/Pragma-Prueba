import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { signal } from '@angular/core';
import { TasksPage } from './tasks.page';
import { TaskService } from '../../core/services/task.service';

describe('TasksPage', () => {
  let component: TasksPage;
  let fixture: ComponentFixture<TasksPage>;
  let taskServiceMock: jasmine.SpyObj<TaskService>;
  let modalControllerMock: jasmine.SpyObj<ModalController>;
  let alertControllerMock: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    taskServiceMock = jasmine.createSpyObj<TaskService>(
      'TaskService', ['add', 'update', 'toggleComplete', 'delete'],
      { tasks: signal([]), taskCount: signal(0), pendingCount: signal(0), completedCount: signal(0) },
    );
    modalControllerMock = jasmine.createSpyObj<ModalController>('ModalController', ['create']);
    alertControllerMock = jasmine.createSpyObj<AlertController>('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [TasksPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: AlertController, useValue: alertControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería mostrar estado vacío cuando no hay tareas', () => {
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('debería crear tarea cuando el modal retorna datos', async () => {
    const modalMock = {
      present: jasmine.createSpy(),
      onDidDismiss: () => Promise.resolve({ data: { title: 'Nueva', description: 'Desc' } }),
    };
    modalControllerMock.create.and.resolveTo(modalMock as any);
    await component.openAddModal();
    expect(taskServiceMock.add).toHaveBeenCalledWith('Nueva', 'Desc');
  });

  it('no debería crear tarea si el modal se cierra sin datos', async () => {
    modalControllerMock.create.and.resolveTo(
      { present: jasmine.createSpy(), onDidDismiss: () => Promise.resolve({ data: null }) } as any,
    );
    await component.openAddModal();
    expect(taskServiceMock.add).not.toHaveBeenCalled();
  });

  it('debería editar tarea cuando el modal de edición retorna datos', async () => {
    modalControllerMock.create.and.resolveTo({
      present: jasmine.createSpy(),
      onDidDismiss: () => Promise.resolve({ data: { title: 'Editada', description: 'Nva' } }),
    } as any);
    const task = { id: 'abc', title: 'Vieja', description: '', completed: false,
      categoryId: null, createdAt: new Date(), completedAt: null };
    await component.openEditModal(task);
    expect(taskServiceMock.update).toHaveBeenCalledWith('abc', { title: 'Editada', description: 'Nva' });
  });

  it('no debería abrir modal de edición si la tarea está completada', async () => {
    const task = { id: 'abc', title: 'T', description: '', completed: true,
      categoryId: null, createdAt: new Date(), completedAt: new Date() };
    await component.openEditModal(task);
    expect(modalControllerMock.create).not.toHaveBeenCalled();
  });

  it('debería mostrar alerta y completar tarea al confirmar', async () => {
    const alertMock = { present: jasmine.createSpy() };
    alertControllerMock.create.and.resolveTo(alertMock as any);
    const task = { id: 'x', title: 'P', description: '', completed: false,
      categoryId: null, createdAt: new Date(), completedAt: null };
    await component.confirmComplete(task);
    const args = alertControllerMock.create.calls.mostRecent().args[0] as any;
    args.buttons[1].handler();
    expect(taskServiceMock.toggleComplete).toHaveBeenCalledWith('x');
  });

  it('debería mostrar alerta y eliminar tarea al confirmar', async () => {
    const alertMock = { present: jasmine.createSpy() };
    alertControllerMock.create.and.resolveTo(alertMock as any);
    const task = { id: 'x', title: 'E', description: '', completed: false,
      categoryId: null, createdAt: new Date(), completedAt: null };
    await component.confirmDelete(task);
    const args = alertControllerMock.create.calls.mostRecent().args[0] as any;
    args.buttons[1].handler();
    expect(taskServiceMock.delete).toHaveBeenCalledWith('x');
  });
});
