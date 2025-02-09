import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ClipboardModule } from 'ngx-clipboard';
import {RouterModule, Routes} from '@angular/router';

import { I18nModule } from '@pe/i18n';
import { FormModule } from '@pe/forms';
import { SnackBarModule as NgSnackBarModule } from '@pe/forms';

import { ButtonModule } from '../../../ngkit-modules/button';
import { NavbarModule } from '../../../ngkit-modules/navbar';
import { OverlayBoxModule } from '../../../ngkit-modules/overlay-box';

import { CommunicationsSharedModule } from '../shared';
import { DevicePaymentsMainComponent } from './components';

export const DevicePaymentsI18nModuleForChild = I18nModule.forChild();

@NgModule({
  declarations: [
    DevicePaymentsMainComponent,
  ],
  imports: [
    CommonModule,

    ClipboardModule,
    ButtonModule,
    DevicePaymentsI18nModuleForChild,
    FormModule,
    FormsModule,
    OverlayBoxModule,
    ReactiveFormsModule,
    HttpClientModule,

    NavbarModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatListModule,
    MatToolbarModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    NgSnackBarModule,

    CommunicationsSharedModule
  ],
  providers: [
    FormBuilder,
  ],
  exports: [DevicePaymentsMainComponent]
})
export class DevicePaymentsModule {}
