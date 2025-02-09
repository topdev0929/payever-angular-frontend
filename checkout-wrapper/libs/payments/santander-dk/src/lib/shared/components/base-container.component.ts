import { HttpClient } from '@angular/common/http';
import { Directive, EventEmitter, OnInit, Output } from '@angular/core';

import { ApiService, NodeApiService, TrackingService } from '@pe/checkout/api';
import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import {
  TimestampEvent,
  ErrorInterface,
  FlowInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common/core';

import { NodePaymentResponseDetailsInterface } from '../types';

@Directive()
export abstract class BaseContainerComponent
  extends AbstractPaymentContainerComponent
  implements OnInit {

  readonly PaymentMethodEnum: typeof PaymentMethodEnum = PaymentMethodEnum;

  @Output('invalidateSelection') onRatesUpdateRequired =
    new EventEmitter<TimestampEvent>();

  @Output('showRatesStepEdit') onShowRatesStepEdit =
    new EventEmitter<TimestampEvent>();

  flow: FlowInterface;
  errors: ErrorInterface;
  nodeResult: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>;
  isSendingPayment = false;
  isCheckStatusProcessing = false;
  isCheckStatusTimeout = false;
  errorMessage: string;

  protected apiService: ApiService = this.injector.get(ApiService);
  protected nodeApiService: NodeApiService = this.injector.get(NodeApiService);

  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  protected http = this.injector.get(HttpClient);
  protected env = this.injector.get(PE_ENV);
  protected trackingService = this.injector.get(TrackingService);
  protected localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);

  get isPos(): boolean {
    return (
      this.paymentMethod === PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.nodeResult =
      this.nodeFlowService.getFinalResponse<NodePaymentResponseDetailsInterface>();
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
  }

  protected getPaymentUrl(): string {
    return null; // null means default
  }

  protected onPostPaymentSuccess(): void {
    return;
  }
}

