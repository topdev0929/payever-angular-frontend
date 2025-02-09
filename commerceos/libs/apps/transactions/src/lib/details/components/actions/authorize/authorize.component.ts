/* eslint-disable no-underscore-dangle */
import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';

import { PaymentMethodEnum } from '@pe/checkout-types';
import { PeDateTimePickerService } from '@pe/ui';

import { AbstractAction, ActionTypeEnum, DetailInterface, paymentsHaveAuthorizeAllowed } from '../../../../shared';

@Component({
  selector: 'pe-authorize-action',
  templateUrl: './authorize.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionAuthorizeComponent extends AbstractAction implements OnInit {
  form: FormGroup = null;
  doneBtnTitle = this.translateService.translate('transactions.form.invoice.actions.transfer');

  get isSwedbank(): boolean {
    return [
      PaymentMethodEnum.SWEDBANK_CREDITCARD,
      PaymentMethodEnum.SWEDBANK_INVOICE,
    ].includes(this.order.payment_option.type);
  }

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder,
    private dateTimePicker: PeDateTimePickerService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getData();
  }

  onSubmit(): void {
    const dataKey: string = paymentsHaveAuthorizeAllowed.indexOf(this.order?.payment_option?.type) >= 0 ? 'payment_authorize' : 'transfer';

    this.sendAction(
      this.form.value,
      ActionTypeEnum.Authorize,
      dataKey,
      false
    );
  }

  getData(reset = false): void {
    this.detailService.getData(this.orderId, reset).subscribe(
      (order: DetailInterface): void => {
        this.createForm();
      }
    );
  }

  createForm(): void {
    if (this.isSwedbank) {
      this.form = this.formBuilder.group({});
    } else {
      this.form = this.formBuilder.group({
        invoiceDate: moment().format('MM/DD/YYYY'),
        invoiceId: this.orderId,
        customerId: this.order.customer.email,
      });
    }
  }

  onOpenDatepicker(event: MouseEvent): void {
    const dialogRef = this.dateTimePicker.open(event);
    dialogRef.afterClosed.subscribe((date) => {
      this.form.get('invoiceDate').setValue(moment(date.start).format('MM/DD/YYYY'), { emitEvent: false });
    });
  }
}
