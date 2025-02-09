import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { FinishModule } from '@pe/checkout/finish';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { SendToDeviceComponent } from './components';
import { SendToDeviceService } from './services';


@NgModule({
  declarations: [
    SendToDeviceComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    CheckoutFormsCoreModule,
    FinishModule,
    UtilsModule,
    UiModule,
  ],
  exports: [
    SendToDeviceComponent,
  ],
  providers: [
    SendToDeviceService,
  ],
})
export class SendFlowModule {
  resolveSendToDeviceComponent(): Type<SendToDeviceComponent> {
    return SendToDeviceComponent;
  }
}
