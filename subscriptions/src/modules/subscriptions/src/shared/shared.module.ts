import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WarningSnackbarComponent } from './components/warning-snackbar/warning-snackbar.component';

@NgModule({
  declarations: [WarningSnackbarComponent],
  imports: [CommonModule],
  exports: [WarningSnackbarComponent],
})
export class SharedModule {}
