import { Component, OnInit, ChangeDetectionStrategy, Injector } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';

import { AbstractAction, ActionTypeEnum } from '../../../../shared';

@Component({
  selector: 'pe-invoice-action',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionInvoiceComponent extends AbstractAction implements OnInit {
  form: FormGroup = null;

  get invoiceRest(): number {
    return this.order.transaction.amount_invoice_rest;
  }

  constructor(
    public injector: Injector,
    private formBuilder: FormBuilder
  ) {
    super(injector);
  }

  onSubmit(): void {
    const amount = this.form.get('amount').value.replace(',', '.');
    this.sendAction(
      { amount: Number(amount) },
      ActionTypeEnum.Invoice,
      null,
      false
    );
  }

  ngOnInit(): void {
    this.getData();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      amount: ['', [
        (control: AbstractControl): ValidationErrors | null => {
          const value = Number(control.value.toString().replace(',', '.'));
          const amount = Number.isNaN(value) ? 0 : Number(value);

          return amount <= 0 || amount > this?.invoiceRest ? {
            invalid: true,
          } : null;
        },
      ]],
    });
  }

  amountChanged(event: KeyboardEvent): void {
    if (!`${this.form.get('amount').value}${event.key}`.match(/^(\d+((\.|,)\d{0,2})?)$/g)) {
      event.preventDefault();
    }
  }
}
