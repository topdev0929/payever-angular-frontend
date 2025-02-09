import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Validators } from '@angular/forms';
import memoize from 'fast-memoize';

import { BaseLoansFormComponent } from '../base-loans-form.component';

@Component({
  selector: 'santander-no-student-loans-form',
  templateUrl: './student-loans-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentLoansFormComponent extends BaseLoansFormComponent {
  public translate(i: number) {
    return {
      loanAmount: $localize `:@@santander-no.inquiry.form.student_loans_loan_amount.label:${i}:index:`,
      remainingTerms: $localize `:@@santander-no.inquiry.form.student_loans_remaining_terms.label:${i}:index:`,
    };
  }

  public readonly translateMemo = memoize(this.translate.bind(this));

  protected createForm(): void {
    this.loansForm.push(this.fb.group({
      loanAmount: [null, [Validators.required, Validators.min(0)]],
      remainingTerms: [null, [Validators.required, Validators.min(0)]],
    }));
  }
}
