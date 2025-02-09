import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { FlowState, SettingsState } from '@pe/checkout/store';
import { FlowInterface, CheckoutSettingsInterface, PaymentOptionInterface } from '@pe/checkout/types';
import { roundValue } from '@pe/checkout/utils/round';
import { PeDestroyService } from '@pe/destroy';

import { DISABLED_PAYMENT_COST_FOR_COUNTRY } from '../../settings';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe, PeDestroyService],
  selector: 'checkout-order-summary-container',
  templateUrl: './order-summary-container.component.html',
  styleUrls: ['./order-summary-container.component.scss'],
})
/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
export class OrderSummaryContainerComponent implements OnInit {

  @Select(FlowState.flow) flow$: Observable<FlowInterface>;

  @Select(SettingsState.settings) settings$: Observable<CheckoutSettingsInterface>;

  @Input('total') set setTotal(total: number) {
    this.total$.next(total);
  }

  @Input('downPayment') set setDownPayment(downPayment: number) {
    this.downPayment$.next(downPayment ?? 0);
  }

  @Output() serviceReady: EventEmitter<boolean> = new EventEmitter();

  flowId: string = null;

  total$ = new BehaviorSubject<number>(null);
  downPayment$ = new BehaviorSubject<number>(null);

  totalWithFee$: Observable<number> = null;
  deliveryFee$: Observable<number> = null;
  subtotalOriginal$: Observable<number> = null;
  discount$: Observable<number> = null;
  paymentCosts$: Observable<number> = null;
  isShop$: Observable<boolean> = null;
  showPaymentCost$: Observable<boolean> = null;

  constructor(
    public cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
  ) {
    this.initFlow();
  }

  ngOnInit(): void {
    this.serviceReady.next(true);
  }

  initFlow(): void {
    this.showPaymentCost$ = this.flow$.pipe(
      filter(d => !!d),
      map(flow => !DISABLED_PAYMENT_COST_FOR_COUNTRY.includes(flow.businessCountry)
    ));

    this.isShop$ = this.settings$.pipe(
      filter(d => !!d),
      takeUntil(this.destroy$),
      map(settings => settings && settings.channelType === 'shop')
    );

    this.totalWithFee$ = this.flow$.pipe(map((flow) => {
      const option = flow.paymentOptions.find(o => o.connections.find(c => c.id === flow.connectionId));
      let totalWithFee = flow.total;
      if (option) {
        totalWithFee += this.isWithoutFee(option, flow) ? 0 : this.totalFee(option, flow);
      }

      return roundValue(totalWithFee || 0) ;
    }));

    this.deliveryFee$ = this.flow$.pipe(map(flow => roundValue(flow.deliveryFee ?? 0)));

    this.subtotalOriginal$ = combineLatest([
      this.flow$,
      this.downPayment$,
    ]).pipe(map(([flow, downPayment]) => {
      let subtotal: number = flow.amount;
      if (flow.cart?.length) {
        subtotal = 0;
        (flow.cart || []).forEach(item => subtotal += item.quantity * (item.originalPrice ?? item.price));
      }
      subtotal -= downPayment || 0;

      return roundValue(subtotal) || 0;
    }));

    this.discount$ = this.flow$.pipe(map((flow) => {
      let subtotal1: number = flow.amount;
      let subtotal2: number = flow.amount;
      if (flow.cart?.length) {
        subtotal1 = 0;
        subtotal2 = 0;
        (flow.cart || []).forEach(item => subtotal1 += item.quantity * (item.price ?? item.originalPrice));
        (flow.cart || []).forEach(item => subtotal2 += item.quantity * (item.originalPrice ?? item.price));
      }

      return roundValue((subtotal2 || 0) - (subtotal1 || 0));
    }));

    this.paymentCosts$ = combineLatest([
      this.total$,
      this.downPayment$,
      this.totalWithFee$,
      this.deliveryFee$,
      this.subtotalOriginal$,
      this.discount$,
    ]).pipe(
      map(([total, downPayment, totalWithFee, deliveryFee, subtotalOriginal, discount]) =>
        Math.abs(roundValue(
          (total
            ? (total - downPayment)
            : totalWithFee)
          - (subtotalOriginal - discount) - deliveryFee)),
      ),
    );
  }

  isWithoutFee(option: PaymentOptionInterface, flow: FlowInterface) {
    const merchantCoversFee = option.connections.find(c => c.id === flow.connectionId).merchantCoversFee;

    return option.acceptFee || merchantCoversFee;
  }

  totalFee(option: PaymentOptionInterface, flow: FlowInterface): number {
    return roundValue(option.fixedFee + 0.01 * option.variableFee * flow.total);
  }
}
