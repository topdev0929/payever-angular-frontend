import { CurrencyPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Input,
  Output,
  OnInit,
  Injector,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import {
  Observable,
  BehaviorSubject,
  combineLatest,
  Subject,
  EMPTY,
} from 'rxjs';
import {
  delay,
  filter,
  takeUntil,
  map,
  switchMap,
  take,
  debounceTime,
  tap,
  catchError,
} from 'rxjs/operators';

import { PluginEventsService } from '@pe/checkout/plugins';
import { ProductInterface, ProductsStateService as StateService } from '@pe/checkout/products';
import { FlowState, SettingsState } from '@pe/checkout/store';
import { CartItemInterface, CartItemExInterface, FlowInterface, CheckoutSettingsInterface } from '@pe/checkout/types';
import { CustomElementService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { StateService as OrderInventoryService } from '../../services';

type UpdateFlowCallback = (success: boolean) => void;


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CurrencyPipe, PeDestroyService],
  selector: 'checkout-cart-edit-container',
  templateUrl: './cart-edit-container.component.html',
  styleUrls: ['./cart-edit-container.component.scss'],
})
/**
 * This is basically our root level container component. We cannot use root
 * element for 'container' role, because it mostly works as a bootstrap component
 */
export class CartEditContainerComponent implements OnInit {

  @Select(FlowState.flow) flow$: Observable<FlowInterface>;

  @Select(SettingsState.settings) settings$ : Observable<CheckoutSettingsInterface>;

  @Input() flowId: string = null;
  @Input() isUseInventory = false;
  @Input() isProductsRefreshDisabled = false;

  @Output() serviceReady: EventEmitter<boolean> = new EventEmitter();
  @Output() onLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() onSubmitted: EventEmitter<boolean> = new EventEmitter();
  @Output() globalLoading: EventEmitter<boolean> = new EventEmitter();

  flowSettings$: Observable<CheckoutSettingsInterface> = null;

  tableDescriptionText = $localize `:@@checkout_cart_edit.table.description:`;
  commonError: string;

  cart$: BehaviorSubject<CartItemExInterface[]> = new BehaviorSubject<CartItemExInterface[]>([]);
  isPreparingData$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isUpdatingData$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  productsErrors: {[key: string]: string} = {};

  stateService: StateService = this.injector.get(StateService);
  numberOptions: number[];

  subtotalOriginal$: Observable<number> = null;
  subtotalWithDiscount$: Observable<number> = null;
  discount$: Observable<number> = null;
  taxValue$: Observable<number> = null;
  orderTotal$: Observable<number> = null;
  isShop$: Observable<boolean> = null;

  private updateCartSubject$ = new Subject<{
    data: CartItemExInterface,
    updateOrderReserve: boolean,
    callback: UpdateFlowCallback,
  }>();

  protected customElementService = this.injector.get(CustomElementService);
  private store = this.injector.get(Store);
  private changeDetectorRef = this.injector.get(ChangeDetectorRef);
  private pluginEventsService = this.injector.get(PluginEventsService);
  private orderInventoryService = this.injector.get(OrderInventoryService);
  private destroy$ = this.injector.get(PeDestroyService);

  constructor(private injector: Injector) {
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons(
      ['x-solid-24'],
      null,
      this.customElementService.shadowRoot,
    );
  }

  get uuid(): string {
    return `uuid-${this.flowId}`;
  }

  get cartItems(): CartItemExInterface[] {
    return this.cart$.getValue();
  }

  onTriggerSubmit(): void {
    this.checkAndUpdateFlow((success: boolean) => this.onSubmitted.emit(success), true);
  }

  checkIsShop(flowSettings: CheckoutSettingsInterface): boolean {
    return flowSettings && flowSettings.channelType === 'shop';
  }

