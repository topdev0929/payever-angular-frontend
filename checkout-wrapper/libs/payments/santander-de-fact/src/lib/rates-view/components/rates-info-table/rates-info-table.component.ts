import { Component, ChangeDetectionStrategy, Input, OnChanges } from '@angular/core';

import { PeCurrencyPipe } from '@pe/checkout/utils';

import { RateInterface } from '../../../shared';

@Component({
  selector: 'santander-de-fact-rates-info-table',
  templateUrl: './rates-info-table.component.html',
  styleUrls: ['./rates-info-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatesInfoTableComponent implements OnChanges {

  @Input() currency: string;
  @Input() paymentTitle: string;
  @Input() rate: RateInterface;

  durationWithRates: string;

  constructor(
    private currencyPipe: PeCurrencyPipe,
  ) {}

  ngOnChanges(): void {
    if (this.currency && this.rate) {
      const label = this.rate.duration > 0
        ? $localize `:@@credit_rates.months:`
        : $localize `:@@credit_rates.month:`;
      const lastRate = this.currencyPipe.transform(this.rate.lastMonthPayment, this.currency);
      const monthlyRate = this.currencyPipe.transform(this.rate.monthlyPayment, this.currency);
      this.durationWithRates = $localize `:@@credit_rates.duration_value_with_rates:\
        ${this.rate.duration - 1}:duration:\
        ${label}:label:\
        ${lastRate}:last_rate:\
        ${monthlyRate}:monthly_rate:`;
    }
  }
}
