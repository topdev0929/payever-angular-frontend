import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

import { FlowInterface } from '@pe/checkout/types';

/**
 * Service for choose-payment step ui-state managing
 */
@Injectable({
  providedIn: 'root',
})
export class PaymentHelperService {

  totalAmount$: Subject<number> = new Subject();
  downPayment$: Subject<number> = new Subject();
  openEmbedFinish$ = new BehaviorSubject<boolean>(false);

  private isLoadingSubject$ = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject$.pipe(
    shareReplay(1),
  );

  isPos(flow: FlowInterface) {
    return flow?.channel === 'pos';
  }

  /**
   * We should work on moving all the logic related to payment loading here from all the components.
   * E.g. ChoosePaymentComponent.
   */
  setPaymentLoading(value: boolean): void {
    this.isLoadingSubject$.next(value);
  }
}
