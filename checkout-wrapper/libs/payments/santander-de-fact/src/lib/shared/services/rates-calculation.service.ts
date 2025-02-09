import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, of } from 'rxjs';
import { mergeMap, map, tap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { FlowState } from '@pe/checkout/store';
import { ThreatMetrixService } from '@pe/checkout/tmetrix';
import { FlowInterface, PaymentMethodEnum, NodePaymentInterface } from '@pe/checkout/types';

import { RatesDataInterface, RateInterface, NodeSetupRateInterface } from '../types';

import { SantanderFactDeFlowService } from './santander-de-fact-flow.service';


const win = window as Window & { [key: string]: any };

interface RatesCachedData {
  rates: RateInterface[];
  flowId: string;
  flowTotal: number;
}

@Injectable()
export class RatesCalculationService {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod: PaymentMethodEnum;

  private ratesCacheKey = 'checkout_santander_factoring_rates';

  constructor(
    private nodeFlowService: NodeFlowService,
    private santanderFactDeFlowService: SantanderFactDeFlowService,
    private threatMetrixService: ThreatMetrixService,
  ) {}

  fetchRates(): Observable<RateInterface[]> {
    const cache: RateInterface[] = this.getRatesFromCache();

    if (cache) {
      return of(cache);
    } else {
      return this.fetchRatesWithoutData().pipe(
        tap((rates) => {
          this.initializePaymentDetails();
          const { annualPercentageRate } = rates.find(rate => !Number.isNaN(Number(rate.annualPercentageRate))) || {};
          this.nodeFlowService.assignPaymentDetails({ annualPercentageRate });
          this.saveRatesToCache( rates);
        }),
      );
    }
  }

  private fetchRatesWithoutData(formData: NodeSetupRateInterface = null): Observable<RateInterface[]> {
    if (!formData) {
      return this.santanderFactDeFlowService.calculateRates({ amount: String(this.flow.total) });
    } else {
      return of(this.getRatesFromCache());
    }
  }

  fetchRealRatesData(formData?: NodeSetupRateInterface): Observable<RatesDataInterface> {
    return this.requestInitializeData(formData)
      .pipe(
        mergeMap((initData: NodePaymentInterface<NodeSetupRateInterface>) => {
        this.nodeFlowService.assignPaymentDetails(initData.paymentDetails);
          if (!formData) {
            return this.santanderFactDeFlowService.calculateRates({
              ...initData.paymentDetails,
              annualPercentageRate: String(initData.paymentDetails.annualPercentageRate),
              amount: String(this.flow.total),
            }).pipe(
              map((rates: RateInterface[]) => ({
                rates,
                data: initData,
              })),
            );
          } else {
            return of({
              rates: this.getRatesFromCache(),
              data: initData,
            });
          }
        }),
      );
  }

  private initializePaymentDetails(formData?: NodeSetupRateInterface): void {
    const paymentDetails = { ...formData };
    if (formData) {
      paymentDetails.conditionsAccepted = Boolean(formData.conditionsAccepted);
      paymentDetails.advertisingAccepted = Boolean(formData.advertisingAccepted);
      if (!paymentDetails.birthday) {
        paymentDetails.birthday = new Date().toString();
      }

      const salutation = formData.personalSalutation || this.flow.billingAddress?.salutation;
      const phone = formData.phone || this.flow.billingAddress?.phone;
      this.nodeFlowService.assignPaymentDetails({ address: { salutation, phone } });
    }

    paymentDetails.riskSessionId = this.threatMetrixService.getLastRiskId(this.flow.id, this.paymentMethod);
    this.nodeFlowService.assignPaymentDetails(paymentDetails);
  }

  private requestInitializeData(
    formData: NodeSetupRateInterface,
  ): Observable<NodePaymentInterface<NodeSetupRateInterface>> {
    this.initializePaymentDetails(formData);
    const action: string = formData ? 'initialize' : 'pre-initialize';

    return this.santanderFactDeFlowService.runPaymentAction<NodeSetupRateInterface>(
      action,
    );
  }

  // Santander is complaining that we should not make additional requests
  // But we have to, because when we go to step 2 we create custom element again
  // And still need to show rates preview block (price + duration) when we saved only duration
  // So we have to cache.

  private getRatesFromCache(): RateInterface[] {
    let data: RatesCachedData = win[`pe_wrapper_santander_de_fact_${this.ratesCacheKey}`];
    try {
      data = JSON.parse(sessionStorage.getItem(this.ratesCacheKey));
    } catch (e) { }

    const { rates } = data ?? {};

    return this.flow.id === data?.flowId && this.flow.total === data?.flowTotal ? rates : null;
  }

  private saveRatesToCache(rates: RateInterface[]): void {
    const data = {
      flowId: this.flow.id,
      flowTotal: this.flow.total,
      rates,
    };

    win[`pe_wrapper_santander_de_fact_${this.ratesCacheKey}`] = data;
    try {
      sessionStorage.setItem(this.ratesCacheKey, JSON.stringify(data));
    } catch (e) { }
  }
}
