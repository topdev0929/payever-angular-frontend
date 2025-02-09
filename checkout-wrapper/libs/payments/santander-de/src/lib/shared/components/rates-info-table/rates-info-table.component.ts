import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { CREDIT_DUE_TRANSLATION } from '../../translations';
import {
  FormInterface,
  FormOptionsInterface,
  RateInterface,
  TranslateConfigInterface,
} from '../../types';

@Component({
  selector: 'santander-de-rates-info-table',
  templateUrl: './rates-info-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatesInfoTableComponent {
  translateConfig: TranslateConfigInterface;

  @Input() currency: string;
  @Input() paymentTitle: string;
  @Input() rate: RateInterface;
  @Input() formOptions: FormOptionsInterface = null;

  @Input() data: FormInterface = {};

  get durationLabel(): string {
    return this.rate.duration > 1
      ? $localize `:@@santander-de.credit_rates.months:`
      : $localize `:@@santander-de.credit_rates.month:`;
  }

  get creditDueDate(): string {
    return CREDIT_DUE_TRANSLATION[this.data?.formRatesMain?.credit_due_date.toString()];
  }

  get cpi(): string {
    return this.data?.formRatesCheckboxes1?.credit_protection_insurance
      ? $localize `:@@ng_kit.forms.labels.yes:`
      : $localize `:@@ng_kit.forms.labels.no:`;
  }

  get translations(): { [key: string]: string } {
    return {
      duration: $localize `:@@santander-de.credit_rates.duration_value:${this.rate.duration}:duration:${this.durationLabel}:label:`,
    };
  }

}
