import { PercentPipe } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';

import { DialogRef, DialogComponentInterface, DIALOG_DATA } from '@pe/checkout/dialog';
import { PluginEventsService } from '@pe/checkout/plugins';
import { CartItemInterface } from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';

import { RateInterface } from '../../../shared';

export interface RateDetailsDialogDataInterface {
  flowId: string;
  total: number;
  currency: string;
  cart: CartItemInterface[];
  rate: RateInterface;
  businessName: string;
}

@Component({
  selector: 'santander-uk-rate-details-dialog',
  templateUrl: 'rate-details-dialog.component.html',
  styleUrls: ['./rate-details-dialog.component.scss'],
})
export class RateDetailsDialogComponent implements OnInit, DialogComponentInterface {

  dialogRef: DialogRef<RateDetailsDialogComponent>;

  get translations() {
    return {
      months: $localize `:@@payment-santander-uk.credit_rates.months:`,
      note1: $localize `:@@payment-santander-uk.inquiry.note1:${this.data?.businessName}:businessName:`,
      note2: $localize `:@@payment-santander-uk.inquiry.note2:${this.todayAsStr}:today:`,
    };
  }

  contexts: { [key: string]: { label: string, value: any } };

  get todayAsStr(): string {
    return new Date().toJSON().slice(0, 10).split('-').reverse().join('.');
  }

  constructor(
    private pluginEventsService: PluginEventsService,
    private currencyPipe: PeCurrencyPipe,
    private percentPipe: PercentPipe,
    @Inject(DIALOG_DATA) public data: RateDetailsDialogDataInterface,
  ) {}

  ngOnInit(): void {
    this.pluginEventsService.emitModalShow(this.data.flowId);
    this.initContexts();
  }

  private initContexts() {
    this.contexts = {
      total: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.total:`,
        value: this.currencyPipe.transform(this.data.total, this.data.currency),
      },
      totalGoodsPrice: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.total_goods_price:`,
        value: this.currencyPipe.transform(this.data.rate.amount, this.data.currency),
      },
      monthlyPayments: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.monthly_payments:${this.data.rate.duration}:monthlyPayment:`,
        value: this.currencyPipe.transform(this.data.rate.monthlyPayment, this.data.currency),
      },
      customerDeposit: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.customer_deposit:`,
        value: this.currencyPipe.transform(this.data.rate.specificData.downPayment || 0, this.data.currency),
      },
      amountCredit: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.amount_credit:`,
        value: this.currencyPipe.transform(
          this.data.rate.amount - (this.data.rate.specificData.downPayment || 0),
          this.data.currency),
      },
      interestCharges: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.interest_charges:`,
        value: this.currencyPipe.transform(this.data.rate.interest, this.data.currency),
      },
      totalAmount: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.total_amount:`,
        value: this.currencyPipe.transform(this.data.rate.totalCreditCost, this.data.currency),
      },
      durationAgreement: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.duration_agreement:`,
        value: `${this.data.rate.duration} ${this.translations.months}`,
      },
      fixedRate: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.fixed_rate:`,
        value: this.percentPipe.transform(this.data.rate.specificData.flatRate / 100, '1.0-2'),
      },
      apr: {
        label: $localize `:@@payment-santander-uk.credit_rates.rate_details_dialog.apr:`,
        value: this.percentPipe.transform(this.data.rate.interestRate / 100, '1.0-2'),
      },
    };
  }
}
