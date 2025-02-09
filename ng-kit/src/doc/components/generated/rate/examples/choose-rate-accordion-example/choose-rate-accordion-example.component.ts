import { Component } from '@angular/core';

import { RateAccordionDetailInterface } from '../../../../../../kit/rate';
import { TranslateService } from '../../../../../../kit/i18n';

@Component({
  selector: 'doc-choose-rate-accordion-example',
  templateUrl: 'choose-rate-accordion-example.component.html'
})
export class ChooseRateAccordionExampleComponent {

  isLoading: boolean = false;
  scroll: number = 0;

  rates: any[] = [
    { 'bank_interest':27.8, 'cpi_amount':0, 'duration':6, 'interest_rate':9.9, 'monthly_rate':171.3, 'price':1000, 'rate_pa':8.146, 'total_amount':1027.8, 'interest_free_duration':0 },
    { 'bank_interest':39.86, 'cpi_amount':0, 'duration':9, 'interest_rate':9.9, 'monthly_rate':115.54, 'price':1000, 'rate_pa':8.497, 'total_amount':1039.86, 'interest_free_duration':0 },
    { 'bank_interest':43.9, 'cpi_amount':0, 'duration':10, 'interest_rate':9.9, 'monthly_rate':104.39, 'price':1000, 'rate_pa':8.574, 'total_amount':1043.9, 'interest_free_duration':0 },
    { 'bank_interest':52.04, 'cpi_amount':0, 'duration':12, 'interest_rate':9.9, 'monthly_rate':87.67, 'price':1000, 'rate_pa':8.704, 'total_amount':1052.04, 'interest_free_duration':0 }
  ];

  uploadedRates: RateAccordionDetailInterface[];
  currentRate: any = null;

  constructor(private translateService: TranslateService) {
    this.makeRates();
  }

  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }

  onRateSelected(rateId: string): void {
    
    this.currentRate = this.rates.find(r => String(r.duration) === rateId);
  }

  onPanelOpened(offset: number): void {
    this.scroll = offset;
  }

  private makeRates(): void {
    this.uploadedRates = this.rates.map((rate: any) => {
      return {
        id: String(rate.duration),
        title: `Pay <strong>$${rate.monthly_rate}</strong> monthly during <strong>${rate.duration}</strong> months`,
        description: `Total amount is $${rate.total_amount}`
      };
    });
  }
}
