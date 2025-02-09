import { Component, ChangeDetectionStrategy } from '@angular/core';
import { filter, map } from 'rxjs/operators';

import {
  AbstractPaymentContainerComponent,
  AbstractPaymentSummaryContainerInterface,
} from '@pe/checkout/payment';
import { PaymentState } from '@pe/checkout/store';
import { PAYMENT_TRANSLATIONS } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';


@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-de-rates-view-container',
  templateUrl: './rates-view-container.component.html',
  styles: [':host { display: block; }'],
  providers: [PeDestroyService],
})
export class RatesViewContainerComponent
  extends AbstractPaymentContainerComponent
  implements AbstractPaymentSummaryContainerInterface {

  public currency = this.flow.currency;

  public rate$ = this.store.select(PaymentState.details).pipe(
    filter(value => !!value),
    map(({ rate }) => rate),
  );

  public formOptions: any = this.store.selectSnapshot(PaymentState.options);
  public formData = this.store.selectSnapshot(PaymentState.form);

  public get paymentTitle(): string {
    return this.flow ? PAYMENT_TRANSLATIONS[this.paymentMethod] : null;
  }
}