  ngOnInit(): void {
    this.flowSettings$ = this.settings$.pipe(
      filter(d => !!d),
      takeUntil(this.destroy$),
    );
    this.subtotalOriginal$ = this.flow$.pipe(
      map(flow => this.orderInventoryService.flowToOrderInfo(flow).subtotalOriginal),
    );
    this.subtotalWithDiscount$ = this.flow$.pipe(
      map(flow => this.orderInventoryService.flowToOrderInfo(flow).subtotalWithDiscount),
    );
    this.discount$ = this.flow$.pipe(
      map(flow => this.orderInventoryService.flowToOrderInfo(flow).discount),
    );
    this.taxValue$ = this.flow$.pipe(
      map(flow => this.orderInventoryService.flowToOrderInfo(flow).taxValue),
    );
    this.orderTotal$ = this.flow$.pipe(
      map(flow => this.orderInventoryService.flowToOrderInfo(flow).orderTotal),
    );
    this.isShop$ = this.flowSettings$.pipe(
      map(settings => this.checkIsShop(settings)),
    );

    this.updateCartSubject$.pipe(
      debounceTime(200),
      switchMap(({ data, updateOrderReserve, callback }) =>
        this.updateCart(data, updateOrderReserve).pipe(
          tap(() => callback?.(true)),
        )
      ),
      takeUntil(this.destroy$),
    ).subscribe();

    this.numberOptions = this.generateNumberOptions();

    let firstRun = true;
    combineLatest([
      this.flow$.pipe(
        filter(value => !!value),
      ),
      this.flowSettings$,
    ]).pipe(delay(1)).subscribe(([flow, flowSettings]) => {
      const cart: CartItemExInterface[] = (flow.cart || []).filter((item: CartItemInterface) => item.quantity > 0);
      if (!this.isUpdatingData$.value
        && !this.isPreparingData$.value
        && (firstRun || (this.cart$.value.length !== cart.length || !cart.every((item, index) => {
          const correspondingItem = this.cart$.value[index] ?? {};

          return correspondingItem
            && item.productId === correspondingItem.productId
            && item.quantity === correspondingItem.quantity;
        })))
      ) {
        firstRun = false;
        this.cart$.next(cart);
        this.extendProductsData(flow, flowSettings, (cartData) => {
          this.subtotalWithDiscount$.pipe(take(1)).subscribe((subtotalWithDiscount) => {
            let amount = 0;
            cartData.forEach(item => amount += item.quantity * item.price);
            if (amount !== subtotalWithDiscount) {
              this.checkAndUpdateFlow();
            }
          });
        });
        this.serviceReady.next(true);
        this.globalLoading.next(false);
      }
    });

    combineLatest([this.isUpdatingData$, this.isPreparingData$]).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.onLoading.emit(data[0] || data[1]);
    });
  }

  onCounterValueChange(item: CartItemExInterface, newQty: number): void {
    newQty === 0 ? this.deleteItem(item) : this.updateItemQuantity(item, newQty);
  }

  updateItemQuantity(item: CartItemExInterface, newQty: number): void {
    if (!this.isPreparingData$.getValue()) {
      this.productsErrors[item.productId] = null;
      const cart: CartItemExInterface[] = this.cartItems.map(d => ({
        ...d,
        quantity: d.productId === item.productId ? newQty : d.quantity,
      }));

      this.cart$.next(cart);
      this.checkAndUpdateFlow();
    }
  }

  deleteItem(item: CartItemExInterface): void {
    if (!this.isPreparingData$.getValue()) {
      let cart: CartItemExInterface[] = this.cartItems;
      cart = cart.filter(d => d.productId !== item.productId);
      this.cart$.next(cart);
      this.checkAndUpdateFlow();
    }
  }

  onSubmit(): void {
    this.checkAndUpdateFlow();
  }

  isURL(str: string): boolean {
    return str && (str.startsWith('http://') || str.startsWith('https://'));
  }

  trackByFn(index: number, item: CartItemExInterface): string {
    // We use this function to remove blinking after each quantity edit (because it replaces items list in cart)
    return `${item.id}:${item.productId}:${item.identifier}:${item.image}:${item.name}:${item._optionsAsLine}:${item.quantity}:${item.price}:${item.originalPrice}`;
  }

  private generateNumberOptions(): number[] {
    return Array.from({ length: 1000 }, (_, i) => i);
  }

  private extendProductsData(
    flow: FlowInterface,
    flowSettings: CheckoutSettingsInterface,
    callback: (cart: CartItemExInterface[]) => void = null,
  ): void {
    const uuids: string[] = (flow.cart || []).map(item => item.productId);
    if (uuids.length > 0) {
      if (this.isProductsRefreshDisabled) {
        const cart: CartItemExInterface[] = flow.cart;
        this.cart$.next(cart);
        if (callback) { callback(cart) }
      } else {
        this.isPreparingData$.next(true);
        this.stateService.getProductsOnce(uuids).subscribe((data: ProductInterface[]) => {
          const cart = this.stateService.cartItemsToExtended(data, this.cartItems, flowSettings);
          this.cart$.next(cart);
          this.isPreparingData$.next(false);
          if (callback) { callback(cart) }
        });
      }
    }
  }

  private checkAndUpdateFlow(
    callback: UpdateFlowCallback = null,
    updateOrderReserve = false,
  ): void {

    this.commonError = null;
    this.isUpdatingData$.next(true);
    this.changeDetectorRef.detectChanges();
    const cart = this.cartItems;
    const amount = cart.reduce((acc, item) => acc += item.quantity * item.price, 0);

    if (amount < 0) {
      this.commonError = $localize `:@@checkout_cart_edit.error.subtotal_must_be_positive:`;
      this.changeDetectorRef.detectChanges();
    } else {
      const data: FlowInterface = {
        cart,
        amount,
      };

      this.updateCartSubject$.next({
        data,
        updateOrderReserve,
        callback,
      });
    }
  }

  private updateCart(
    data: FlowInterface,
    updateOrderReserve = false,
  ): Observable<FlowInterface> {
    return this.orderInventoryService.patchFlow(
      {
        cart: data.cart,
        amount: data.cart.reduce((acc, item) => acc += item.quantity * item.price, 0),
      },
      updateOrderReserve && this.isUseInventory,
    ).pipe(
      tap((flow: FlowInterface) => {
        // Have to update because cart is very updated inside updateCouponForFlowCart()
        this.cart$.next(flow.cart);
        this.pluginEventsService.emitCart(this.flowId, flow.cart); // Not sure that it's best place
        this.changeDetectorRef.detectChanges();
        this.isUpdatingData$.next(false);
      }),
      catchError((error) => {
        this.isUpdatingData$.next(false);
        this.handleErrors(error.message, error.failedItems);

        return EMPTY;
      }),
    );
  }

  private handleErrors(message: string = null, failedItems: string[] = null): void {
    this.productsErrors = {};
    (failedItems || []).forEach((id) => {
      this.productsErrors[id] = 'Error';
    });
    this.commonError = message || $localize `:@@checkout_cart_edit.error.cant_save_order:`;
    this.changeDetectorRef.detectChanges();
  }
}
