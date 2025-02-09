import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import {
  ProductTypeEnum,
  RateInterface,
  SelectedRateDataInterface,
  BaseRateComponent,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-no-rates-info-table',
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
  @Input() creditType: ProductTypeEnum;
  @Input() paymentTitle: string;

  selectedRate: RateInterface = null;

  get translations() {
    return {
      duration: this.selectedRate?.duration === 1
      ? $localize `:@@santander-no.duration.one_month:${this.selectedRate?.duration}:count:`
      : $localize `:@@santander-no.duration.count_months:${this.selectedRate?.duration}:count:`,
    };
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    if (this.total && this.currency) {
      this.ratesCalculationService.fetchRatesOnce(
        this.flowId, this.paymentMethod, this.total, this.creditType
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe((data) => {
        this.selectedRate = this.getRateByFormData(this.initialData, data);
      });
    }
  }
}
