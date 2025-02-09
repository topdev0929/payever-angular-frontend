import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

import { DialogModule, DialogService } from '@pe/checkout/dialog';
import { FinishModule } from '@pe/checkout/finish';
import { PluginsModule } from '@pe/checkout/plugins';
import { CheckoutUiButtonModule } from '@pe/checkout/ui/button';
import { CheckoutUiIconModule } from '@pe/checkout/ui/icon';
import { ProgressButtonContentModule } from '@pe/checkout/ui/progress-button-content';

import { SantanderDeApiService, SantanderDeFlowService } from '../shared/services';

import {
  ConfirmDialogComponent,
  CreditCheckComponent,
  IdentificationComponent,
  ImageCaptureComponent,
  ImageCaptureStyleComponent,
  ProofComponent,
  SignatureComponent,
  StepsContainerComponent,
  StepsHeaderComponent,
  UploadDocumentsComponent,
} from './components';

@NgModule({
  declarations: [
    CreditCheckComponent,
    IdentificationComponent,
    ImageCaptureComponent,
    ImageCaptureStyleComponent,
    ProofComponent,
    SignatureComponent,
    StepsContainerComponent,
    StepsHeaderComponent,
    UploadDocumentsComponent,
    ConfirmDialogComponent,
  ],
  imports: [
    CheckoutUiIconModule,
    DialogModule,
    CheckoutUiButtonModule,
    CommonModule,
    FinishModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatOptionModule,
    MatSelectModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    PluginsModule,
    ProgressButtonContentModule,
    ReactiveFormsModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  exports: [
    StepsContainerComponent,
  ],
  providers: [
    DialogService,
    SantanderDeFlowService,
    SantanderDeApiService,
  ],
})
export class AdditionalStepsModule { }
