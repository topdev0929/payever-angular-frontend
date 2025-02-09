import { Component, ChangeDetectionStrategy } from '@angular/core';

import {
  BaseSummaryComponent,
  PersonTypeEnum,
  PERSON_TYPE,
  FormValue,
  EmploymentFormValue,
  IncomeFormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-de-pos-summary-income-employment',
  templateUrl: './summary-income-employment.component.html',
  styles: [`
    :host {
      display: block;
      font-weight: 400;
    }
  `],
  providers: [PeDestroyService],
})
export class SummaryIncomeEmploymentComponent extends BaseSummaryComponent {
  public paymentMethod: PaymentMethodEnum = this.store.selectSnapshot(FlowState.paymentMethod);
  public formData: FormValue = this.store.selectSnapshot(PaymentState.form);

  public personType: PersonTypeEnum = this.injector.get(PERSON_TYPE);

  get dataIncomeSummary(): IncomeFormValue {
    return this.formData[this.personType]?.incomeForm || {} as IncomeFormValue;
  }

  get dataEmploymentSummary(): EmploymentFormValue {
    return this.formData[this.personType].employmentForm || {} as EmploymentFormValue;
  }
}
