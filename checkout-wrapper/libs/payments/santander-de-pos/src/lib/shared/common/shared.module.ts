import { CommonModule } from '@angular/common';
import { Injector, NgModule } from '@angular/core';

import { ABSTRACT_PAYMENT_SERVICE, PAYMENT_SETTINGS } from '@pe/checkout/payment';
import { POLLING_CONFIG } from '@pe/checkout/utils/poll';

import { BILLING_ADDRESS_SETTINGS, HAS_NODE_FORM_OPTIONS, POS_DE_POLLING_CONFIG } from '../../settings';

import {
  CommonService,
  ContractApiService,
  DocsManagerService,
  FormConfigService,
  RatesCalculationService,
  PaymentService,
  SantanderDePosApiService,
  SantanderDePosFlowService,
} from './services';

const win = window as any;
export function docsManagerServiceFactory(): DocsManagerService {
  if (!win.pe_docsManagerService) {
    win.pe_docsManagerService = new DocsManagerService();
  }

  return win.pe_docsManagerService;
}

export function ratesCalculationServiceFactory(injector: Injector): RatesCalculationService {
  if (!win.pe_ratesCalculationService) {
    win.pe_ratesCalculationService = new RatesCalculationService(injector);
  }

  return win.pe_ratesCalculationService;
}

@NgModule(
  {
    imports: [
      CommonModule,
    ],
    providers: [
      ContractApiService,
      { provide: DocsManagerService, useFactory: docsManagerServiceFactory },
      SantanderDePosApiService,
      SantanderDePosFlowService,
      FormConfigService,
      CommonService,
      {
        provide: POLLING_CONFIG,
        useValue: POS_DE_POLLING_CONFIG,
      },
      {
        provide: PAYMENT_SETTINGS,
        useValue: {
          addressSettings: BILLING_ADDRESS_SETTINGS,
          hasNodeOptions: HAS_NODE_FORM_OPTIONS,
        },
      },
      {
        provide: ABSTRACT_PAYMENT_SERVICE,
        useClass: PaymentService,
      },
    ],
  }
)
export class SharedModule {
}
