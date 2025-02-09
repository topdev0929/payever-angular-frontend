import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  Injector
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Observable, Subject, Subscription, BehaviorSubject, combineLatest, timer } from 'rxjs';
import { delay, filter, takeUntil, map, switchMap, take } from 'rxjs/operators';
import { cloneDeep, forEach, isEqual, map as lodashMap } from 'lodash-es';

import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { MediaUrlPipe } from '@pe/ng-kit/modules/media';

import { FlowStateService, CheckoutSettingsService } from '@pe/checkout-sdk/sdk/api';
import { CartItemInterface, CartItemExInterface, FlowInterface, FlowSettingsInterface } from '@pe/checkout-sdk/sdk/types';
import { ProductInterface, StateService, ProductVariantInterface } from '@pe/checkout-sdk/sdk/products';
import { PluginEventsService } from '@pe/checkout-sdk/sdk/plugins';

import { StateService as OrderInventoryService } from '../../../shared';

type UpdateFlowCallback = (success: boolean) => void;

function mapCart(cart: CartItemInterface[]) {
  return lodashMap(cart, c => {
    return { uuid: c.uuid, quantity: c.quantity };
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ MediaUrlPipe, CurrencyPipe ],
  selector: 'checkout-cart-edit-container',
  templateUrl: './cart-edit-container.component.html',
  styleUrls: ['./cart-edit-container.component.scss']
})
/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
export class CartEditContainerComponent extends AbstractComponent implements OnInit {

