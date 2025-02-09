import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { NodePaymentResponseInterface } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { NodePaymentResponseDetailsInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {

  private env = this.injector.get(PE_ENV);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  private preparePaymentData(): Observable<void> {
    const nodeAdditionalPaymentDetails = {
      postbackUrl: `${this.env.frontend.checkoutWrapper}/${this.localeConstantsService.getLang()}/pay/${this.flow.id}/redirect-to-payment`,
    };

    return this.nodeFlowService.assignPaymentDetails(nodeAdditionalPaymentDetails);
  }

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>> {
    return this.preparePaymentData().pipe(
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentResponseDetailsInterface>()),
    );
  }
}
