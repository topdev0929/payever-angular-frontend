import { PercentPipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';

import { FlowInterface, ViewPaymentOption } from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'payment-fee',
  templateUrl: 'payment-fee.component.html',
})
export class PaymentFeeComponent implements OnInit {

  @Input() flow: FlowInterface;

  @Input() option: ViewPaymentOption;

  public feeText: string;

  constructor(
    private currencyPipe: PeCurrencyPipe,
    private percentPipe: PercentPipe,
  ) {}

  ngOnInit(): void {
    this.feeText = this.calculateFee();
  }

  private calculateFee(): string {
    let result: string;
    if (!this.option.acceptFee) {
      const values: string[] = [];
      if (this.option.fixedFee) {
        values.push(this.currencyPipe.transform(this.option.fixedFee, this.flow.currency));
      }
      if (this.option.variableFee) {
        values.push(this.percentPipe.transform(this.option.variableFee / 100.0, '1.0-2'));
      }
      result = values.join(' + ');
    }

    return result;
  }
}
