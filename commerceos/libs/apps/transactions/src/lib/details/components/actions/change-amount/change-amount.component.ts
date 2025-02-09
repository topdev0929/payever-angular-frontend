import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';

import { PaymentMethodEnum } from '@pe/checkout-types';

import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import { ActionTypeEnum } from '../../../../shared/interfaces/action.type';
import { ActionRequestInterface } from '../../../../shared/interfaces/detail.interface';

const INCREASE_AMOUNT_DISABLED: PaymentMethodEnum[] = [
  PaymentMethodEnum.SANTANDER_POS_INVOICE_DE,
  PaymentMethodEnum.SANTANDER_POS_FACTORING_DE,
];

@Component({
  selector: 'pe-change-amount-action',
  templateUrl: './change-amount.component.html',
  styleUrls: ['../actions.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionChangeAmountComponent extends AbstractAction implements OnInit{
  currencySymbol = '';
  form: FormGroup = null;

  private initialAmount: number = null;

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.getData();
  }

  change(): void {
    return;
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      return;
    }

    const data: ActionRequestInterface = {
      amount: this.form.get('amount').value,
    };

    this.sendAction(data, ActionTypeEnum.Edit, null, false);
  }

  createForm(): void {
    this.initialAmount = Number(this.order.transaction.amount);

    this.form = this.formBuilder.group({
      amount: [this.order.transaction.amount, [
        (control: AbstractControl): ValidationErrors | null => {
          const amount = control.value;

          if (String(amount) === '' || amount <= 0) {
            return {
              message: this.translateService.translate('transactions.form.change_amount.errors.must_be_positibe_number'),
            };
          }
          if (INCREASE_AMOUNT_DISABLED.includes(this.order.payment_option.type) && this.initialAmount && amount >= this.initialAmount) {
            return {
              message: this.translateService.translate('transactions.form.change_amount.errors.must_be_less_than', {
                amount: this.initialAmount,
              }),
            };
          }
        },
      ]],
    });
  }
}
