import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PaymentMethodEnum, WidgetConfigInterface } from '@pe/checkout-types';

import { PaymentsViewInterface } from '../../../interfaces';
import { BaseSelectComponent } from '../../base-select.component';

const findConditionByPayment: {
  [key in PaymentMethodEnum]?: (payment: PaymentsViewInterface, item: PaymentsViewInterface) => boolean
} = {
  [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: (payment: PaymentsViewInterface, item: PaymentsViewInterface) => {
    return item.paymentMethod === payment.paymentMethod
      && item.isBNPL === payment.isBNPL
      && String(item.productId || null) === String(payment.productId || null);
  },
};

@Component({
  selector: 'pe-channel-payments-select',
  templateUrl: './channel-payments-select.component.html',
  styleUrls: ['../channel-item.base.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelPaymentsSelectComponent extends BaseSelectComponent implements OnChanges {

  @Input() payments: PaymentsViewInterface[] = [];
  @Input() widgetConfig: WidgetConfigInterface;

  selectedPayment$ = new BehaviorSubject<PaymentsViewInterface>(null)

  @Output() selected = this.selectedPayment$;

  ngOnChanges(changes: SimpleChanges): void {
    const { widgetConfig } = changes;
    if (widgetConfig?.previousValue?.paymentMethod !== widgetConfig?.currentValue?.paymentMethod) {
      const issetSelected = widgetConfig.currentValue?.payments?.find(item => item.paymentMethod === this.selectedPayment$.value?.paymentMethod);
      !issetSelected && this.selectedPayment$.next(null);
    }
  }

  selectPayment(payment: PaymentsViewInterface): void {
    this.selectedPayment$.next(payment);
    this.isOpened$.next(false);
  }

  isPaymentSelected(payment: PaymentsViewInterface): boolean {
    return !!this.getPaymentFromPaymentsArray(payment);
  }

  protected getPaymentFromPaymentsArray(
    payment: PaymentsViewInterface,
    paymentsArray: PaymentsViewInterface[] = this.widgetConfig?.payments || []
  ) {
    return paymentsArray.find((item) => {
      return findConditionByPayment[payment.paymentMethod]
        ? findConditionByPayment[payment.paymentMethod](payment, item)
        : item.paymentMethod === payment.paymentMethod && item.isBNPL === payment.isBNPL;
    });
  }
}
