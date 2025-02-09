import { Component } from '@angular/core';

import { RateDetailInterface } from '../../../../../../kit/rate';
import { TranslateService } from '../../../../../../kit/i18n';

@Component({
  selector: 'doc-choose-rate-example',
  templateUrl: 'choose-rate-example.component.html'
})
export class ChooseRateExampleDocComponent {

  isLoading: boolean = false;
  numLines: number = 0;
  isAsSingleLine: boolean = false;
  rates: any[] = [
    { 'bank_interest':27.8, 'cpi_amount':0, 'duration':6, 'interest_rate':9.9, 'monthly_rate':171.3, 'price':1000, 'rate_pa':8.146, 'total_amount':1027.8, 'interest_free_duration':0 },
    { 'bank_interest':39.86, 'cpi_amount':0, 'duration':9, 'interest_rate':9.9, 'monthly_rate':115.54, 'price':1000, 'rate_pa':8.497, 'total_amount':1039.86, 'interest_free_duration':0 },
    { 'bank_interest':43.9, 'cpi_amount':0, 'duration':10, 'interest_rate':9.9, 'monthly_rate':104.39, 'price':1000, 'rate_pa':8.574, 'total_amount':1043.9, 'interest_free_duration':0 },
    { 'bank_interest':52.04, 'cpi_amount':0, 'duration':12, 'interest_rate':9.9, 'monthly_rate':87.67, 'price':1000, 'rate_pa':8.704, 'total_amount':1052.04, 'interest_free_duration':0 },
    { 'bank_interest':76.76, 'cpi_amount':0, 'duration':18, 'interest_rate':9.9, 'monthly_rate':59.82, 'price':1000, 'rate_pa':8.941, 'total_amount':1076.76, 'interest_free_duration':0 },
    { 'bank_interest':85, 'cpi_amount':0, 'duration':20, 'interest_rate':9.9, 'monthly_rate':54.25, 'price':1000, 'rate_pa':8.985, 'total_amount':1085, 'interest_free_duration':0 },
    { 'bank_interest':101.84, 'cpi_amount':0, 'duration':24, 'interest_rate':9.9, 'monthly_rate':45.91, 'price':1000, 'rate_pa':9.065, 'total_amount':1101.84, 'interest_free_duration':0 },
    { 'bank_interest':127.1, 'cpi_amount':0, 'duration':30, 'interest_rate':9.9, 'monthly_rate':37.57, 'price':1000, 'rate_pa':9.134, 'total_amount':1127.1, 'interest_free_duration':0 },
    { 'bank_interest':153.08, 'cpi_amount':0, 'duration':36, 'interest_rate':9.9, 'monthly_rate':32.03, 'price':1000, 'rate_pa':9.199, 'total_amount':1153.08, 'interest_free_duration':0 },
    { 'bank_interest':178.94, 'cpi_amount':0, 'duration':42, 'interest_rate':9.9, 'monthly_rate':28.07, 'price':1000, 'rate_pa':9.222, 'total_amount':1178.94, 'interest_free_duration':0 },
    { 'bank_interest':205.76, 'cpi_amount':0, 'duration':48, 'interest_rate':9.9, 'monthly_rate':25.12, 'price':1000, 'rate_pa':9.267, 'total_amount':1205.76, 'interest_free_duration':0 },
    { 'bank_interest':232.82, 'cpi_amount':0, 'duration':54, 'interest_rate':9.9, 'monthly_rate':22.83, 'price':1000, 'rate_pa':9.294, 'total_amount':1232.82, 'interest_free_duration':0 },
    { 'bank_interest':259.4, 'cpi_amount':0, 'duration':60, 'interest_rate':9.9, 'monthly_rate':20.99, 'price':1000, 'rate_pa':9.289, 'total_amount':1259.4, 'interest_free_duration':0 },
    { 'bank_interest':288.32, 'cpi_amount':0, 'duration':66, 'interest_rate':9.9, 'monthly_rate':19.52, 'price':1000, 'rate_pa':9.344, 'total_amount':1288.32, 'interest_free_duration':0 },
    { 'bank_interest':315.44, 'cpi_amount':0, 'duration':72, 'interest_rate':9.9, 'monthly_rate':18.27, 'price':1000, 'rate_pa':9.332, 'total_amount':1315.44, 'interest_free_duration':0 }
  ];

  uploadedRates: RateDetailInterface[];
  currentRate: any = null;

  constructor(private translateService: TranslateService) {
    this.makeRates();
  }

  toggleLoading(): void {
    this.isLoading = !this.isLoading;
  }

  toggleLines(): void {
    this.numLines++;
    if (this.numLines > 3) this.numLines = 0;
    this.makeRates();
  }

  toggleAsSingleLine(): void {
    this.isAsSingleLine = !this.isAsSingleLine;
    this.makeRates();
  }

  onRateSelected(rateId: string): void {
    
    this.currentRate = this.rates.find(r => String(r.duration) === rateId);
  }

  private makeRates(): void {
    this.uploadedRates = this.rates.map((rate: any) => {
      return {
        id: String(rate.duration),
        title: `Pay <strong>$${rate.monthly_rate}</strong> monthly during <strong>${rate.duration}</strong> months`,
        lines: [ `Total amount is $${rate.total_amount}`, `Bank interest is ${rate.bank_interest}`, `Interest rate is ${rate.interest_rate}` ].slice(0, this.numLines)
      };
    });
  }
}
