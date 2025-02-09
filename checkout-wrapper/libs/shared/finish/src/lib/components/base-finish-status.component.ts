import { Directive, Injector, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { FlowState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { PAYMENTS_REQUIRING_VERIFICATION } from '../constants';
import { FinishStatusTranslationsInterface } from '../types';

@Directive()
export abstract class BaseFinishStatusComponent implements OnChanges {

  @Select(FlowState.paymentMethod) private paymentMethod$: Observable<PaymentMethodEnum>;

  @Input() flowId: string;
  @Input() transactionNumber: string;
  @Input() applicationNumber: string;
  @Input() transactionLink: string;

  abstract prepareTranslations(applicationNumber: string, transactionLink: string, transactionNumber: string): void;

  translations: FinishStatusTranslationsInterface;

  showExternalCode$: Observable<boolean>;

  constructor(protected injector: Injector) {}

  ngOnChanges(changes: SimpleChanges): void {
    const { applicationNumber, transactionLink, transactionNumber } = changes;

    if (changes.flowId?.currentValue) {
      this.showExternalCode$ = this.paymentMethod$.pipe(
        map(paymentMethod => PAYMENTS_REQUIRING_VERIFICATION.includes(paymentMethod)),
      );
    }

    if (applicationNumber?.currentValue || transactionLink?.currentValue || transactionNumber?.currentValue) {
      this.prepareTranslations(this.applicationNumber, this.transactionLink, this.transactionNumber);
    }
  }
}
