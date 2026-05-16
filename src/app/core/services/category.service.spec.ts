import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';
import { StorageService } from './storage.service';

describe('CategoryService', () => {
  let service: CategoryService;
  let storageMock: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    storageMock = jasmine.createSpyObj<StorageService>('StorageService', ['get', 'set', 'remove']);
    storageMock.get.and.resolveTo(null);

    TestBed.configureTestingModule({
      providers: [CategoryService, { provide: StorageService, useValue: storageMock }],
    });

    service = TestBed.inject(CategoryService);
  });

  it('debería iniciar con lista vacía', async () => {
    await service.init();
    expect(service.categories().length).toBe(0);
  });

  it('debería agregar categoría y persistir', () => {
    service.add('Trabajo', 'briefcase-outline');
    expect(service.categories().length).toBe(1);
    expect(service.categories()[0].name).toBe('Trabajo');
    expect(storageMock.set).toHaveBeenCalled();
  });

  it('debería eliminar categoría existente', () => {
    const cat = service.add('Test');
    expect(service.delete(cat.id)).toBeTrue();
    expect(service.categories().length).toBe(0);
  });

  it('debería devolver false al eliminar ID inexistente', () => {
    expect(service.delete('no-existe')).toBeFalse();
  });

  it('debería actualizar una categoría', () => {
    const cat = service.add('Original', 'folder-outline');
    service.update(cat.id, { name: 'Editada', icon: 'book-outline' });
    expect(service.categories()[0].name).toBe('Editada');
    expect(service.categories()[0].icon).toBe('book-outline');
  });
});
