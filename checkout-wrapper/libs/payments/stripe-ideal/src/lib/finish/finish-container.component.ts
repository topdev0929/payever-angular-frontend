import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { Subscription, interval, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil } from 'rxjs/operators';

import { AbstractFinishContainer, AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { ExternalNavigateData, ExternalRedirectStorage } from '@pe/checkout/storage';
import {
  NodePaymentResponseInterface,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';

import {
  NodePaymentResponseDetailsInterface,
  StripeCommonService,
} from '../shared';

import IStripe = stripe.Stripe;
import IElement = stripe.elements.Element;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'stripe-ideal-finish-container',
  templateUrl: './finish-container.component.html',
  styles: [':host { display: block; }'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent
  implements AbstractFinishContainer {

  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  private stripeCommonService = this.injector.get(StripeCommonService);
  private externalRedirectStorage = this.injector.get(ExternalRedirectStorage);
  protected externalNavigateData = this.injector.get(ExternalNavigateData);

  isLoading: boolean;
  isCheckStatusTimeout: boolean;
  stripeError: string;

  showFinishModalFromExistingPayment(): void {
    super.showFinishModalFromExistingPayment();

    const paymentIntent = this.externalNavigateData.getValue(this.flow.id, 'payment_intent');

    if (this.paymentResponse.payment.status === PaymentStatusEnum.STATUS_NEW
      && !(this.activatedRoute.snapshot.queryParams.processed || paymentIntent)
    ) {
      this.initStripe();
    } else {
      this.runStatusCheck();
    }
  }

  private runStatusCheck(): void {
    const start: number = Math.floor(Date.now());
    const delay: number = 3 * 1000;
    const timeout: number = 180 * 1000;

    this.isLoading = true;
    this.isCheckStatusTimeout = false;
    this.cdr.markForCheck();

    let requesting = false;
    const sub: Subscription = interval(delay).subscribe(() => {
      if (requesting) {
        return; // Skip if request still processing during delay finished
      }
      requesting = true;
      this.nodeFlowService.updatePayment<NodePaymentResponseDetailsInterface>().pipe(
        takeUntil(this.destroy$)
      ).subscribe((nodePaymentResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>) => {
        this.paymentResponse = nodePaymentResponse;
        let done = false;
        if (this.paymentResponse.payment.status !== PaymentStatusEnum.STATUS_NEW) {
          done = true;
        } else if (Math.floor(Date.now()) > (start + timeout)) {
          this.isCheckStatusTimeout = true;
          done = true;
        }

        if (done) {
          this.isLoading = false;
          this.cdr.markForCheck();
          sub.unsubscribe();
        }
        requesting = false;
      },
        (response: ResponseErrorsInterface) => {
          this.errors = response.errors;
          this.isLoading = false;
          this.isCheckStatusTimeout = false;
          this.errorMessage = response.raw?.error?.message || response.message;
          requesting = false;
          this.cdr.markForCheck();
          sub.unsubscribe();
        });
    });
  }

  initStripe() {
    this.stripeCommonService.initStripe().pipe(
      switchMap((stripe: IStripe) => {
        const elements = stripe.elements();
        const idealBankValue = this.flowStorage.getData(this.flow.id, 'idealBank', '');
        const options = {
          value: idealBankValue,
        };
        // Create an instance of the idealBank Element
        const idealBank = elements.create('idealBank', options);
        idealBank.mount('#ideal-bank-element-finish');

        return this.idealBankReady(idealBank).pipe(
          switchMap(() => this.externalRedirectStorage.saveDataBeforeRedirect(this.flow).pipe(
            filter(() => !!this.paymentResponse),
            map(() => {
              (stripe as any).confirmIdealPayment(
                this.paymentResponse.paymentDetails.clientSecret,
                {
                  payment_method: {
                    ideal: idealBank,
                    billing_details: {
                      name: `${this.flow.billingAddress.firstName} ${this.flow.billingAddress.lastName}`.trim(),
                    },
                  },
                  return_url: this.paymentResponse.paymentDetails.postbackUrl,
                }
              ).catch((error: any) => {
                this.errors = error;
                this.errorMessage = error.message;
              });

              return this.paymentResponse;
            }),
          )),
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private idealBankReady(idealBank: IElement): Observable<void> {
    return new Observable((observer) => {
      idealBank.on('ready', () => {
        observer.next();
        observer.complete();
      });
    });
  }
}
