import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule as NgxModalModule } from 'ngx-bootstrap/modal';

import { ModalComponent } from './components';

// Deprecated
import { ConfirmationDialogComponent, ConfirmationDialogDirective, ConfirmationDialogService } from './confirmation-dialog';

import { RouterModalModule, RouterModalService } from './router-modal';

@NgModule({
  imports: [
    CommonModule,
    NgxModalModule,
    RouterModalModule
  ],
  declarations: [
    ConfirmationDialogComponent,
    ConfirmationDialogDirective,
    ModalComponent
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    ModalComponent
  ],
  exports: [
    ConfirmationDialogComponent,
    ConfirmationDialogDirective,
    ModalComponent,
    NgxModalModule,
    RouterModalModule
  ],
  providers: [
    ConfirmationDialogService,
    RouterModalService
  ]
})
// !!! Please don't forget following lines to your AppModule:
// import { ModalModule as NgxModalModule } from 'ngx-bootstrap/modal';
// imports: [ NgxModalModule.forRoot() ]
export class PeModalModule {}
