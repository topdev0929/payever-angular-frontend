import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';

import { GridComponent } from './grid.component';

@NgModule({
  imports: [
    CommonModule,
    MatGridListModule
  ],
  declarations: [ GridComponent ],
  exports: [ GridComponent ]
})
export class GridModule {}
