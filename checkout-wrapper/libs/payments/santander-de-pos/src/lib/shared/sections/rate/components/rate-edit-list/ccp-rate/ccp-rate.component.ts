import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export const CCP_MIN_INITIAL_RATE = 500;

import {
  ConditionInterface,
  FormOptionsInterface,
  RateInterface,
} from '@pe/checkout/santander-de-pos/shared';
import { PeCurrencyPipe } from '@pe/checkout/utils';

@Component({
  selector: 'santander-de-pos-ccp-rate',
  templateUrl: './ccp-rate.component.html',
  styleUrls: ['./ccp-rate.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [ PeCurrencyPipe ],
})
export class CcpRateComponent {

  private _rates: RateInterface[];

  @Input() nodeFormOptions: FormOptionsInterface = null;
  @Input() currencyCode: string;
  @Input() condition: ConditionInterface;
  @Input() set rates(value: RateInterface[]) {
    this._rates = value;
    this.selected.emit(String(value[0]?.duration));
  }

  @Output() selected = new EventEmitter<string>();

  get rate(): RateInterface {
    return this._rates?.[0];
  }

  get title(): string {
    const initialMinRate: number = Math.max(CCP_MIN_INITIAL_RATE, this.rate?.monthlyPayment);

    return $localize `:@@payment-santander-de-pos.creditRates.ccpRate.title:${this.currencyPipeTransform(initialMinRate)}:rate:`;
  }

  get description(): string {
    const numMonthsText = `<b>${this.numMonths}</b>`;

    return this.numMonths
      ? $localize `:@@payment-santander-de-pos.creditRates.ccpRate.description:${numMonthsText}:months:`
      : null;
  }

  get numMonths(): number {
    const parsed: RegExpMatchArray = (this.condition?.description || '').match(/0% (\d+)M/i);

    return parsed?.[1] ? parseInt(parsed[1], 10) : 0;
  }

  constructor(
    private currencyPipe: PeCurrencyPipe,
  ) {}

  private currencyPipeTransform(value: number): string {
    return `<span>${
      this.currencyPipe.transform(value, this.currencyCode, 'symbol', '1.2-2')
    }</span>`;
  }

}
