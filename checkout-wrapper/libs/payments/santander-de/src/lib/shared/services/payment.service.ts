import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delayWhen, filter } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import {
  NodePaymentResponseInterface,
} from '@pe/checkout/types';

import { PROCESSING_POLLING_INTERVAL, PROCESSING_POLLING_TIMEOUT } from '../../settings';
import { PaymentDataCustomerInterface } from '../types';

import { SantanderDeFlowService, UpdatePaymentModeEnum } from './flow.service';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private nodeFlowService = this.injector.get(NodeFlowService);
  private santanderDeFlowService = this.injector.get(SantanderDeFlowService);

  postPayment(): Observable<NodePaymentResponseInterface<PaymentDataCustomerInterface>> {
    return this.nodeFlowService.postPayment<PaymentDataCustomerInterface>().pipe(
      delayWhen(() => this.santanderDeFlowService.runUpdatePaymentWithTimeout(
        UpdatePaymentModeEnum.WaitingForSigningURL,
        {
          pollingInterval: PROCESSING_POLLING_INTERVAL,
          maxTimeout: PROCESSING_POLLING_TIMEOUT,
        }
      ).pipe(
        filter(v => !v.isCheckStatusProcessing)
      ))
    );
  }
}
