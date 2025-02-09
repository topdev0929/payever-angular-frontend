import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { AbstractControl, Validator } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentSubmissionService } from '@pe/checkout/payment';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { FormInterface } from '../../../../shared/types';


interface StripeErrorInterface {
  error: {
    code: string,
    doc_url: string,
    message: string,
    param: string,
    type: string
  };
}

@Injectable()
export class CreditCardValidator implements Validator {

  @SelectSnapshot(FlowState.flow) private flow!: FlowInterface;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private nodeFlowService: NodeFlowService,
    private http: HttpClient,
    private submit$: PaymentSubmissionService,
  ) {}

  validate(control: AbstractControl): Observable<{ [key: string]: any } | null> {
    return this.submit$.pipe(
      take(1),
      switchMap(() => this.getStripeKey().pipe(
        switchMap(stripeKey => this.checkCardData(control, stripeKey)),
      )),
    );
  }

  private getStripeKey(): Observable<string> {
    return this.http.post<{publishKey: string}>(
      `${this.env.thirdParty.payments}/api/connection/${this.flow.connectionId}/action/get-publish-key`,
      {},
    ).pipe(
      map(res => res.publishKey),
    );
  }

  private checkCardData(control: AbstractControl, stripeKey: string): Observable<any> {
    const data = control.value;

    let payload = new HttpParams();
    payload = payload.set('card[name]', data.cardHolderName);
    payload = payload.set('card[number]', data.cardNumber);
    payload = payload.set('card[cvc]', String(data.cardCvc));
    payload = payload.set('card[exp_month]', String(data.cardExpiration.slice(0, 2)));
    payload = payload.set('card[exp_year]', String(data.cardExpiration.slice(2)));
    payload = payload.set('card[address_zip]', this.flow.billingAddress?.zipCode);
    payload = payload.set('key', stripeKey);

    const headers: any = {
      'content-type': 'application/x-www-form-urlencoded',
    };

    return this.http.post<{id: string}>(
      'https://api.stripe.com/v1/tokens',
      payload,
      { headers },
      ).pipe(
        switchMap(raw => this.nodeFlowService.assignPaymentDetails({ tokenId: raw.id }).pipe(
          take(1),
          map(() => null),
        )),
        catchError((err) => {
          const parsedError = this.parseError(err);
          const field = Object.keys(parsedError)[0];
          control.get(field).setErrors(parsedError);

          return of(parsedError);
        }),
      );
  }

  private parseError(error: StripeErrorInterface): { [key: string]: string } {
    let result: { [key in keyof FormInterface]: string } = {};
    switch (error.error?.code) {
      case 'invalid_number':
      case 'incorrect_number':
        result = { cardNumber: $localize `:@@payment-stripe.inquiry.stripe_errors.invalid_number:` };
        break;
      case 'invalid_card_type':
        result = { cardNumber: $localize `:@@payment-stripe.inquiry.stripe_errors.invalid_card_type:` };
        break;
      case 'invalid_charge_amount':
        result = { cardNumber: $localize `:@@payment-stripe.inquiry.stripe_errors.invalid_charge_amount:` };
        break;
      case 'invalid_cvc':
        result = { cardCvc: $localize `:@@payment-stripe.inquiry.stripe_errors.invalid_cvc:` };
        break;
      case 'invalid_expiry_month':
        result = { cardExpiration: $localize `:@@payment-stripe.inquiry.stripe_errors.invalid_expiry_month:` };
        break;
      case 'invalid_expiry_year':
        result = { cardExpiration: $localize `:@@payment-stripe.inquiry.stripe_errors.invalid_expiry_year:` };
        break;
      default:
        result = { cardNumber: error.error?.message || $localize `:@@payment-stripe.inquiry.stripe_errors.unknown_error:` };
        break;
    }

    return result;
  }
}
