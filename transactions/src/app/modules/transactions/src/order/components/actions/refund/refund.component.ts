import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { range } from 'lodash-es';

import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { WindowService } from '@pe/ng-kit/modules/window';

import {
  ActionRequestRefundItemsInterface,
  ActionRequestInterface,
  DetailInterface,
  ItemInterface,
  RefundItemsInterface,
  RefundItemInterface,
  ActionType
} from '../../../../shared';
import { DetailService } from '../../../services';

enum RefundTypeEnum {'full', 'partial', 'items'}
enum ItemShippingTypeEnum {'general', 'fixed', 'free'}
enum OrderShippingRateTypeEnum {'item', 'order'}

@Component({
  selector: 'or-action-refund',
  templateUrl: 'refund.component.html',
  styleUrls: ['./refund.component.scss'],
  providers: [CurrencyPipe],
  host: {class: 'transactions-valigned-modal'}
})
export class ActionRefundComponent implements OnDestroy, OnInit {

  loading: boolean = false;

  modalButtons: any[] = [{
    onClick: () => this.onSubmit()
  }];

  isMobile: boolean = false;
  error: string = null;
  itemsDeliveryFee: number = 0;
  form: FormGroup = null;
  types: RefundTypeEnum[] = [RefundTypeEnum.full, RefundTypeEnum.partial, RefundTypeEnum.items];

  close$: Subject<void> = new Subject<void>();

  order: DetailInterface = null;

