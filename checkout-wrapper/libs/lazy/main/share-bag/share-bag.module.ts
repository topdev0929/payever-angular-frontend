import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { DialogModule } from '@pe/checkout/dialog';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { SendToDeviceService } from '@pe/checkout/sections/send-flow';
import { CheckoutUiButtonModule } from '@pe/checkout/ui/button';
import { SnackBarModule } from '@pe/checkout/ui/snackbar';
import { CheckoutUiTabsModule } from '@pe/checkout/ui/tabs';

import {
  EmailFormComponent,
  ShareBagComponent,
  SmsFormComponent,
  ShareBagStylesComponent,
} from './components';
import { ShareBagDialogService } from './services';


@NgModule({
  declarations: [
    ShareBagComponent,
    EmailFormComponent,
    SmsFormComponent,
    ShareBagStylesComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    SnackBarModule,
    DialogModule,
    CheckoutUiButtonModule,
    CheckoutUiTabsModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
  ],
  exports: [
    ShareBagComponent,
  ],
  providers: [
    ShareBagDialogService,
    SendToDeviceService,
  ],
})
export class ShareBagModule {}
