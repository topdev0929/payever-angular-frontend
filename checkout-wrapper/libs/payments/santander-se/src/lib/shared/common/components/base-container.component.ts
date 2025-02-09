import { Directive, EventEmitter, OnInit, Output } from '@angular/core';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';
import {
  ErrorInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  TimestampEvent,
} from '@pe/checkout/types';

import {
  NodePaymentResponseDetailsInterface,
} from '../types';

@Directive()
export abstract class BaseContainerComponent extends AbstractPaymentContainerComponent implements OnInit {

  readonly PaymentMethodEnum: typeof PaymentMethodEnum = PaymentMethodEnum;

  @Output('invalidateSelection') onRatesUpdateRequired =
    new EventEmitter<TimestampEvent>();

  @Output('ratesLoading') onRatesLoading = new EventEmitter<boolean>();
  @Output('showRatesStepEdit') onShowRatesStepEdit =
    new EventEmitter<TimestampEvent>();

  errors: ErrorInterface;
  nodeResult: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>;

  protected apiService: ApiService = this.injector.get(ApiService);
  protected nodeApiService: NodeApiService = this.injector.get(NodeApiService);

  get isPos(): boolean {
    return (
      this.paymentMethod === PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_SE
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.nodeResult = this.nodeFlowService.getFinalResponse<NodePaymentResponseDetailsInterface>();
  }
}
