import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { FinishModule, FinishStatusIconConfig, FinishStatusIconConfigInterface } from '@pe/checkout/finish';
import { UiModule } from '@pe/checkout/ui';
import { CheckoutUiQrBoxModule } from '@pe/checkout/ui/qr-box';
import { UtilsModule } from '@pe/checkout/utils';

import { AdditionalStepsModule } from '../additional-steps';

import {
  RatesInfoTableComponent,
  FinishStyleComponent,
  FinishComponent,
  SiningStatusComponent,
} from './components';
import {
  FormConfigService,
  RatesCalculationService,
} from './services';


const finishStatusIconConfig: FinishStatusIconConfigInterface = {
  icons: {
    success: 'register-done-32',
    pending: 'progress-94',
    fail: 'error-128',
  },
  iconsClass: 'icon-64',
};

@NgModule({
  declarations: [
    FinishComponent,
    FinishStyleComponent,
    RatesInfoTableComponent,
    SiningStatusComponent,
  ],
  imports: [
    CommonModule,
    UtilsModule,
    FinishModule,
    UiModule,
    CheckoutUiQrBoxModule,
    AdditionalStepsModule,
    MatButtonModule,
  ],
  exports: [
    RatesInfoTableComponent,
    FinishComponent,
    FinishStyleComponent,
    SiningStatusComponent,
  ],
  providers: [
    RatesCalculationService,
    FormConfigService,
    {
      provide: FinishStatusIconConfig,
      useValue: finishStatusIconConfig,
    },
  ],
})
export class SharedModule { }
