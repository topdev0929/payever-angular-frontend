import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { DialogModule } from '../../../../kit';
import { FormComponentsInputModule } from '../../../../kit/form-components/input';
import { DocComponentSharedModule } from '../doc-component-shared.module';
import { DialogDocComponent } from './dialog-doc.component';
import {
  DialogButtonsExampleDocComponent,
  DialogContentButtonsExampleDocComponent,
  DialogContentDataExampleDocComponent,
  DialogContentDefaultExampleDocComponent,
  DialogContentSizesExampleDocComponent,
  DialogDataExampleDocComponent,
  DialogDefaultExampleDocComponent,
  DialogSizesExampleDocComponent,
  DialogMicroOverlayExampleDocComponent
} from './examples';

@NgModule({
  imports: [
    DocComponentSharedModule,
    DialogModule,
    FormComponentsInputModule,
    MatButtonModule
  ],
  declarations: [
    DialogDocComponent,
    DialogButtonsExampleDocComponent,
    DialogContentButtonsExampleDocComponent,
    DialogContentDataExampleDocComponent,
    DialogContentDefaultExampleDocComponent,
    DialogContentSizesExampleDocComponent,
    DialogDataExampleDocComponent,
    DialogDefaultExampleDocComponent,
    DialogSizesExampleDocComponent,
    DialogMicroOverlayExampleDocComponent
  ],
  exports: [DialogDocComponent]
})
export class DialogDocModule {

}
