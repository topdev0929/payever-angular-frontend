import { Injectable, OnDestroy } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { EMPTY, Subject } from 'rxjs';
import { catchError, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebIntegrationEventAction } from '@pe/builder/core';
import { PebIntegrationActionInvokerService } from '@pe/builder/integrations';

import { ContextCart } from '../interfaces';
import { PeSharedCheckoutCartService, PeSharedCheckoutService } from '../services';


@Injectable({ providedIn: 'any' })
export class PebCheckoutEventHandler implements OnDestroy {
  resolvers: any = {
    'checkout.update-cart': (params: any) => this.cartService.addCartItem(params.product, params.variant),
    'checkout.set-checkout-type': (params: any) => this.checkoutService.setCheckoutType(params.type),
  };

  private destroy$ = new Subject<void>();

  constructor(
    private readonly actions$: Actions,
    private readonly actionInvoker: PebIntegrationActionInvokerService,
    private readonly cartService: PeSharedCheckoutCartService,
    private readonly checkoutService: PeSharedCheckoutService,
    private store: Store,
    ) {
    this.cartService.cartItems$.pipe(
      tap((carts) => {
        if (!carts){
          return;
        }

        const items = carts.map((cart: ContextCart) => ({
          id: cart.product?.id,
          price:cart.variant?.price || cart.product?.price ,
          title: cart.variant?.title || cart.product?.name,
          quantity: cart.count,
        }));

        const action = {
          id: 'checkout-update-cart-info',
          type: 'action',
          uniqueTag: 'payever.checkout.cart-info.update.context',
          title: 'Update Cart Info',
          connectorId: 'checkout-app',
          dataType: 'object',
          method: 'context.patch',
          dynamicParams: {
            uniqueTag: {
              _: 'payever.checkout.cart.info.for.builder',
            },
            patch: {
              _:{
                hasItem: carts.length ? true : false,
                itemsCount:carts.reduce((num, cart) => num + cart.count, 0),
                totalPrice: carts.reduce((num, cart) => num + (cart.variant?.price || cart.product?.price || 0) * cart.count, 0),
                items: items?.length && items?.length > 0 ? items : [],
              },
            },
          },
          actionId: '4',
        };

        this.store.dispatch(new PebIntegrationEventAction(action.method, { action, context: undefined }));
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.actions$.pipe(
      ofActionDispatched(PebIntegrationEventAction),
      filter(({ event }) => event.startsWith('checkout.')),
      switchMap(({ event, payload }) => this.actionInvoker.runAction(
        this.resolvers[event]?.bind(this),
        payload.action,
        payload.context,
      )),
      takeUntil(this.destroy$),
      catchError((err) => {
        console.error(err);

        return EMPTY;
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
