import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneralDashboardComponent } from './general-dashboard.component';
import { ReadMoreModule } from '../../read-more';

@NgModule({
  imports: [
    CommonModule,
    ReadMoreModule
  ],
  exports: [
    GeneralDashboardComponent
  ],
  declarations: [
    GeneralDashboardComponent
  ]
})
export class GeneralDashboardModule {}
