import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';


import { TooltipDialogComponent } from './tooltip-dialog.component';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
  declarations: [
    TooltipDialogComponent,
    TooltipDirective,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
  ],
  exports: [
    TooltipDirective,
  ],
})
export class CheckoutUiTooltipModule {}