  @Input() flowId: string = null;
  @Input() isUseInventory: boolean = false;
  @Input() isProductsRefreshDisabled: boolean = false;
  @Input('submit') set submit(emitter: EventEmitter<void>) {
    if (this.submitSub) this.submitSub.unsubscribe();
    this.submitSub = emitter.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.checkAndUpdateFlow((success: boolean) => this.onSubmitted.emit(success), true);
    });
  }

  @Output() serviceReady: EventEmitter<boolean> = new EventEmitter();
  @Output() onLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() onSubmitted: EventEmitter<boolean> = new EventEmitter();

  flow$: Observable<FlowInterface> = null;
  flowSettings$: Observable<FlowSettingsInterface> = null;

  commonError: string;

  cart$: BehaviorSubject<CartItemExInterface[]> = new BehaviorSubject<CartItemExInterface[]>([]);
  isPreparingData$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  isUpdatingData$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  productsErrors: {[key: string]: string} = {};

  stateService: StateService = this.injector.get(StateService);
  businessShippingOptionId: number = null;
  numberOptions: number[];

  subtotal$: Observable<number> = null;
  taxValue$: Observable<number> = null;
  orderTotal$: Observable<number> = null;
  shippingPrice$: Observable<number> = null;
  isShop$: Observable<boolean> = null;

  private submitSub: Subscription = null;
  private updateCardSubscribtion: Subscription;

  private changeDetectorRef: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  private flowStateService: FlowStateService = this.injector.get(FlowStateService);
  private checkoutSettingsService: CheckoutSettingsService = this.injector.get(CheckoutSettingsService);
  private pluginEventsService: PluginEventsService = this.injector.get(PluginEventsService);
  private translateService: TranslateService = this.injector.get(TranslateService);
  private mediaUrlPipe: MediaUrlPipe = this.injector.get(MediaUrlPipe);
  private orderInventoryService: OrderInventoryService = this.injector.get(OrderInventoryService);

  constructor(private injector: Injector) {
    super();
  }

  get uuid(): string {
    return `uuid-${this.flowId}`;
  }

  checkIsShop(flowSettings: FlowSettingsInterface): boolean {
    return flowSettings && flowSettings.channelType === 'shop';
  }

  ngOnInit(): void {
    this.flow$ = this.flowStateService.getFlowStream$(this.flowId).pipe(filter(d => !!d), takeUntil(this.destroyed$));
    this.flowSettings$ = this.checkoutSettingsService.getSettingsStreamByFlowId$(this.flowId).pipe(filter(d => !!d), takeUntil(this.destroyed$));

    this.subtotal$ = this.flow$.pipe(map(flow => this.orderInventoryService.flowToOrderInfo(flow).subtotal));
    this.taxValue$ = this.flow$.pipe(map(flow => this.orderInventoryService.flowToOrderInfo(flow).taxValue));
    this.orderTotal$ = this.flow$.pipe(map(flow => this.orderInventoryService.flowToOrderInfo(flow).orderTotal));
    this.shippingPrice$ = this.flow$.pipe(map(flow => this.orderInventoryService.flowToOrderInfo(flow).shippingPrice));
    this.isShop$ = this.flowSettings$.pipe(map(settings => this.checkIsShop(settings)));

    this.numberOptions = this.generateNumberOptions();

    let firstRun: boolean = true;
    combineLatest([this.flow$, this.flowSettings$]).pipe(delay(10)).subscribe(([flow, flowSettings]) => {
      const cart: CartItemExInterface[] = flow.cart.filter((item: CartItemInterface) => item.quantity > 0);
      if (!this.isUpdatingData$.value && !this.isPreparingData$.value && (firstRun || !isEqual(mapCart(cart), mapCart(this.cart$.value)))) {
        firstRun = false;
        this.businessShippingOptionId = flow.business_shipping_option_id;
        this.cart$.next(cart);
        this.extendProductsData(flow, flowSettings, cart => {
          this.subtotal$.pipe(take(1)).subscribe(subtotal => {
            let amount: number = 0;
            forEach(cart, item => amount += item.quantity * item.price);
            if (amount !== subtotal) {
              this.checkAndUpdateFlow();
            }
          });
        });
        this.serviceReady.next(true);
      }
    });

    combineLatest([this.isUpdatingData$, this.isPreparingData$]).pipe(takeUntil(this.destroyed$)).subscribe(data => {
      this.onLoading.emit(data[0] || data[1]);
    });
  }

  onCounterValueChange(item: CartItemExInterface, newQty: number): void {
    newQty = Number(newQty);
    if (!this.isPreparingData$.getValue()) {
      this.productsErrors[item.uuid] = null;
      const cart: CartItemExInterface[] = this.cart$.getValue();
      cart.find(d => d.uuid === item.uuid).quantity = newQty;
      this.cart$.next(cart);
      this.checkAndUpdateFlow();
    }
  }

  onShippingChange(id: number): void {
    this.businessShippingOptionId = id;
    this.checkAndUpdateFlow();
  }

  deleteItem(item: CartItemExInterface): void {
    if (!this.isPreparingData$.getValue()) {
      let cart: CartItemExInterface[] = this.cart$.getValue();
      cart = cart.filter(d => d.uuid !== item.uuid);
      this.cart$.next(cart);
      this.checkAndUpdateFlow();
    }
  }

  onSubmit(): void {
    this.checkAndUpdateFlow();
  }

  isURL(str: string): boolean {
    return str && (str.indexOf('http://') === 0 || str.indexOf('https://') === 0);
  }

  private generateNumberOptions(): number[] {
    const result: number[] = [];
    for (let i: number = 0; i <= 1000; i++) {
      result.push(i);
    }
    return result;
  }

  private extendProductsData(flow: FlowInterface, flowSettings: FlowSettingsInterface, callback: (cart: CartItemExInterface[]) => void = null): void {
    const uuids: string[] = flow.cart.map(item => item.uuid);
    if (uuids.length > 0) {
      if (this.isProductsRefreshDisabled) {
        const cart: CartItemExInterface[] = flow.cart;
        this.cart$.next(cart);
        if (callback) callback(cart);
      } else {
        this.isPreparingData$.next(true);
        this.stateService.getProductsOnce(uuids).subscribe((data: ProductInterface[]) => {
          const cart: CartItemExInterface[] = this.stateService.cartItemsToExtended(data, this.cart$.getValue(), flowSettings);
          this.cart$.next(cart);
          this.isPreparingData$.next(false);
          if (callback) callback(cart);
        });
      }
    }
  }

  private checkAndUpdateFlow(callback: UpdateFlowCallback = null, updateOrderReserve: boolean = false): void {

    callback = callback || (() => {});

    this.commonError = null;
    this.isUpdatingData$.next(true);
    this.changeDetectorRef.detectChanges();

    this.cart$.pipe(take(1)).subscribe(cart => {
      let amount: number = 0;
      forEach(cart, item => amount += item.quantity * item.price);
      if (amount < 0) {
        this.commonError = this.translateService.translate('checkout_cart_edit.error.subtotal_must_be_positive');
        this.changeDetectorRef.detectChanges();
      } else {
        const data: FlowInterface = {};
        data.cart = this.cart$.getValue();
        data.business_shipping_option_id = this.businessShippingOptionId;
        data.amount = amount;
        if (this.updateCardSubscribtion) {
          this.updateCardSubscribtion.unsubscribe();
        }
        // We have some time offset for case of fast incrementing number of items
        this.updateCardSubscribtion = timer(200).pipe(switchMap(() => {
          return this.orderInventoryService.patchFlow(this.flowId, data, updateOrderReserve && this.isUseInventory);
        })).subscribe(
          (flow: FlowInterface) => {
            // this.flow = flow;
            this.pluginEventsService.emitCart(this.flowId, flow.cart); // Not sure that it's best place
            this.changeDetectorRef.detectChanges();
            this.isUpdatingData$.next(false);
            callback(true);
          },
          error => {
            console.error(error);
            this.isUpdatingData$.next(false);
            this.handleErrors(error.message, error.failedItems);
            // callback(false);
          }
        );
      }
    });
  }

  private handleErrors(message: string = null, failedItems: string[] = null): void {
    this.productsErrors = {};
    forEach(failedItems || [], id => {
      this.productsErrors[id] = 'Error';
    });
    this.commonError = message || this.translateService.translate('checkout_cart_edit.error.cant_save_order');
    this.changeDetectorRef.detectChanges();
  }
}
