/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { isNumber } from 'lodash-es';
import { map, startWith, takeUntil, tap } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout-types';
import { PeDestroyService } from '@pe/common';
import { LocaleConstantsService } from '@pe/i18n';

import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import { RefundTypeEnum } from '../../../../shared/enums/refund-type.enum';
import { ActionTypeEnum } from '../../../../shared/interfaces/action.type';
import {
  ActionInterface,
  ActionRequestInterface,
  ActionRequestRefundItemsInterface,
  ItemInterface,
  RefundItemsInterface,
  RefundProductInterface,
} from '../../../../shared/interfaces/detail.interface';
import { DetailsState } from '../../../store';

import { PAYMENTS_HAVE_PARTIAL } from './constant';

@Component({
  selector: 'pe-refund-action',
  templateUrl: './refund.component.html',
  styles: [`
    .hide {
      display: none;
    }
    .second-section {
      display: block;
      margin-top: 12px;
    }
  `],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionRefundTransactionComponent extends AbstractAction implements OnInit {
  @SelectSnapshot(DetailsState.itemsArray) private itemsArray;

  readonly RefundTypeEnum = RefundTypeEnum;

  form: FormGroup = null;
  itemsDeliveryFee = 0;
  products: RefundProductInterface[] = [];
  isOrderReady$ = this.order$.pipe(map(order => !!order));

  isSantanderDeInvoice = false;

  refundAmountLabelData$ = this.order$.pipe(map(order => ({
    amount: this.transform(this.refundTotal, order.transaction.currency),
  })));

  refundErrorMinLimitLabelData$ = this.order$.pipe(map(order => ({
    min: this.transform(0, order.transaction.currency),
    max: this.transform(this.refundTotal, order.transaction.currency),
  })));

  refundTypeLabelData$ = this.order$.pipe(map(order => ({
    amount: this.transform(this.refundFullTotal, order.transaction.currency),
  })));

  private action: ActionTypeEnum = ActionTypeEnum.Refund;

  constructor(
    private formBuilder: FormBuilder,
    private localeConstantsService: LocaleConstantsService,
    private currencyPipe: CurrencyPipe,
    public injector: Injector
  ) {
    super(injector);
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  get hideProductPicker(): boolean {
    return !(this.order.cart.available_refund_items?.length > 0 && this.form.get('type').value === RefundTypeEnum.Items);
  }

  get refundGoodsReturned(): AbstractControl {
    return this.form.get('refundInvoiceNumber');
  }

  get refundInvoiceNumber(): AbstractControl {
    return this.form.get('refundInvoiceNumber');
  }

  get refundDeliveryFee(): AbstractControl {
    return this.form.get('refundDeliveryFee');
  }

  get deliveryFee(): number {
    const delivery_fee = this.order.transaction?.delivery_fee_left ?? this.order.shipping.delivery_fee;

    return Number.isNaN(delivery_fee) ? 0 : Number(delivery_fee);
  }

  get isShowSecondSection(): boolean {
    return this.deliveryFee !== 0
      || !this.isFeeRefunded
      || this.order._isSantanderDe;
  }

  get isFeeRefunded(): boolean {
    return this.order.transaction.amount_refunded >= +this.order.payment_option.payment_fee;
  };

  ngOnInit(): void {
    this.getData();
  }

  transform(value, code): string {
    return this.currencyPipe.transform(value, code, 'symbol', null, this.locale);
  }

  onKeyPress(e: KeyboardEvent): void {
    if (!`${this.form.get('amount').value}${e.key}`.match(/^(\d+((\.|,)\d{0,2})?)$/g)) {
      e.preventDefault();
    }
  }

  onSubmit(): void {
    if (this.isLoading$.value) {
      // To prevent double submit
      return;
    }
    this.form.updateValueAndValidity();

    if (this.form.invalid) {
      console.error('Form is invalid!');

      return;
    }
    const data: ActionRequestInterface = { amount: this.amountValue };
    const itemsRestocked: boolean = this.itemsRestockedValue;
    const reason: string = this.form.get('reason').value;
    const refundItemsArr: ActionRequestRefundItemsInterface[] = this.form.get('refundItems') ? this.form.get('refundItems').value : [];
    if (itemsRestocked) {
      data.itemsRestocked = true;
    }
    if (reason) {
      data.reason = reason;
    }
    if (refundItemsArr?.length > 0 && this.form.get('type').value === RefundTypeEnum.Items) {
      const refundItems: ActionRequestRefundItemsInterface[] = [];
      refundItemsArr.forEach((restockItem: ActionRequestRefundItemsInterface) => {
        if (restockItem.quantity > 0) {
          refundItems.push(restockItem);
        }
      });
      if (refundItems.length > 0) {
        data.payment_items = refundItems;
      }
    }
    if (this.order._isSantanderDe) {
      data.refundGoodsReturned = this.form.get('refundGoodsReturned').value;
      data.refundInvoiceNumber = this.form.get('refundInvoiceNumber').value;
    }

    if (this.refundDeliveryFee.value) {
      data.delivery_fee = this.deliveryFee;
    }

    this.sendAction(data, this.action, null, false);
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      amount: [{ value: '', disabled: true }, [
        (control: AbstractControl): ValidationErrors | null => {
          const value = this.parseAmount(control.value);
          const amount = Number.isNaN(value) ? 0 : Number(value);

          return amount < 0 || amount > this.refundTotal ? {
            invalid: true,
          } : null;
        },
      ]],
      itemsRestocked: true,
      reason: '',
      refundItems: [],
      refundDeliveryFee: false,
      refundPaymentFee: this.order.payment_option.fee_accepted,
      type: RefundTypeEnum.Full,
      refundGoodsReturned: { value: false, disabled: true },
      refundInvoiceNumber: { value: '', disabled: true },
    });

    this.isSantanderDeInvoice = this.order.payment_option.type === PaymentMethodEnum.SANTANDER_INVOICE_DE;

    this.form.get('type').valueChanges.pipe(
      startWith(this.form.get('type').value),
      tap((value: RefundTypeEnum) => {
        this.form.patchValue({ refundDeliveryFee: value === RefundTypeEnum.Full });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.prepareRefundItems();
    this.checkFieldsLogic();

    this.cdr.detectChanges();
  }

  private prepareRefundItems(): void {
    if (this.order.cart.available_refund_items.length > 0) {
      this.order.cart.available_refund_items.forEach(
        (item: RefundItemsInterface, index: number) => {
          const product: ItemInterface = this.itemsArray[this.order.cart.available_refund_items[index].identifier];
          this.products.push({
            id: item.identifier,
            name: product.name,
            image: product.thumbnail,
            price: product.price,
            currency: this.order.transaction.currency,
            quantity: item.count,
          });
        }
      );
      const refundItemsFormArray: FormArray = this.formBuilder.array([]);
      this.form.setControl('refundItems', refundItemsFormArray);
    }
  }

  private checkFieldsLogic(): void {
    if (this.order._isSantanderDe) {
      this.form.get('refundGoodsReturned').enable();
      this.form.get('refundInvoiceNumber').enable();
    }

    this.form.get('type').valueChanges.pipe(
      tap((value) => {
        this.form.get('amount').setValue(value === RefundTypeEnum.Full ? String(this.amountValue) : '');
        value === RefundTypeEnum.Partial ? this.form.get('amount').enable() : this.form.get('amount').disable();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  get refundTotal(): number {
    const partial_refund_rest = this.order.transaction.amount_refund_rest_with_partial_capture;

    return (PAYMENTS_HAVE_PARTIAL.includes(this.order.payment_option.type) || this.actionData?.partialAllowed)
      && partial_refund_rest && isNumber(partial_refund_rest)
      ? this.order.transaction.amount_refund_rest_with_partial_capture
      : this.order.transaction.amount_refund_rest;
  }

  get actionData(): ActionInterface {
    return this.getActionData(ActionTypeEnum.Refund);
  }

  get refundFullTotal(): number {
    return this.refundTotal + this.deliveryFee;
  }

  get paymentFee(): number {
    return Number.isNaN(this.order.payment_option.payment_fee) ? 0 : Number(this.order.payment_option.payment_fee);
  }

  get refundItems(): FormArray {
    return this.form.get('refundItems') as FormArray;
  }

  get amountValue(): number {
    let result = this.refundTotal;

    if (this.form.get('type').value === RefundTypeEnum.Full) {
      result = this.refundFullTotal;
      if (this.paymentFee) {
        result += this.paymentFee;
      }

      return +Number(result).toFixed(2);
    }

    if (this.form.get('type').value === RefundTypeEnum.Items) {
      result = this.calcAmountFromProducts();
    } else if (this.form.get('type').value === RefundTypeEnum.Partial) {
      result = this.parseAmount(this.form.get('amount')?.value);
    }

    if (this.form.get('type').value !== RefundTypeEnum.Items) {
      if (this.refundDeliveryFee.value) {
        result += this.deliveryFee;
      }

      if (this.form.get('refundPaymentFee').value) {
        result += this.paymentFee;
      }
    }

    return +result.toFixed(2);
  }

  get itemsRestockedValue(): boolean {
    return this.isItemsRestockedEnabled ? Boolean(this.form.get('itemsRestocked')?.value) : false;
  }

  get isItemsRestockedEnabled(): boolean {
    return this.form.get('type')?.value !== RefundTypeEnum.Partial && this.order.cart.items.length > 0;
  }

  private parseAmount(val: string): number {
    return Number(val.replace(',', '.'));
  }

  private getItemsDeliveryFee(): number {
    let deliveryFee = 0;
    if (this.deliveryFee > 0) {
      deliveryFee = this.calcDeliveryFee();
    }
    this.itemsDeliveryFee = deliveryFee;

    return deliveryFee;
  }

  private calcAmountFromProducts(): number {
    let amount = 0;
    this.refundItems.controls.forEach(
      (formRestockItem: FormGroup) => {
        const value = Number(formRestockItem.get('quantity')?.value);
        const identifier = formRestockItem.get('identifier')?.value;
        amount += value * Number(this.itemsArray[identifier].price);
      }
    );
    amount += this.form.get('refundDeliveryFee')?.value ? this.getItemsDeliveryFee() : 0;
    amount += this.form.get('refundPaymentFee')?.value ? this.paymentFee : 0;

    return +amount.toFixed(2);
  }

  private calcDeliveryFee(): number {
    return parseFloat(`${this.deliveryFee}`);
  }
}
