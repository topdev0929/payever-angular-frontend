import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mapTo, switchMap } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { AbstractPaymentService } from '@pe/checkout/payment';
import { ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  NodePaymentResponseInterface,
} from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common';

import { NodePaymentDetailsResponseInterface } from '../types';

@Injectable()
export class PaymentService extends AbstractPaymentService {


  private env = this.injector.get(PE_ENV);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  private localeConstantsService = this.injector.get(LocaleConstantsService);

  postPayment(): Observable<NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>> {
    const lang = this.localeConstantsService.getLang();

    return this.nodeFlowService.assignPaymentDetails({
      frontendFinishUrl: `${this.env.frontend.checkoutWrapper}/${lang}/pay/${this.flow.id}/redirect-to-payment`,
    }).pipe(
      switchMap(() => this.nodeFlowService.postPayment<NodePaymentDetailsResponseInterface>().pipe(
        switchMap((response) => {
          if (response.paymentDetails?.frontendFinishUrl) {
            return this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(
              mapTo(response),
            );
          }

          return of(response);
        }),
      )),
    );
  }
}