  private action: ActionType = null;
  private orderId: string;
  private businessUuid: string;
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);

  private previousAmount: number | string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private detailService: DetailService,
    private formBuilder: FormBuilder,
    private peWindowService: WindowService,
    private translateService: TranslateService,
    private currencyPipe: CurrencyPipe
  ) {}

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  ngOnInit(): void {
    this.action = this.activatedRoute.snapshot.data['action'];
    this.orderId = this.activatedRoute.snapshot.params['orderId'];
    this.businessUuid = this.activatedRoute.snapshot.params['uuid'];

    this.peWindowService.isMobile$.pipe(
      takeUntil(this.destroyed$))
      .subscribe((isMobile: boolean) => this.isMobile = isMobile);

    this.getData();
  }

  onSubmit(): void {
    this.loading = true;
    this.error = null;
    const data: ActionRequestInterface = { amount: this.form.get('amount').value };
    const itemsRestocked: boolean = this.form.get('itemsRestocked').value;
    const reason: string = this.form.get('reason').value;
    const refundItemsArr: ActionRequestRefundItemsInterface[] = this.form.get('refundItems') ? this.form.get('refundItems').value : [];
    if ( itemsRestocked ) {
      data.itemsRestocked = true;
    }
    if ( reason ) {
      data.reason = reason;
    }
    if ( refundItemsArr.length > 0 ) {
      const refundItems: ActionRequestRefundItemsInterface[] = [];
      refundItemsArr.forEach((restockItem: ActionRequestRefundItemsInterface) => {
        if ( restockItem.count > 0 ) {
          refundItems.push(restockItem);
        }
      });
      if ( refundItems.length > 0 ) {
        data.refundItems = refundItems;
      }
    }
    if ( this.order._isSantanderDe ) {
      data.refundCollectedBySepa = this.form.get('refundCollectedBySepa').value;
      data.refundGoodsReturned = this.form.get('refundGoodsReturned').value;
      data.refundInvoiceNumber = this.form.get('refundInvoiceNumber').value;
    }
    this.detailService.actionOrder(this.orderId, data, this.action, 'payment_return', false, this.order.payment_option.type).subscribe(
      () => this.close$.next(),
      (errors: Response) => {
        this.loading = false;
      }
    );
  }

  get amountValue(): number {
    const amount: string = this.form.get('amount').value;
    return amount !== '' ? +amount : 0;
  }

  get deliveryFee(): number {
    return +this.order.shipping.delivery_fee || 0;
  }

  get itemsSubtotal(): number {
    let subtotal: number = 0;
    this.order.cart.available_refund_items.forEach((item: RefundItemsInterface, index: number) => subtotal += this.getItemSubtotal(index));
    return subtotal;
  }

  get refundTotal(): number {
    let total: number = +this.order.transaction.total || 0;
    if ( this.paymentFee > 0 ) {
      total -= this.form.get('refundPaymentFee').value ? 0 : this.paymentFee;
    }
    if ( this.order.transaction.amount_refunded ) {
      total -= this.order.transaction.amount_refunded;
    }
    return total;
  }

  get refundItems(): FormArray {
    return this.form.get('refundItems') as FormArray;
  }

  get paymentFee(): number {
    return +this.order.payment_option.payment_fee || 0;
  }

  getCountArray(quantity: string | number): number[] {
    return range(0, (+quantity + 1));
  }

  swapButtons(): void {
    if (this.itemsSubtotal) {
      this.modalButtons[0].title = this.translateService.translate('form.refund.actions.refund', {
        amount: this.currencyPipe.transform(this.amountValue, this.order.transaction.currency, true, '1.2-2')
      });
      this.modalButtons[0].disabled = false;
    } else {
      this.modalButtons[0].disabled = true;
    }
    this.modalButtons = this.modalButtons.slice();
  }

  getItemSubtotal(index: number): number {
    const item: ItemInterface = this.order._itemsArray[this.order.cart.available_refund_items[index].item_uuid];
    return (+this.refundItems.controls[index].get('count').value) * (+item.price);
  }

  /*
   *  Calculate Delivery fee for refund method.
   *
   *  Copy+paste of backend function `calcShippingFeeForCart` of method Payever\ShippingBundle\ShippingMethods\FlatRateShippingMethod.
   *  In case bugs check backend function `calcShippingFeeForCart` for changes first.
   *
   *  @return number
   */
  private getItemsDeliveryFee(): number {
    let deliveryFee: number = 0;
    if ( this.deliveryFee > 0 ) {
      deliveryFee = this.calcDeliveryFee();
    }
    this.itemsDeliveryFee = deliveryFee;
    return deliveryFee;
  }

  private calcDeliveryFee(): number {
    /*
    let fee: number = 0;
    let isOrderCalculated: boolean = false;
    const rate: number = +this.order.shipping_option.settings.options.rate;
    const rateType: string = this.order.shipping_option.settings.options.rateType;
    const shippingTypeFixed: string = ItemShippingTypeEnum[ItemShippingTypeEnum.fixed];
    const shippingTypeGeneral: string = ItemShippingTypeEnum[ItemShippingTypeEnum.general];
    const shippingRateTypeItem: string = OrderShippingRateTypeEnum[OrderShippingRateTypeEnum.item];
    const shippingRateTypeOrder: string = OrderShippingRateTypeEnum[OrderShippingRateTypeEnum.order];
    this.refundItems.controls.forEach((formGroup: FormGroup, index: number) => {
      const item: ItemInterface = this.order._itemsArray[this.order.cart.available_refund_items[index].item_uuid];
      if (item.is_physical) {
        if ( item.shipping_type === shippingTypeFixed ) {
          fee += (+formGroup.get('count').value) * item.fixed_shipping_price;
        }
        else if ( item.shipping_type === shippingTypeGeneral ) {
          if ( rateType === shippingRateTypeItem ) {
            fee += (+formGroup.get('count').value) * rate;
          }
          else if ( rateType === shippingRateTypeOrder && !isOrderCalculated ) {
            fee += rate;
            isOrderCalculated = true;
          }
        }
      }
    });
    return fee;*/
    return parseFloat(`${this.order.shipping.delivery_fee}`);
  }

  private getData(): void {
    this.detailService.getData(this.businessUuid, this.orderId).subscribe(
      (order: DetailInterface): void => {
        this.order = order;
        this.createForm();
      }
    );
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      amount: '',
      itemsRestocked: true,
      reason: '',
      refundDeliveryFee: true,
      refundPaymentFee: this.order.payment_option.fee_accepted,
      type: ''
    });
    if ( this.order.cart.available_refund_items.length > 0 ) {
      const refundItemsFormGroup: FormGroup[] = this.order.cart.available_refund_items.map(
        (item: RefundItemsInterface) => this.formBuilder.group({
          paymentItemId: item.item_uuid,
          count: 0
        })
      );
      const refundItemsFormArray: FormArray = this.formBuilder.array(refundItemsFormGroup);
      this.form.setControl('refundItems', refundItemsFormArray);
    }
    if ( this.order._isSantanderDe ) {
      this.form.addControl('refundCollectedBySepa', this.formBuilder.control(false));
      this.form.addControl('refundGoodsReturned', this.formBuilder.control(false));
      this.form.addControl('refundInvoiceNumber', this.formBuilder.control(''));
    }
    this.setFormListeners();
    this.form.get('type').setValue(RefundTypeEnum.full.toString());
  }

  private setFormListeners(): void {
    this.form.get('amount').valueChanges.subscribe((amount: string | number) => {
      if (this.previousAmount !== amount) {
        this.onChangeAmount();
      }
      this.previousAmount = amount;
    });
    this.form.get('refundDeliveryFee').valueChanges.subscribe(() => this.onChangeRefundDeliveryFee());
    this.form.get('refundPaymentFee').valueChanges.subscribe(() => this.onChangeRefundPaymentFee());
    this.form.get('type').valueChanges.subscribe((type: string) => this.onChangeType(+type));
    if ( this.order.cart.available_refund_items.length > 0 ) {
      this.refundItems.controls.forEach((restockItem: FormGroup) => {
        restockItem.get('count').valueChanges.subscribe(() => this.onChangeCount());
      });
    }
  }

  private onChangeAmount(): void {
    const amount: number = this.amountValue;
    if ( +amount > this.refundTotal ) {
      this.form.get('amount').setValue(this.refundTotal);
      return;
    }
    else if ( +amount < 0 ) {
      this.form.get('amount').setValue(0);
      return;
    }
    this.modalButtons[0].title = this.translateService.translate('form.refund.actions.refund', {
      amount: this.currencyPipe.transform(amount, this.order.transaction.currency, true, '1.2-2')
    });
    this.modalButtons[0].disabled = !Boolean(amount);
    this.modalButtons = this.modalButtons.slice();
  }

  private onChangeRefundDeliveryFee(): void {
    switch ( +this.form.get('type').value ) {
      case RefundTypeEnum.full:
        this.form.get('amount').setValue(this.refundTotal);
        break;
      case RefundTypeEnum.items:
        this.onChangeCount();
        break;
      default:
        break;
    }
  }

  private onChangeRefundPaymentFee(): void {
    switch ( +this.form.get('type').value ) {
      case RefundTypeEnum.full:
        this.form.get('amount').setValue(this.refundTotal);
        break;
      case RefundTypeEnum.items:
        this.onChangeCount();
        break;
      default:
        break;
    }
  }

  private onChangeType(type: number): void {
    this.form.get('itemsRestocked').setValue(true);
    switch ( type ) {
      case RefundTypeEnum.full:
        this.form.get('amount').setValue(this.refundTotal);
        break;
      case RefundTypeEnum.items:
        this.onChangeCount(true);
        break;
      default:
        this.form.get('itemsRestocked').setValue(false);
        this.form.get('amount').setValue('');
    }
  }

  private onChangeCount(reset: boolean = false): void {
    let amount: number = 0;
    const items: RefundItemInterface[] = this.order.cart.available_refund_items;
    this.refundItems.controls.forEach(
      (formRestockItem: FormGroup, index: number) => {
        if ( reset ) {
          formRestockItem.get('count').setValue(0);
        }
        else {
          const value: number = +formRestockItem.get('count').value;
          amount += value * (+this.order._itemsArray[items[index].item_uuid].price);
        }
      }
    );
    amount += this.form.get('refundDeliveryFee').value ? this.getItemsDeliveryFee() : 0;
    amount += this.form.get('refundPaymentFee').value ? this.paymentFee : 0;
    this.form.get('amount').setValue(amount);
  }

  // private showValidationErrors(errors: ErrorsFormInterface): void {
  //   if (errors.code >= 500) {
  //     this.error = errors.message;
  //   }
  //   if ( errors.errors && errors.errors.children && errors.errors.children['refundInvoiceNumber'] && errors.errors.children['refundInvoiceNumber'].errors ) {
  //     this.form.controls['refundInvoiceNumber'].setErrors(errors.errors.children['refundInvoiceNumber'].errors);
  //   }
  //   if (errors.errors && errors.errors.errors && errors.errors.errors instanceof Array) {
  //     this.error = errors.errors.errors.join(', ');
  //   }
  //   this.modalService.loading = false;
  // }

}
