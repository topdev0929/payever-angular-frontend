import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { PeIconComponent } from './pe-icon.component';

@NgModule({
  declarations: [PeIconComponent],
  imports: [
    CommonModule,
    MatIconModule,
  ],
  exports: [PeIconComponent],
})
export class PeIconModule {}
