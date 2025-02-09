import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule } from '@angular/core';

import { MicroModule } from '@pe/common';

import { PeSharedCheckoutComponent } from './checkout.component';
import { PebCheckoutEventHandler } from './handlers';
import { PE_CHECKOUT_CONFIG, CheckoutConfig } from './interfaces';
import { PeSharedCheckoutService, PeSharedCheckoutCartService, CheckoutSharedService, CHANNEL_SET_ID, CheckoutMicroService } from './services';
import { PeSharedCheckoutStateService, PeSharedCheckoutStoreService } from './states';

const DEFAULT_CONFIG = {
  forceShowOrderStep: true,
  forceNoPaddings: true,
  embeddedMode: true,
  clientMode: true,
  merchantMode: true,
  generatePaymentCode: true,
  showQRSwitcher: false,
  showCreateCart: false,
  forceUseCard: true,
};

const providers = [
  PeSharedCheckoutCartService,
  PeSharedCheckoutService,
  PeSharedCheckoutStateService,
  CheckoutMicroService,
  CheckoutSharedService,
  PeSharedCheckoutStoreService,
  PebCheckoutEventHandler,
  {
    provide: CHANNEL_SET_ID,
    deps: [PeSharedCheckoutStoreService],
    useFactory: (store: any) => store.channelSetId,
  },
  {
    provide: PE_CHECKOUT_CONFIG,
    useValue: {
      ...DEFAULT_CONFIG,
    },
  },
];

@NgModule({
  declarations: [PeSharedCheckoutComponent],
    imports: [
      CommonModule,
      MicroModule,
    ],
  exports: [
    PeSharedCheckoutComponent,
  ],
  providers,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PeSharedCheckoutModule {
  static withConfig(configs: Partial<CheckoutConfig>): ModuleWithProviders<PeSharedCheckoutModule> {
    return {
      ngModule: PeSharedCheckoutModule,
      providers: [
        ...providers,
        {
          provide: PE_CHECKOUT_CONFIG,
          useValue: {
            ...DEFAULT_CONFIG,
            ...configs,
          },
        },
      ],
    };
  }
}
