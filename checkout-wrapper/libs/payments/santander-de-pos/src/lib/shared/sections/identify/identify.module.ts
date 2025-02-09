import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

import { DialogModule as NgKitDialogModule } from '@pe/checkout/dialog';
import { FormUtilsModule } from '@pe/checkout/form-utils';
import { ProgressButtonContentModule } from '@pe/checkout/ui/progress-button-content';

import {
  FilePickerComponent,
  FormIdentifyComponent,
  ImageCaptureComponent,
  PosImageCaptureStyleComponent,
  SummaryIdentifyComponent,
} from './components';
import { SafeUrlPipe } from './safe-url.pipe';

@NgModule({
  declarations: [
    FilePickerComponent,
    ImageCaptureComponent,
    PosImageCaptureStyleComponent,
    FormIdentifyComponent,
    SummaryIdentifyComponent,
    SafeUrlPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressButtonContentModule,
    MatButtonModule,
    MatDialogModule,
    MatOptionModule,
    MatSelectModule,
    MatButtonToggleModule,
    NgKitDialogModule,
    FormUtilsModule,
  ],
  exports: [
    FilePickerComponent,
    ImageCaptureComponent,
    FormIdentifyComponent,
    SummaryIdentifyComponent,
  ],
})
export class IdentifyModule {}
