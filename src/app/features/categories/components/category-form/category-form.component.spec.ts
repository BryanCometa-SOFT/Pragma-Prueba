import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { CategoryFormComponent } from './category-form.component';

describe('CategoryFormComponent', () => {
  let component: CategoryFormComponent;
  let fixture: ComponentFixture<CategoryFormComponent>;
  let modalControllerMock: jasmine.SpyObj<ModalController>;

  beforeEach(async () => {
    modalControllerMock = jasmine.createSpyObj<ModalController>('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [CategoryFormComponent],
      imports: [IonicModule.forRoot(), ReactiveFormsModule],
      providers: [{ provide: ModalController, useValue: modalControllerMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryFormComponent);
    component = fixture.componentInstance;
  });

  it('debería estar en modo creación sin categoría', () => {
    fixture.detectChanges();
    expect(component.isEditing).toBeFalse();
  });

  it('debería precargar datos en modo edición', () => {
    component.category = { id: '1', name: 'Trabajo', icon: 'briefcase-outline' };
    fixture.detectChanges();
    expect(component.isEditing).toBeTrue();
    expect(component.form.get('name')?.value).toBe('Trabajo');
    expect(component.form.get('icon')?.value).toBe('briefcase-outline');
  });

  it('debería validar nombre requerido y mínimo 2 caracteres', () => {
    const ctrl = component.form.get('name');
    ctrl?.setValue('');
    expect(ctrl?.hasError('required')).toBeTrue();
    ctrl?.setValue('A');
    expect(ctrl?.hasError('minlength')).toBeTrue();
  });
});
