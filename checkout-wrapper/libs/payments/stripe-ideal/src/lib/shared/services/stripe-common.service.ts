import { Injectable } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { StripeFlowService } from './stripe-flow.service';

import IStripe = stripe.Stripe;

@Injectable()
export class StripeCommonService {
  constructor(
    private stripeFlowService: StripeFlowService,
  ) {}

  initStripe(): Observable<IStripe> {
    return combineLatest([
      this.stripeFlowService.getStripeData(),
      this.addScriptToPage(),
    ]).pipe(
      map(([data]) => Stripe(data.publishKey))
    );
  }

  private addScriptToPage(): Observable<boolean> {
    return new Observable((obs) => {
      const scriptUrl = 'https://js.stripe.com/v3/';
      const scriptId = 'pe-js-stripe-com-v3';

      const existing: HTMLScriptElement = document.getElementById(scriptId) as HTMLScriptElement;
      if (existing) {
        obs.next(true);
      } else {
        const script: HTMLScriptElement = document.createElement('script');
        script.id = scriptId;
        script.src = scriptUrl;
        script.onload = () => {
          obs.next(true);
        };
        script.onerror = (err) => {
          obs.error(err);
        };
        document.head.appendChild(script);
      }
    });
  }
}
