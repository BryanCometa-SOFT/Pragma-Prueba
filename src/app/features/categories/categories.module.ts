import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CategoriesPage } from './categories.page';
import { CategoryFormComponent } from './components/category-form/category-form.component';
import { CategoriesPageRoutingModule } from './categories-routing.module';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, IonicModule, CategoriesPageRoutingModule],
  declarations: [CategoriesPage, CategoryFormComponent],
})
export class CategoriesPageModule {}
