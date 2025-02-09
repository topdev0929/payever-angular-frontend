import { Component } from '@angular/core';

import { RateDetailInterface } from '../../../../../../kit/rate';
import { TranslateService } from '../../../../../../kit/i18n';

@Component({
  selector: 'doc-choose-single-rate-example',
  templateUrl: 'choose-single-rate-example.component.html'
})
export class ChooseSingleRateExampleDocComponent {

  isLoading: boolean = false;
  rates: any[] = [
    { 'bank_interest':27.8, 'cpi_amount':0, 'duration':6, 'interest_rate':9.9, 'monthly_rate':171.3, 'price':1000, 'rate_pa':8.146, 'total_amount':1027.8, 'interest_free_duration':0 }
  ];

  uploadedRates: RateDetailInterface[];

  constructor(private translateService: TranslateService) {
    this.uploadedRates = this.rates.map((rate: any) => {
      return {
        id: rate.duration,
        title: this.translateService.translate('ng_kit.rate.rate_summary', {
          monthlyRate: `<strong>$${rate.monthly_rate}</strong>`,
          duration: rate.duration
        }),
        lines:  [ `Total amount is $${rate.total_amount}` ]
      };
    });
  }

  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }
}
