import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SnackBarContentComponent } from './components';
import { SnackBarService } from './services';


@NgModule({
  imports: [
    CommonModule,
    MatSnackBarModule,
  ],
  declarations: [
    SnackBarContentComponent,
  ],
  exports: [
    SnackBarContentComponent,
  ],
  providers: [
    SnackBarService,
  ],
})
export class SnackBarModule {}
