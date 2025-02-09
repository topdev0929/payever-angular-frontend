import { NgModule } from '@angular/core';
import { ConfirmationDialogDirectiveDocComponent } from './confirmation-dialog-directive-doc.component';
import { ConfirmationDialogDocComponent } from './confirmation-dialog-doc.component';
import { ConfirmationDialogServiceDocComponent } from './confirmation-dialog-service-doc.component';
import { ModalDocComponent } from './modal-doc.component';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { PeModalModule } from '../../../../kit/modal';

@NgModule({
  imports: [
    DocComponentSharedModule,
    PeModalModule
  ],
  declarations: [
    ConfirmationDialogDirectiveDocComponent,
    ConfirmationDialogDocComponent,
    ConfirmationDialogServiceDocComponent,
    ModalDocComponent
  ]
})
export class ModalDocModule {
}
