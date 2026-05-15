import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { StorageService } from './storage.service';

describe('TaskService', () => {
  let service: TaskService;
  let storageMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageMock = jasmine.createSpyObj<StorageService>('StorageService', ['get', 'set', 'remove']);
    storageMock.get.and.resolveTo(null);

    TestBed.configureTestingModule({
      providers: [TaskService, { provide: StorageService, useValue: storageMock }],
    });

    service = TestBed.inject(TaskService);
  });

  it('debería iniciar con lista vacía si no hay datos en storage', async () => {
    await service.init();
    expect(service.tasks().length).toBe(0);
  });

  it('debería cargar tareas existentes desde storage al iniciar', async () => {
    storageMock.get.and.resolveTo([
      { id: '1', title: 'Existente', description: '', completed: false, categoryId: null,
        createdAt: new Date().toISOString(), completedAt: null },
    ]);
    await service.init();
    expect(service.tasks().length).toBe(1);
  });

  it('debería agregar una tarea y persistir automáticamente', () => {
    const task = service.add('Comprar pan', 'En la esquina');
    expect(task.title).toBe('Comprar pan');
    expect(task.completed).toBeFalse();
    expect(storageMock.set).toHaveBeenCalled();
  });

  it('debería aplicar trim al título y descripción', () => {
    const task = service.add('   Hola   ', '   Mundo   ');
    expect(task.title).toBe('Hola');
    expect(task.description).toBe('Mundo');
  });

  it('debería actualizar una tarea existente', () => {
    const task = service.add('Original');
    const updated = service.update(task.id, { title: 'Modificada' });
    expect(updated?.title).toBe('Modificada');
  });

  it('debería retornar null al actualizar un ID inexistente', () => {
    expect(service.update('no-existe', { title: 'X' })).toBeNull();
  });

  it('debería marcar como completada y registrar la fecha', () => {
    const task = service.add('Test');
    const result = service.toggleComplete(task.id);
    expect(result?.completed).toBeTrue();
    expect(result?.completedAt).toBeInstanceOf(Date);
  });

  it('debería retornar null al completar un ID inexistente', () => {
    expect(service.toggleComplete('no-existe')).toBeNull();
  });

  it('debería eliminar una tarea y devolver true', () => {
    const task = service.add('Eliminable');
    expect(service.delete(task.id)).toBeTrue();
    expect(service.tasks().length).toBe(0);
  });

  it('debería devolver false al eliminar un ID inexistente', () => {
    service.add('T1');
    expect(service.delete('no-existe')).toBeFalse();
    expect(service.tasks().length).toBe(1);
  });

  it('debería calcular correctamente los contadores', () => {
    service.add('P1');
    service.add('P2');
    const c1 = service.add('C1');
    service.toggleComplete(c1.id);
    expect(service.pendingCount()).toBe(2);
    expect(service.completedCount()).toBe(1);
  });

  it('debería filtrar tareas por categoría', () => {
    service.add('Sin cat');
    service.add('Con cat', '', 'cat-1');
    expect(service.getByCategory('cat-1').length).toBe(1);
    expect(service.getByCategory('cat-99').length).toBe(0);
  });
});
