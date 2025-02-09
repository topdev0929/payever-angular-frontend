import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output,
} from '@angular/core';
import { Subject } from 'rxjs';

import { NodeApiService } from '@pe/checkout/api';
import { TopLocationService } from '@pe/checkout/location';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  FlowStateEnum,
  NodePaymentResponseInterface,
} from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

import { BaseInquiryContainerComponent } from '../../../../shared';
import { PaymentResponse } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe],
  selector: 'zinia-installments-choose-payment-container',
  templateUrl: './inquiry-container.component.html',
})
export class InquiryContainerComponent extends BaseInquiryContainerComponent implements OnInit {

  isSendingPayment = false;

  doSubmit$: Subject<void> = new Subject();

  @Output() loading = new EventEmitter<boolean>();

  @Output() override buttonText = new EventEmitter<string>();

  nodePaymentResponse: NodePaymentResponseInterface<PaymentResponse> = null;

  protected externalRedirectStorage: ExternalRedirectStorage = this.injector.get(ExternalRedirectStorage);

  protected env: EnvironmentConfigInterface = this.injector.get(PE_ENV);
  protected currencyPipe: CurrencyPipe = this.injector.get(CurrencyPipe);
  protected nodeApiService: NodeApiService = this.injector.get(NodeApiService);
  protected windowTopLocation: TopLocationService = this.injector.get(TopLocationService);

  ngOnInit(): void {
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.buttonText.next($localize `:@@payment-zinia-installments.actions.pay:`);
    this.onServiceReady.emit(true);
  }

  triggerSubmit(): void {
    this.continue.next();
  }

  isFlowHasFinishedPayment(): boolean {
    return Boolean(this.flow && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }
}
