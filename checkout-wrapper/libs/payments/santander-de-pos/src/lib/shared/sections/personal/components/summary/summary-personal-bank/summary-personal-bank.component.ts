import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngxs/store';

import {
  BaseSummaryComponent,
  PERSON_TYPE,
  FormValue,
  PersonalFormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-de-pos-summary-personal-bank',
  templateUrl: './summary-personal-bank.component.html',
  styles: [`
    :host {
      display: block;
      font-weight: 400;
    }
  `],
  providers: [PeDestroyService],
})
export class SummaryPersonalBankComponent extends BaseSummaryComponent {

  public personType = this.injector.get(PERSON_TYPE);
  public store = this.injector.get(Store);

  private readonly paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
  public readonly paymentForm: FormValue = this.store
    .selectSnapshot(PaymentState.form);

  get personalFormValue() {
    return this.paymentForm?.[this.personType]?.personalForm
      || {} as PersonalFormValue;
  }
}
