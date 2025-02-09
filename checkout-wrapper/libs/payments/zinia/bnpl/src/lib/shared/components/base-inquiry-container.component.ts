import { Directive, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';

import { ThreatMetrixService } from '@pe/checkout/tmetrix';
import { FlowInterface, TimestampEvent } from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';

import { BaseContainerComponent } from './base-container.component';

@Directive()
export abstract class BaseInquiryContainerComponent extends BaseContainerComponent implements OnInit {
  protected threatMetrixService = inject(ThreatMetrixService);
  protected paymentHelperService = inject(PaymentHelperService);

  @Output() continue = new EventEmitter<TimestampEvent>();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  private readonly threatMetrixLoad$ = new BehaviorSubject<FlowInterface>(null);
  threatMetrixProcess$ = this.threatMetrixLoad$.pipe(
    filter(d => !!d),
    switchMap(flow => this.threatMetrixService.nodeInitFor(
      flow.id,
      flow.connectionId,
      this.paymentMethod,
    ).pipe(
      map(loaded => ({
        inProgress: false,
        loaded,
      })),
    ))
  );

  abstract triggerSubmit(): void;

  ngOnInit(): void {
    super.ngOnInit();

    this.paymentHelperService.setPaymentLoading(true);
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);
    this.threatMetrixLoad$.next(this.flow);

    this.buttonText.next($localize`:@@payment-openbank.actions.pay:`);
  }

  reloadThreatMetrix() {
    this.flow && this.threatMetrixLoad$.next(this.flow);
  }
}
