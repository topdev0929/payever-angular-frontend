import { OverlayContainer } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { PluginsModule } from '@pe/checkout/plugins';
import { CheckoutOverlayContainer } from '@pe/checkout/ui/overlay';
import { UtilsModule, PaymentHelperService } from '@pe/checkout/utils';

import {
  DefaultReceiptComponent,
  FinishWrapperComponent,
  FinishStatusFailComponent,
  FinishStatusPendingComponent,
  FinishStatusSuccessComponent,
  FinishStatusUnknownComponent,
  PaymentExternalCodeComponent,
  StatusIconComponent,
  IframeCallbackComponent,
  HelperDialogComponent,
} from './components';
import { FinishStatusIconConfig, FinishStatusIconConfigInterface } from './constants';
import { FinishDialogService } from './services';

// This way we make sure that when we have 2 checkouts: one as lib in COSF and another as custom element in POS and
//  they are both together in the memory:
// In this case they don't have same shared global services (rxjs conflicts in this case)
const win = (window as any)[`checkout_sdk_finish_${Math.random().toString().slice(2)}`] = {} as any;

export function finishDialogServiceFactory(
  matDialog: MatDialog,
  paymentHelperService: PaymentHelperService
): FinishDialogService {
  if (!win.pe_CheckoutWrapper_FinishDialogService) {
    win.pe_CheckoutWrapper_FinishDialogService = new FinishDialogService(matDialog, paymentHelperService);
  }

  return win.pe_CheckoutWrapper_FinishDialogService;
}

const finishStatusIconConfig: FinishStatusIconConfigInterface = {
  icons: {
    success: 'success-36',
    pending: 'pending-36',
    fail: 'error-36',
  },
  iconsClass: 'icon-36',
};

@NgModule({
  declarations: [
    StatusIconComponent,
    PaymentExternalCodeComponent,
    DefaultReceiptComponent,
    FinishWrapperComponent,
    FinishStatusFailComponent,
    FinishStatusPendingComponent,
    FinishStatusSuccessComponent,
    FinishStatusUnknownComponent,
    IframeCallbackComponent,
    HelperDialogComponent,
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,

    UtilsModule,
    PluginsModule,
  ],
  exports: [
    DefaultReceiptComponent,
    FinishWrapperComponent,
    FinishStatusFailComponent,
    FinishStatusPendingComponent,
    FinishStatusSuccessComponent,
    FinishStatusUnknownComponent,
    PaymentExternalCodeComponent,
    StatusIconComponent,
    IframeCallbackComponent,
    HelperDialogComponent,
  ],
  providers: [
    {
      provide: FinishDialogService, useFactory: finishDialogServiceFactory,
      deps: [MatDialog, PaymentHelperService],
    },
    {
      provide: OverlayContainer,
      useClass: CheckoutOverlayContainer,
    },
    {
      provide: FinishStatusIconConfig,
      useValue: finishStatusIconConfig,
    },
  ],
})
export class FinishModule {
}
