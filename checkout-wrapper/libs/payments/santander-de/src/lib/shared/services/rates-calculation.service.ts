import { Injectable, Injector } from '@angular/core';
import { Params } from '@angular/router';

import { FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { PaymentDataInterface, CommodityGroups } from '../types';

import { BaseRatesCalculationService as BaseBaseRatesCalculationService } from './base-rates-calculation.service';

export abstract class PeBaseRatesCalculationService extends BaseBaseRatesCalculationService<PaymentDataInterface> {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_INSTALLMENT;

  protected getUrlParams(
    flow: FlowInterface,
    params: PaymentDataInterface,
  ): Params {
    return {
      amount: flow.total,
      cpi: params.cpi || false,
      creditDueDate: params.credit_due_date || '',
      dateOfBirth: params.dateOfBirth || '',
      employment: params?.freelancer ? '' : (params.employment || ''),
      freelancer: params.freelancer || false,
      downPayment: params.down_payment ? params.down_payment : '0',
      commodityGroup: params.commodity_group || CommodityGroups.NOT_SELECTED,
    };
  }
}

@Injectable()
export class RatesCalculationService extends PeBaseRatesCalculationService {

  constructor(protected injector: Injector) {
    super(injector);
  }
}
