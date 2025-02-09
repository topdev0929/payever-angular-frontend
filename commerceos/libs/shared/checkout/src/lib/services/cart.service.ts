import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, take, tap, withLatestFrom } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { ContextCart, FlowBodyCartInterface, PeElementContext } from '../interfaces';
import { PeSharedCheckoutStateService } from '../states';

@Injectable()
export class PeSharedCheckoutCartService {


  cartItems$: Observable<ContextCart[]> = this.rootStateService.state$.pipe(
    map(value => value['cart']?.data),
    tap(data => data && this.saveData(data)),
    map(data => data || []),
  );

  private updateCartCheckoutStream$ = new BehaviorSubject<void>(null as any);
  updateCartCheckout$ = this.updateCartCheckoutStream$
    .asObservable()
    .pipe(withLatestFrom(this.cartItems$));

  isPlatformBrowser$ = new BehaviorSubject<boolean>(false);
  updateCartItems$: Observable<string>;

  get cartItems(): ContextCart[] {
    return [];
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private rootStateService: PeSharedCheckoutStateService,
    private envService: EnvService,
  ) {

    this.isPlatformBrowser$.next(isPlatformBrowser(this.platformId));
    this.updateCartItems$ = this.updateCartCheckout$.pipe(
      debounceTime(300),
      map(([_, cartItems]) =>
        JSON.stringify(
          cartItems.reduce(
            (acc: FlowBodyCartInterface[], { count = 0, product = null, variant = null }: ContextCart) => {
              if (product && count > 0) {
                acc.push({
                  name: product.name,
                  productId: variant?.id ?? product.id,
                  identifier: variant?.id ?? product.id,
                  quantity: count,
                  price: variant?.price ?? product.price,
                  image: product.image,
                });
              }

              return acc;
            },
            [],
          ),
        ),
      ),
    );
  }

  addCartItem(product: any, variant: any) {
    if (product?.id) {
      const stateCart: PeElementContext<ContextCart[]> | undefined = this.rootStateService.state['cart'];
      const cartItems = stateCart?.data ?? [];
      const cartItem = cartItems?.find(
        item => item.product?.id === product.id && item.variant?.id === variant?.id,
      );

      if (cartItem?.product?.id) {
        this.updateItemQuantity(cartItem.product?.id, cartItem.variant?.id, cartItem.count + 1);
        this.updateCartCheckoutStream$.next();

        return;
      }

      const name = variant ? `${product.name}: ${variant.title}` : product.name;
      const newItem: any = { product: { ...product, productId: product.id, name }, variant, count: 1 };
      const cart: PeElementContext<ContextCart[]> = {
        ...stateCart,
        data: [...cartItems, newItem],
      };

      this.rootStateService.patch({
        'cart': cart,
      });
    }
    this.updateCartCheckoutStream$.next();
  }

  updateItemQuantity(productId: string, variantId: string | undefined, quantity: number) {
    const stateCart: PeElementContext<ContextCart[]> | undefined = this.rootStateService
      .state['cart'];
    const cart: PeElementContext<ContextCart[]> = {
      ...stateCart,
      data: stateCart?.data?.map(cartItem =>
        cartItem.product?.id === productId && cartItem.variant?.id === variantId
          ? { ...cartItem, count: quantity }
          : cartItem,
      ),
    };


    this.rootStateService.patch({
      'cart': cart,
    });

  }

  removeCartItem(productId: string, variantId: string | undefined) {
    const stateCart: PeElementContext<ContextCart[]> | undefined = this.rootStateService
      .state['cart'];
    const cart: PeElementContext<ContextCart[]> = {
      ...stateCart,
      data: stateCart?.data?.map(cartItem =>
        cartItem.product?.id === productId && cartItem.variant?.id === variantId
          ? { ...cartItem, count: 0 }
          : cartItem,
      ),
    };

    this.rootStateService.patch({
      'cart': cart,
    });
  }

  onCheckoutCartChanged(payload: any) {
    const cart: FlowBodyCartInterface[] = payload.cart || [];

    const updatedCartItems: ContextCart[] = [];
    const removedCartItems: ContextCart[] = [];

    this.cartItems$.pipe(
      take(1),
      withLatestFrom(this.rootStateService.state$),
      tap(([cartItems, state]) => {
        cartItems.forEach((item) => {
          const id = item.variant?.id ?? item.product?.id;
          const flowItem = cart.find(flowItemValue => flowItemValue.productId === id);

          if (flowItem?.quantity  && flowItem?.quantity > 0) {
            updatedCartItems.push({
              ...item,
              count: flowItem.quantity,
            });
          } else {
            removedCartItems.push(item);
          }
        });

        const updatedCart: PeElementContext<ContextCart[]> = {
          ...state['cart'],
          data: updatedCartItems,
        };

        this.rootStateService.patch({
          'cart': updatedCart,
        });

        removedCartItems.forEach((item) => {
          if (item.product?.id) {
            this.removeCartItem(item.product?.id, item.variant?.id);
          }
        });
      })
    ).subscribe(() => {
      this.updateCartCheckoutStream$.next();
    });
  }

  clearItems() {
    const stateCart: PeElementContext<ContextCart[]> | undefined = this.rootStateService
      .state['cart'];
    this.rootStateService.patch({
      'cart': { ...stateCart, data: [] },
    });
    this.updateCartCheckoutStream$.next();
  }

  saveData(data: ContextCart[]) {
    if (this.isPlatformBrowser$?.value) {
      localStorage.setItem(`payever-cart.${this.envService.businessId}`, JSON.stringify(data));
    }
  }

  loadData() {
    if (this.isPlatformBrowser$?.value) {
      const stateCart: PeElementContext<ContextCart[]> | undefined = this.rootStateService.state['cart'];
      try {
        const cartData = localStorage.getItem(`payever-cart.${this.envService.businessId}`);
        const parsedCartData = cartData ? JSON.parse(cartData) : [];
        this.rootStateService.patch({
          'cart': { ...stateCart, data: parsedCartData },
        });
        this.updateCartCheckoutStream$.next();
      } catch (err) {
        alert(`Please enable cookies in your browser in order for the site to fully function.`);
        console.error(err);
      }
    }
  }
}
