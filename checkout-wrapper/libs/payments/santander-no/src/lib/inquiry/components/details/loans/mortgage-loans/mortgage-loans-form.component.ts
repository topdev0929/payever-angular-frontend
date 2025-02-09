import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import memoize from 'fast-memoize';

import { PeDestroyService } from '@pe/destroy';

import { BaseLoansFormComponent } from '../base-loans-form.component';

@Component({
  selector: 'santander-no-mortgage-loans-form',
  templateUrl: './mortgage-loans-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class MortgageLoansFormComponent extends BaseLoansFormComponent {
  public translate(i: number) {
    return {
      loanAmount: $localize `:@@santander-no.inquiry.form.mortgage_loans_loan_amount.label:${i}:index:`,
      remainingTerms: $localize `:@@santander-no.inquiry.form.mortgage_loans_remaining_terms.label:${i}:index:`,
      interestRate: $localize `:@@santander-no.inquiry.form.mortgage_loans_interest_rate.label:${i}:index:`,
    };
  }

  public readonly translateMemo = memoize(this.translate.bind(this));

  protected createForm(): void {
    this.loansForm.push(this.fb.group({
      loanAmount: [null, [Validators.required, Validators.min(0)]],
      remainingTerms: [null, [Validators.required, Validators.min(0)]],
      interestRate: [null, [Validators.required, Validators.min(0)]],
    }));
  }
}
