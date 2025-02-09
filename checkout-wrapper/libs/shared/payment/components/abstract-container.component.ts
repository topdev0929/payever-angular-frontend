import { ChangeDetectorRef, Directive, EventEmitter, Injector, Output } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';

import { AnalyticsFormService } from '@pe/checkout/analytics';
import { RatesStateService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { FlowState, ParamsState } from '@pe/checkout/store';
import {
  FlowExtraDurationType,
  FlowInterface,
  PaymentMethodEnum,
  PaymentOptionInterface,
} from '@pe/checkout/types';
import { PAYMENT_TRANSLATIONS } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { NonFormErrorsService } from '../services';
import { ABSTRACT_PAYMENT_SERVICE } from '../tokens';

@Directive()
export abstract class AbstractContainerComponent {

  @SelectSnapshot(FlowState.flow) public flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) public paymentMethod: PaymentMethodEnum;

  @SelectSnapshot(FlowState.paymentOption) protected paymentOption: PaymentOptionInterface;

  @SelectSnapshot(ParamsState.embeddedMode) public embeddedMode: boolean;

  @SelectSnapshot(ParamsState.merchantMode) public merchantMode: boolean;

  @Output() onServiceReady = new EventEmitter<boolean>();

  public cdr = this.injector.get(ChangeDetectorRef);
  protected store = this.injector.get(Store);
  protected nodeFlowService = this.injector.get(NodeFlowService);
  protected storage = this.injector.get(PaymentInquiryStorage);
  protected nonFormErrorsService = this.injector.get(NonFormErrorsService);
  protected analyticsFormService = this.injector.get(AnalyticsFormService);
  protected ratesStateService = this.injector.get(RatesStateService);
  protected destroy$ = this.injector.get(PeDestroyService);
  private paymentService = this.injector.get(ABSTRACT_PAYMENT_SERVICE);

  constructor(protected injector: Injector) {}

  get paymentTitle(): string {
    return this.flow ? PAYMENT_TRANSLATIONS[this.paymentMethod] : null;
  }

  get extraDuration(): FlowExtraDurationType {
    const enableDurations = this.storage.getExtraDurations(this.flow.id);

    if (this.flow?.extra?.duration) {
      return this.flow?.extra?.duration;
    }
    if (!this.ratesStateService.enableDurationsSelectForMerchant$.value && enableDurations?.length) {
      return enableDurations;
    }

    return null;
  }

  tryAgain(): void {
    this.postPayment();
  }

  protected postPayment(): void {
    // prevent eslint and sonar issue
  }

}
