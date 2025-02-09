import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, flatMap, map, share } from 'rxjs/operators';

import { AuthService } from '@pe/ng-kit/modules/auth';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { CreateFlowService } from '@pe/checkout-sdk/sdk/api';
import {
  CartEventInterface,
  CartInterface,
  CartItemInterface,
  FlowBodyCartInterface,
  FlowBodyInterface,
  FlowDataInterface,
} from '../interfaces';
import { NewCartService } from './cart.service';
import { CheckoutApiService } from './checkout-api.service';
import { ClientLauncherService } from '../../../app/services';

type CheckoutComponentMode = 'cart' | 'amount' | null;

const UUID_REGEXP: RegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class NewCheckoutService {
  cartFlowId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  typeAmountFlowId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  flowsCreated$: Observable<boolean> = combineLatest(this.cartFlowId$, this.typeAmountFlowId$).pipe(
    map((data: [string, string]) => {
      return !!data[0] && !!data[1];
    }),
  );

  private cartShownModeSubject$ = new BehaviorSubject<CheckoutComponentMode>(null);
  // tslint:disable-next-line:member-ordering
  cartShownMode$: Observable<CheckoutComponentMode> = this.cartShownModeSubject$.pipe(
    distinctUntilChanged(),
    share(),
  );

  set checkoutMode(mode: CheckoutComponentMode) {
    this.cartShownModeSubject$.next(mode);
  }
  get checkoutMode(): CheckoutComponentMode {
    return this.cartShownModeSubject$.getValue();
  }

  private cartFlowIdentifier: string = null;
  private typeAmountFlowIdentifier: string = null;
  private guestToken: string = null;

  private itemsEventSubscription: Subscription = null;

  constructor(
    private configService: EnvironmentConfigService,
    private apiService: CheckoutApiService,
    private cartService: NewCartService,
    private authService: AuthService,
    private createFlowService: CreateFlowService,
    private clientLauncherService: ClientLauncherService,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: string,
  ) {}

  reCreateFlows(channelSet: string): void {
    // Create flows only in browsers
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.createFlows(true, channelSet);
  }

  // tslint:disable-next-line:typedef
  createFlows(forceCreate = false, channelSet: string): void {
    const queryAuthToken: string = this.activatedRoute.snapshot.queryParamMap.get('authToken');
    // const queryMerchantMode: string = this.activatedRoute.snapshot.queryParamMap.get('merchantMode');

    if (queryAuthToken) {
      this.apiService.token = queryAuthToken;
    }

    /*
    if (queryMerchantMode) {
      this.apiService.merchantMode = queryMerchantMode === 'true';
    }*/

    // Create flows only in browsers
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (forceCreate || (!this.cartFlowId$.value && !this.typeAmountFlowId$.value)) {
      const flowBody: FlowBodyInterface = createFlowBody({
        amount: null,
        items: [],
        flowId: null,
        status: '',
      }, channelSet);

      // need to create flows for type amount and cart
      // We can't use combineLatest() because 2 requests disallowed to go in parallel
      const data: [FlowDataInterface, FlowDataInterface] = [null, null];
      if (this.itemsEventSubscription) {
        this.itemsEventSubscription.unsubscribe();
      }
      // You can't create 2 flows in parallel. Never do it! Ony one after one.
      this.apiService
        .createFlow(flowBody)
        .pipe(
          flatMap(flow => {
            data[0] = flow;

            if (flow.guest_token) {
              this.authService.setGuestToken(flow.guest_token);
            }

            return this.apiService.createFlow(flowBody);
          }),
          map(flow => {
            data[1] = flow;
          }),
        )
        .subscribe(() => {
          // Must go before cartFlowId$.next(...)
          this.cartFlowIdentifier = data[0].flow_identifier;
          this.typeAmountFlowIdentifier = data[1].flow_identifier;
          this.guestToken = data[0].guest_token || data[1].guest_token;

          this.cartFlowId$.next(data[0].id);
          this.typeAmountFlowId$.next(data[1].id);

          let firstRun = true;
          this.itemsEventSubscription = this.cartService.itemsEvent$.subscribe((cartEvent: CartEventInterface) => {
            if (!cartEvent.sendEvent && !firstRun) {
              return;
            }
            firstRun = false;
            const flowCart: FlowBodyCartInterface[] = cartEvent.items.map((cartItem: CartItemInterface) => {
              return {
                name: cartItem.title,
                uuid: cartItem.itemId,
                id: cartItem.itemId,
                sku: cartItem.sku,
                image: cartItem.image,
                quantity: cartItem.quantity,
                price: cartItem.price,
                extra_data: cartItem.extra_data ? cartItem.extra_data : null,
              } as FlowBodyCartInterface;
            });
            let amount = 0;
            flowCart.forEach(cartItem => (amount += cartItem.price));

            this.patchCartFlow(
              {
                cart: flowCart,
                amount,
                x_frame_host: getXFrameHost(),
              },
              this.cartFlowIdentifier,
            ).subscribe(
              () => {
                window.postMessage('items-added-to-cart', '*');
              },
              () => {
                window.postMessage('items-added-to-cart', '*');
              },
            );
          });
        });
    }
  }

  getFlowId(isCart: boolean): string {
    return isCart ? this.cartFlowId$.value : this.typeAmountFlowId$.value;
  }

  getCheckoutFlowUrl(isCart: boolean): string {
    const flowId: string = isCart ? this.cartFlowId$.value : this.typeAmountFlowId$.value;
    const flowIdentifier: string = isCart ? this.cartFlowIdentifier : this.typeAmountFlowIdentifier;
    let additionalParams: string = isCart
      ? '&forceUseCard=true&forceShowOrderStep=true'
      : '&forceShowOrderStep=true&forceUseCard=false';
    const guestToken: string = this.guestToken ?
      `&guest_token=${this.guestToken}` : '';

    // merchantMode is relevant only for iframe (because it's inside iframe in commerceos), because it's needed to show 'Back to POS terminal' button on payment finish.
    if (String(sessionStorage.getItem('enableMerchantMode')) === 'true' && this.isInIframe()) {
      // TODO Temporary solution to test wrapper's merchantMode
      additionalParams += '&merchantMode=true';
    }

    return flowId
      ? `${this.configService.getFrontendConfig().checkoutWrapper}` +
      `/pay/${flowId}?forceNoPaddings=true` +
      '&forceNoSnackBarNotifications=true' +
      '&modalWindowMode=true' +
      `&flowIdentifier=${flowIdentifier}${additionalParams}` +
      `${guestToken}`
      : null;
  }

  private patchCartFlow(flowData: FlowBodyInterface, payeverSession: string): Observable<FlowDataInterface> {
    return this.apiService.patchFlow(this.cartFlowId$.value, payeverSession, flowData);
  }

  private isInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
}

