import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'ngx-bootstrap/modal';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { ConfirmationDialogService } from './confirmation-dialog.service';

@NgModule({
  imports: [
    ModalModule,
    CommonModule
  ],
  entryComponents: [ConfirmationDialogComponent],
  exports: [
    ModalModule
  ],
  providers: [
    ConfirmationDialogService
  ]
})
export class ConfirmationDialogModule {}
