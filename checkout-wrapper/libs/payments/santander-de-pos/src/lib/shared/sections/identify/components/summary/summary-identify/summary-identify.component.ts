import { Component, ChangeDetectionStrategy } from '@angular/core';

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
  selector: 'santander-de-pos-summary-identify',
  templateUrl: './summary-identify.component.html',
  styles: [`
    :host {
      display: block;
      font-weight: 400;
    }
  `],
  providers: [PeDestroyService],
})
export class SummaryIdentifyComponent extends BaseSummaryComponent {
  public personType = this.injector.get(PERSON_TYPE);

  private readonly paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
  public readonly paymentForm: FormValue = this.store
    .selectSnapshot(PaymentState.form);

  get identifyFormValue(): Partial<PersonalFormValue> {
    return this.paymentForm?.[this.personType]?.personalForm
      || {};
  }

}
