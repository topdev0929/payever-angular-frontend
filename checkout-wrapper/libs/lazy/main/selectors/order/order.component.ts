import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map, take, takeUntil, withLatestFrom } from 'rxjs/operators';

import { AbstractFlowIdComponent } from '@pe/checkout/core';
import { HideSteps, OpenNextStep, ParamsState } from '@pe/checkout/store';
import { FlowInterface, PaymentMethodEnum, SectionType } from '@pe/checkout/types';

import { ENABLE_PRODUCTS_FOR_COUNTRY } from './settings';


enum SelectedEnum {
  AmountOrCart = 'amountOrCart',
  QR = 'qr',
  Products = 'products',
}

interface SwitcherItemInterface {
  title: string;
  type: SelectedEnum;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-order',
  styleUrls: ['./order.component.scss'],
  templateUrl: 'order.component.html',
})
export class OrderComponent extends AbstractFlowIdComponent {

  @Input() forceHideQRSwitcher = false;
  @Input() navigateOnSuccess = true;
  @Input() referenceEditEnabled = true;
  @Output() submitSuccess: EventEmitter<FlowInterface> = new EventEmitter();

  productsPaymentMethod: PaymentMethodEnum;

  isOrderHasCart$: Observable<boolean> = null;
  isOrderHasProducts$: Observable<boolean> = null;
  allowEditReference$: Observable<boolean> = null;

  selected: SelectedEnum = SelectedEnum.QR;
  switcherItems$: Observable<SwitcherItemInterface[]> = null;
  readonly SelectedEnum: typeof SelectedEnum = SelectedEnum;
  readonly EnableProducts = ENABLE_PRODUCTS_FOR_COUNTRY;

  get submitText(): string {
    return this.submitSuccess.observers.length
      ? $localize `:@@action.save:`
      : $localize `:@@action.continue:`;
  }

  isShowQRSwitcher(): boolean {
    const { showQRSwitcher } = this.store.selectSnapshot(ParamsState.params);

    return showQRSwitcher && !this.forceHideQRSwitcher;
  }

  trackByFn(index: number): number {
    return index;
  }

  initFlow(): void {
    super.initFlow();
    this.allowEditReference$ = this.pickParam$(
      this.destroy$,
      params => params.editMode || this.referenceEditEnabled,
    );

    this.isOrderHasProducts$ = combineLatest([
      this.params$,
      this.flow$,
    ]).pipe(
      map(([{ showCreateCart, showQRSwitcher, merchantMode }, flow]) => {
        const businessCountry = flow.businessCountry;
        const productsData = this.EnableProducts.find(item => item.businessCountry === businessCountry);
        const payment = flow.paymentOptions.find(paymentOption =>
          productsData?.paymentMethods.includes(paymentOption.paymentMethod)
        );

        if (payment) {
          this.productsPaymentMethod = payment.paymentMethod;
        }

        return productsData && showCreateCart && showQRSwitcher && merchantMode;
      }),
      takeUntil(this.destroy$),
    );

    this.isOrderHasCart$ = combineLatest([
      this.params$,
      this.flow$,
    ]).pipe(takeUntil(this.destroy$), map(([{ forceUseCard }, flow]) => (flow?.cart?.length > 0) || forceUseCard));

    this.switcherItems$ = this.isOrderHasCart$.pipe(
      withLatestFrom(this.isOrderHasProducts$),
      map(([isOrderHasCart, isOrderHasProducts]) => {
        const items = [
          {
            title: isOrderHasCart && !isOrderHasProducts
              ? $localize`:@@order.switcher.cart:`
              : $localize`:@@order.switcher.amount:`,
            type: SelectedEnum.AmountOrCart,
          },
          { title: $localize`:@@order.switcher.qr:`, type: SelectedEnum.QR },

        ];

        if (isOrderHasProducts) {
          items.push({ title: $localize`:@@order.switcher.create_cart:`, type: SelectedEnum.Products });
        }

        return items;
      })
    );
  }

  onSuccess(flow: FlowInterface): void {
    this.submitSuccess.next(flow);
    if (this.navigateOnSuccess) {
      this.store.dispatch(new OpenNextStep());
      this.isOrderHasCart$.pipe(take(1)).subscribe((isOrderHasCart) => {
        if (!isOrderHasCart) {
          this.store.dispatch(new HideSteps([SectionType.Shipping]));
        }
      });
    }
  }
}
