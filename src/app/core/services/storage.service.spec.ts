import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  let ionicStorageMock: jasmine.SpyObj<Storage>;
  let backingStore: Map<string, string>;

  beforeEach(() => {
    backingStore = new Map();
    ionicStorageMock = jasmine.createSpyObj<Storage>('Storage', ['create', 'get', 'set', 'remove']);
    ionicStorageMock.create.and.resolveTo(ionicStorageMock);
    ionicStorageMock.get.and.callFake((key: string) => Promise.resolve(backingStore.get(key) ?? null));
    ionicStorageMock.set.and.callFake((key: string, value: string) => {
      backingStore.set(key, value);
      return Promise.resolve();
    });
    ionicStorageMock.remove.and.callFake((key: string) => {
      backingStore.delete(key);
      return Promise.resolve();
    });

    TestBed.configureTestingModule({
      providers: [StorageService, { provide: Storage, useValue: ionicStorageMock }],
    });

    service = TestBed.inject(StorageService);
  });

  it('debería inicializar el motor de almacenamiento', async () => {
    await service.init();
    expect(ionicStorageMock.create).toHaveBeenCalled();
  });

  it('debería lanzar error al usar get/set sin inicializar', async () => {
    await expectAsync(service.get('key')).toBeRejected();
    await expectAsync(service.set('key', 'val')).toBeRejected();
  });

  it('debería guardar y recuperar un valor correctamente', async () => {
    await service.init();
    await service.set('clave', { nombre: 'Test' });
    const result = await service.get<{ nombre: string }>('clave');
    expect(result).toEqual({ nombre: 'Test' });
  });

  it('debería devolver null para claves inexistentes', async () => {
    await service.init();
    expect(await service.get('no-existe')).toBeNull();
  });

  it('debería manejar datos corruptos sin lanzar excepción', async () => {
    await service.init();
    ionicStorageMock.get.and.resolveTo('no-es-json{');
    expect(await service.get('corrupto')).toBeNull();
  });
});
