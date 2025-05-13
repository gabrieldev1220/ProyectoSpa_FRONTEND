import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecepcionistaDashboardComponent } from './recepcionista-dashboard.component';

@NgModule({
  declarations: [
    RecepcionistaDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class RecepcionistaDashboardModule { }