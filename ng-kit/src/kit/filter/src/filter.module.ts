import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterComponent } from './filter.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    FilterComponent
  ],
  entryComponents: [ FilterComponent ],
  exports: [ FilterComponent ]
})
export class FilterModule {}
