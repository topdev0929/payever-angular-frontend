import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import { BehaviorSubject, Subject, defer, merge, of } from 'rxjs';
import { map, scan, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { CheckoutStateParamsInterface } from '@pe/checkout-types';
import { PeDestroyService } from '@pe/common';

import { TimestampEvent } from './helpers/timestamp-event';
import { WrapperType } from './interfaces';
import { CheckoutMicroService } from './services';
import {
  PeSharedCheckoutService,
  PeSharedCheckoutCartService,
} from './services';
import { PeSharedCheckoutStoreService } from './states';


enum CheckoutEvents {
  EventEmitted = 'eventemitted',
  PayeverCheckoutClosed = 'payeverCheckoutClosed',
  PayeverCheckoutCartChanged = 'payeverCheckoutCartChanged',
  PayeverCheckoutLoaded = 'payeverCheckoutLoaded',
  PayeverCheckoutSantanderStateChangedEx = 'payeverCheckoutSantanderStateChangedEx',
}

@Component({
  selector: 'pe-shared-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeSharedCheckoutComponent implements OnInit {
  checkoutType$ = new BehaviorSubject(null);

  wrapperTypes = WrapperType;

  recreateFlow!: string;
  openOrderStep!: string;

  public readonly remote$ = this.checkoutMicroService.remote$;

  private readonly createParamsSubject$ = new BehaviorSubject<{ [key: string]: any }>({});
  public readonly createFlowParams$ = defer(() => merge(
    this.params$.pipe(
      map(params => ({
        channelSetId: this.app.channelSet?._id ?? this.app.channelSet,
        posMerchantMode: params.merchantMode,
        generatePaymentCode: params.generatePaymentCode,
        flowRawData: {
          posMerchantMode: params.merchantMode,
        },
      })),
    ),
    this.createParamsSubject$,
  ).pipe(
    scan((acc, params) => ({ ...acc, ...params }), {} as { [key: string]: any }),
  ));

  private readonly paramsSubject$ = new Subject<CheckoutStateParamsInterface>();
  public readonly params$ = merge(
    this.paramsSubject$,
    of({
      forceShowOrderStep: true,
      forceNoPaddings: true,
      embeddedMode: true,
      clientMode: true,
      merchantMode: true,
      generatePaymentCode: true,
      showQRSwitcher: false,
      showCreateCart: false,
      forceUseCard: false,
    }),
  ).pipe(
    scan((acc, params) => ({ ...acc, ...params }), {} as CheckoutStateParamsInterface),
  );

  private readonly cartSubject$ = new Subject<any>();
  public readonly cart$ = merge(
    this.cartService.updateCartItems$.pipe(
      map(cartItems => JSON.parse(cartItems)),
    ),
    this.cartSubject$,
  );

  get app() {
    return this.clientStore.app;
  }

  @HostBinding('style.display') hostDisplay = 'none';

  constructor(
    private cartService: PeSharedCheckoutCartService,
    private checkoutService: PeSharedCheckoutService,
    private destroy$: PeDestroyService,
    private checkoutMicroService: CheckoutMicroService,
    private clientStore: PeSharedCheckoutStoreService,
    private cdr: ChangeDetectorRef,
  ) {
    this.cartService.loadData();
  }

  ngOnInit() {
    this.checkoutService.getCheckoutType().pipe(
      withLatestFrom(this.cartService.updateCartItems$),
      tap(([checkoutType, cartItems]) => {
        this.hostDisplay = checkoutType ? 'block' : 'none';

        switch (checkoutType) {
          case WrapperType.AmountWrapper:
            this.paramsSubject$.next({
              forceUseCard: false,
              showQRSwitcher: false,
            });
            this.cartSubject$.next([]);
            break;

          case WrapperType.CheckoutWrapper:
            this.paramsSubject$.next({
              forceUseCard: true,
              showQRSwitcher: false,
            });
            this.cartSubject$.next(JSON.parse(cartItems));
            break;

          case WrapperType.CheckoutQrWrapper:
            this.paramsSubject$.next({
              forceUseCard: false,
              showQRSwitcher: true,
              showCreateCart: true,
            });
            this.cartSubject$.next([]);
            break;
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public eventHandler(e: any) {
    if (e?.detail) {
      const event = e.detail.event;
      const value: any = e.detail.value || {};
      switch (event) {
        case CheckoutEvents.PayeverCheckoutClosed:
          this.checkoutService.closeCheckoutWrapper();
          this.cdr.markForCheck();
          if (value.finished) {
            this.cartService.clearItems();
            this.recreateFlow = JSON.stringify(new TimestampEvent());
          } else {
            this.openOrderStep = JSON.stringify(new TimestampEvent());
          }
          break;
        case CheckoutEvents.PayeverCheckoutCartChanged:
          this.cartService.onCheckoutCartChanged(value);
          break;
      }
    }
  };
}