/**
 * Used for flow api methods
 */
const createFlowBody = (
  cart: CartInterface,
  channelSet: string,
): FlowBodyInterface => {
  return {
    x_frame_host: getXFrameHost(),
    shop_url: getShopUrl(), // TODO Add path
    amount: cart.amount,
    channel_set_id: channelSet,
    // pos_merchant_mode: String(sessionStorage.getItem('enableMerchantMode')) === 'true',
    cart: [
      ...cart.items.map((item: CartItemInterface) => {
        return {
          uuid: item.itemId,
          quantity: item.count,
        };
      }),
    ],
  };
};

const getShopUrl = (): string => {
  let shopUrl: string;
  const pathSegments: string[] = location.pathname.split('/');
  if (
    pathSegments.length > 1 &&
    pathSegments[pathSegments.length - 2] === 'product' &&
    UUID_REGEXP.test(pathSegments[pathSegments.length - 1])
  ) {
    pathSegments.splice(pathSegments.length - 2);
    shopUrl = getXFrameHost() + pathSegments.join('/');
  } else if (pathSegments.length > 0 && pathSegments[pathSegments.length - 1] === 'cart') {
    pathSegments.splice(pathSegments.length - 1);
    shopUrl = getXFrameHost() + pathSegments.join('/');
  } else {
    shopUrl = getXFrameHost() + location.pathname;
  }

  return shopUrl;
};

// tslint:disable:no-string-literal
const getXFrameHost = (): string => {
  return window.location['ancestorOrigins'] && window.location['ancestorOrigins'].length
    ? window.location['ancestorOrigins'][0]
    : window.location.origin;
};
