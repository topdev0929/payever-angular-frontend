import { ChangeDetectionStrategy, Component, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors } from '@angular/forms';
import { isNumber } from 'lodash-es';

import { PeDestroyService } from '@pe/common';

import { ActionTypeEnum, BodyDataInterface } from '../../../../shared';
import { AbstractAction } from '../../../../shared/abstractions/action.abstract';
import { ActionInterface, DetailInterface } from '../../../../shared/interfaces/detail.interface';
import { ShippingLabelInterface } from '../../../../shared/interfaces/shipping-slip.interface';
import { DetailService } from '../../../services/detail.service';
import { PAYMENTS_HAVE_PARTIAL } from '../settings';

@Component({
  selector: 'pe-shipping-goods-transaction',
  templateUrl: './shipping-goods.component.html',
  styleUrls: ['./shipping-goods.component.scss'],
  providers: [
    PeDestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ActionShippingGoodsComponent extends AbstractAction implements OnInit {

  form: FormGroup = null;
  baseUrl = ['business', this.envService.businessId, 'transactions', 'list'];
  amountDisabled = false;
  products: any[] = [];
  isSubmitted = false;
  securityFormControl: FormControl;
  productsDisabled = false;

  private shippingLabelData: ShippingLabelInterface = null;

  constructor(
    public detailService: DetailService,
    public injector: Injector,
    private formBuilder: FormBuilder,
  ) {
    super(injector);
  }

  get amountField(): AbstractControl {
    return this.form.get('amount');
  }

  get refundItems(): AbstractControl {
    return this.form.get('refundItems');
  }

  get otpValueControl(): AbstractControl {
    return this.form.get('otpValue');
  }

  get actionData(): ActionInterface {
    return this.getActionData(ActionTypeEnum.ShippingGoods);
  }

  get refundTotal(): number {
    let total = this.order.transaction.amount_capture_rest;
    if (
      (PAYMENTS_HAVE_PARTIAL.includes(this.order.payment_option.type) || this.actionData?.partialAllowed)
      && isNumber(this.order.transaction.amount_capture_rest_with_partial_cancel)
    ) {
      total = this.order.transaction.amount_capture_rest_with_partial_cancel;
    }

    return total;
  }

  get hasItems(): boolean {
    return !!this.order.cart?.items?.length;
  }

  get hasShippingMethod(): boolean {
    return !!this.order.shipping.method_name;
  }

  ngOnInit(): void {
    this.getData();
  }

  onSubmit(): void {
    this.form.updateValueAndValidity();
    this.isSubmitted = true;

    if (this.form.invalid) {
      return;
    }

    let data: any = {};
    let bodyData: BodyDataInterface = {};
    if (this.amountField.value && !this.refundItems.value.length) {
      data.amount = Number(this.amountField.value.toString().replace(',', '.')).toFixed(2);
    } else if (this.refundItems.value.length) {
      const totalItemsAmount = this.refundItems.value.reduce((acc: number, item: any) => acc += item.price * item.quantity, 0);
      const restAmount = this.order.transaction.amount_capture_rest_with_partial_cancel;

      if (totalItemsAmount > restAmount) {
        data = {
          ...data,
          amount: restAmount,
        };
      } else {
        data.payment_items = [];
        this.refundItems.value.forEach((item) => {
          const { name, price } = this.order.cart.items.find((el) => {
            return el.identifier === item.identifier;
          });
          data.payment_items.push({ name, price, quantity: item.quantity, identifier: item.identifier });
        });
      }
    }

    if (!this.hasShippingMethod) {
      bodyData.shipping_details = {
        ...this.form.get('shippingDetails').value,
        ...this.form.get('returnDetails').value,
      };
    }

    this.sendAction(data, ActionTypeEnum.ShippingGoods, null, false, bodyData);
  }

  getData(reset = false): void {
    this.detailService.getData(this.orderId, reset).subscribe(
      (order: DetailInterface) => {
        this.createForm();

        this.cdr.detectChanges();
      }
    );
  }

  onOpenLabelAction(): void {
    if (this.shippingLabelData) {
      window.open(this.shippingLabelData.label, '__blank');
    }
  }

  onOpenSlipAction(): void {
    this.router.navigate([
      ...this.baseUrl,
      { outlets: { details: ['details', this.orderId, { outlets: { actions: ['download_shipping_slip', this.orderId] } }] } },
    ], {
      queryParamsHandling: 'merge',
      skipLocationChange: true,
    });
  }

  onToggleAmount(checked: boolean): void {
    this.amountField[checked ? 'disable' : 'enable']({
      emitEvent: false,
    });
    this.productsDisabled = checked;

    if (checked) {
      (this.refundItems as FormArray).clear();
      this.form.reset({
        emitEvent: false,
      });
      this.amountField.setValue(checked ? this.refundTotal || 0 : '');
    }
    this.cdr.detectChanges();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      amount: ['', [
        (control: AbstractControl): ValidationErrors | null => {
          const value = Number(control.value.toString().replace(',', '.'));
          const amount = Number.isNaN(value) ? 0 : Number(value);

          return amount < 0 || amount > this?.refundTotal ? {
            invalid: true,
          } : null;
        },
      ]],
      refundItems: this.formBuilder.array([]),
      shippingDetails: this.formBuilder.group({
        trackingNumber: '',
        shippingCarrier: '',
        shippingMethod: '',
        trackingUrl: '',
      }),
      returnDetails: this.formBuilder.group({
        returnTrackingNumber: '',
        returnShippingCarrier: '',
        returnShippingMethod: '',
        returnTrackingUrl: '',
      }),
    });

    this.createProducts();
    this.onToggleAmount(!this.actionData?.partialAllowed);
    this.cdr.detectChanges();
  }

  createProducts(): void {
    const shippedMap = this.order.history.reduce((acc: Record<string, number>, historyItem) => {
      if (historyItem.action === ActionTypeEnum.ShippingGoods) {
        historyItem.refund_items.forEach((item) => {
          const { identifier, quantity } = item;
          acc[identifier] = (acc[identifier] || 0) + quantity;
        });
      }

      return acc;
    }, {});

    this.order.cart?.items?.forEach(
      (item: any) => {
        const shippedQuantity = shippedMap[item.identifier] || 0;
        const remainingQuantity = Math.max(item.quantity - shippedQuantity, 0);

        remainingQuantity > 0 && this.products.push({
          id: item.identifier,
          name: item.name,
          image: item.thumbnail,
          price: item.price,
          currency: this.order.transaction.currency,
          quantity: item.quantity - shippedQuantity,
        });
      }
    );
  }
}
