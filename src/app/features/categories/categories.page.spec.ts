import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { signal } from '@angular/core';
import { CategoriesPage } from './categories.page';
import { CategoryService } from '../../core/services/category.service';

describe('CategoriesPage', () => {
  let component: CategoriesPage;
  let fixture: ComponentFixture<CategoriesPage>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let modalControllerMock: jasmine.SpyObj<ModalController>;
  let alertControllerMock: jasmine.SpyObj<AlertController>;

  beforeEach(async () => {
    categoryServiceMock = jasmine.createSpyObj<CategoryService>(
      'CategoryService', ['add', 'update', 'delete'],
      { categories: signal([]), count: signal(0) },
    );
    modalControllerMock = jasmine.createSpyObj<ModalController>('ModalController', ['create']);
    alertControllerMock = jasmine.createSpyObj<AlertController>('AlertController', ['create']);

    await TestBed.configureTestingModule({
      declarations: [CategoriesPage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: AlertController, useValue: alertControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería mostrar estado vacío sin categorías', () => {
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('debería crear categoría al recibir datos del modal', async () => {
    modalControllerMock.create.and.resolveTo({
      present: jasmine.createSpy(),
      onDidDismiss: () => Promise.resolve({ data: { name: 'Trabajo', icon: 'briefcase-outline' } }),
    } as any);
    await component.openAddModal();
    expect(categoryServiceMock.add).toHaveBeenCalledWith('Trabajo', 'briefcase-outline');
  });

  it('debería eliminar categoría al confirmar', async () => {
    const alertMock = { present: jasmine.createSpy() };
    alertControllerMock.create.and.resolveTo(alertMock as any);
    const cat = { id: 'x', name: 'Test', icon: 'folder-outline' };
    await component.confirmDelete(cat);
    const args = alertControllerMock.create.calls.mostRecent().args[0] as any;
    args.buttons[1].handler();
    expect(categoryServiceMock.delete).toHaveBeenCalledWith('x');
  });
});
