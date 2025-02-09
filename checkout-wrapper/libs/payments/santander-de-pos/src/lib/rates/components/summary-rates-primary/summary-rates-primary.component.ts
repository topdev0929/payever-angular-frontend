import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  RateInterface,
  BaseSummaryComponent,
  FormValue,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PAYMENT_TRANSLATIONS } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';


@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-de-pos-summary-rates-primary',
  templateUrl: './summary-rates-primary.component.html',
  styles: [`
    :host {
      display: block;
      font-weight: 400;
    }
  `],
  providers: [PeDestroyService],
})
export class SummaryRatesPrimaryComponent extends BaseSummaryComponent implements OnInit {
  public rateData: RateInterface;
  public translations$ = new BehaviorSubject<any>(null);
  public paymentTranslations$ = new BehaviorSubject<any>(null);

  public readonly paymentMethod: PaymentMethodEnum = this.store.selectSnapshot(FlowState.paymentMethod);
  public readonly formData: FormValue = this.store.selectSnapshot(PaymentState.form);

  ngOnInit() {
    this.paymentTranslations$.next(PAYMENT_TRANSLATIONS[this.paymentMethod]);

    this.rateData = this.formData?.ratesForm?._rate;
    if ( this.rateData) {
      const months = $localize `:@@payment-santander-de-pos.creditRates.months:`;
      const month = $localize `:@@payment-santander-de-pos.creditRates.month:`;
      this.translations$.next({
        durationValueFormatted: $localize `:@@payment-santander-de-pos.creditRates.durationValueFormatted:
        ${this.rateData.duration}:duration:${this.rateData.duration > 1 ? months : month}:label:`,
        subsequentInstalment: $localize `:@@payment-santander-de-pos.creditRates.rateParam.subsequentInstalment:`,
        duration: $localize `:@@payment-santander-de-pos.creditRates.rateParam.duration:`,
        totalLoan: $localize `:@@payment-santander-de-pos.creditRates.rateParam.totalLoan:`,
      });
    }
  }

  getConditionTitle(value: string): string {
    const condition = this.formOptions.conditions.find(a => !!a.programs.find(b => b.key === value));
    const program = condition?.programs?.find(b => b.key === value);
    const programText =
      $localize `:@@payment-santander-de-pos.inquiry.form._program_view.valuePattern:${program.program}:program:`;

    return condition?.programs.length === 1 ? condition.description : `${condition.description} (${programText})`;
  }
}
