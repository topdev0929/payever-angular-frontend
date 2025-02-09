import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';

import { CompositeForm } from '@pe/checkout/forms';

import { ExistingLoansFormValue } from '../../../../shared';

const DEPT_MIN = 0;
const DEPT_MAX = 999_999;

@Component({
  selector: 'existing-loans-form',
  templateUrl: './existing-loans-form.component.html',
  styles: [
    `
    .tooltip {
      margin-left: 6px;
      cursor: pointer;
      color: #999999;
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExistingLoansFormComponent extends CompositeForm<ExistingLoansFormValue> implements OnInit {
  protected readonly translations = {
    tooltip: $localize`:@@santander-se.inquiry.form.existing_loans.tooltip:`,
  };

  protected readonly formGroup = this.fb.group({
    totalDebtAmountExcludingMortgages: this.fb.control(null, [
      Validators.required,
      Validators.min(DEPT_MIN),
      Validators.max(DEPT_MAX),
    ]),
    totalMonthlyDebtCostExcludingMortgages: this.fb.control(null, [
      Validators.required,
      Validators.min(DEPT_MIN),
      Validators.max(DEPT_MAX),
    ]),
  });

  ngOnInit() {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['help-24'],
      null,
      this.customElementService.shadowRoot
    );
  }
}
