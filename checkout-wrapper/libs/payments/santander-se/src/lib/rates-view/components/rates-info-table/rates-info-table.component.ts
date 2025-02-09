import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';
import dayjs from 'dayjs';
import { takeUntil } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { BaseRateComponent, RateInterface, SelectedRateDataInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-se-rates-info-table',
  templateUrl: './rates-info-table.component.html',
  styleUrls: ['./rates-info-table.component.scss'],
  providers: [PeDestroyService],
})
export class RatesInfoTableComponent extends BaseRateComponent implements OnInit {

  @Input() flowId: string;
  @Input() paymentMethod: PaymentMethodEnum;
  @Input() initialData: SelectedRateDataInterface;
  @Input() total: number;
  @Input() currency: string;
  @Input() paymentTitle: string;

  selectedRate: RateInterface = null;

  private localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);

  get translations(): { [key: string]: string } {
    return {
      titlePp: $localize `:@@santander-se.credit_rates.rate_title_pp:\
        ${this.currencyPipe.transform(this.selectedRate?.monthlyCost, this.currency)}:monthlyCost:`,
      titleBnpl: $localize `:@@santander-se.credit_rates.rate_title_bnpl:\
        ${this.currencyPipe.transform(this.selectedRate?.totalCost, this.currency)}:totalCost:\
        ${this.getMonthNameBNPL()}:monthName:`,
      duration: this.selectedRate?.months === 1
        ? $localize `:@@santander-se.duration.one_month:${this.selectedRate?.months}:count:`
        : $localize `:@@santander-se.duration.count_months:${this.selectedRate?.months}:count:`,
    };
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  getMonthNameBNPL(): string {
    const rate: RateInterface = this.selectedRate;
    const moment = dayjs().add(rate.months - 1, 'months');

    return moment.locale(this.localeConstantsService.getLang()).format('MMMM');
  }

  fetchProducts(): void {
    if (this.total && this.currency) {
      this.ratesCalculationService.fetchRatesOnce(
        this.flowId, this.paymentMethod, this.total
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe((data: RateInterface[]) => {
        this.selectedRate = this.getRateByFormData(this.initialData, data);
        this.cdr.detectChanges();
      });
    }
  }
}
