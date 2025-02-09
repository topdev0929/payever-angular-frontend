import { Injectable, Injector, ViewContainerRef } from '@angular/core';
import { Store } from '@ngxs/store';
import produce from 'immer';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import {
  CreateFlowParamsInterface,
} from '@pe/checkout/api';
import { CheckoutWrapperComponent } from '@pe/checkout/main';
import { CheckoutEventInterface, CheckoutPluginEventEnum } from '@pe/checkout/plugins';
import { StorageService } from '@pe/checkout/storage';
import { CreateFlow, FlowState, PatchFlow, SetParams } from '@pe/checkout/store';
import { CartItemInterface, CheckoutStateParamsInterface } from '@pe/checkout/types';
import { WindowEventsService } from '@pe/checkout/window';
export class ConfigByChannelSetIdInterface {

  createFlowParams: CreateFlowParamsInterface;
  params: CheckoutStateParamsInterface;
  cart: CartItemInterface[];
  disableLocaleDetection: boolean;
  checkoutHidden: boolean;

  layoutShown: () => void;
  closed: () => void;
  eventEmitted: (event: CheckoutEventInterface) => void;
}

export class CheckoutWrapperInstanceInterface {
  saveFlowToStorage: () => Observable<string>;
  reCreateFlow: () => Observable<CheckoutWrapperInstanceInterface>;
  setCart: (cart: CartItemInterface[]) => void;
  setParams: (params: CheckoutStateParamsInterface) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ElementsManagerService {

  protected windowEventsService: WindowEventsService = this.injector.get(WindowEventsService);
  private store = this.injector.get(Store);
  private storage = this.injector.get(StorageService);

  private updatingCarts: {[key: string]: boolean} = {};

  constructor(protected injector: Injector) {
  }

  insertByChannelSetId(
    viewContainerRef: ViewContainerRef,
    config: ConfigByChannelSetIdInterface,
    destroyedParam$: ReplaySubject<boolean>,
  ): Observable<CheckoutWrapperInstanceInterface> {

    const destroyed$: ReplaySubject<boolean> = destroyedParam$ || (new ReplaySubject());

    return new Observable((obs) => {
      const hasChannelSetId = !!config.createFlowParams?.channelSetId;
      if (!hasChannelSetId) {
        obs.error('Invalid config: no channel set id');
      }
      else {
        const createFlowParams: CreateFlowParamsInterface = produce(config.createFlowParams, (draft) => {
          if (config.cart) {
            if (!draft.flowRawData) {
              draft.flowRawData = {};
            }
            draft.flowRawData.cart = config.cart;
          }
        });

        this.store.dispatch(new CreateFlow(createFlowParams)).subscribe(
          () => {
            const flow = this.store.selectSnapshot(FlowState.flow);

            let flowId = flow.id;

            viewContainerRef.clear();

            const componentRef = viewContainerRef.createComponent<CheckoutWrapperComponent>(CheckoutWrapperComponent);
            componentRef.instance.flowId = flowId;
            componentRef.instance.params = config.params;
            componentRef.instance.asCustomElement = true;
            componentRef.instance.layoutShown.pipe(takeUntil(destroyed$)).subscribe(() => config.layoutShown());
            // componentRef.instance..pipe(takeUntil(destroyed$)).subscribe(() =>  config.layoutShown());
            componentRef.instance.flowCloned.pipe(takeUntil(destroyed$)).subscribe((clone) => {
              flowId = clone.cloned.id;
              componentRef.instance.flowId = flowId;
              componentRef.instance.cdr.detectChanges();
            });

            this.windowEventsService.message$(destroyed$).subscribe((event: MessageEvent) => {
              if (event?.data?.event) {
                const key: string = event.data.event;
                const value: any = event.data.value;
                const events: string[] = Object.keys(CheckoutPluginEventEnum);
                if (events.indexOf(key) >= 0 && value && value.flowId === flowId) {
                  config.eventEmitted(event.data);
                  if (key === CheckoutPluginEventEnum.payeverCheckoutClosed) {
                    config.closed();
                  }
                }
              }
            });

            const result: CheckoutWrapperInstanceInterface = {
              saveFlowToStorage: () => componentRef.instance.doSaveFlowToStorageAndCreateLink(),
              reCreateFlow: () => {
                try {
                  this.storage.remove(`payever_checkout_flow.${flowId}`); // Small hack to not flood local storage too much
                } catch (e) {}

                return this.insertByChannelSetId(viewContainerRef, config, destroyedParam$);
              },
              setCart: (cart: CartItemInterface[]) => {
                this.updateFlowCart(flowId, cart);
              },
              setParams: (params: CheckoutStateParamsInterface) => {
                this.store.dispatch(new SetParams(params));
              },
            };

            this.store.dispatch(new SetParams(config.params));

            componentRef.instance.cdr.detectChanges();

            obs.next(result);
          },
          (err) => {
            obs.error(err);
          }
        );
      }
    });
  }

  protected updateFlowCart(flowId: string, cart: CartItemInterface[], forceUpdate = false): void {
    const flow = this.store.selectSnapshot(FlowState.flow);
    const currentCart = flow.cart;
    if (forceUpdate || (cart && !this.checkCartsEqual(currentCart, cart))) {
      this.patchCart(flowId, cart);
    }
  }

  protected patchCart(flowId: string, cart: CartItemInterface[]): void {
    if (!this.updatingCarts[flowId] && flowId) {
      this.updatingCarts[flowId] = true;
      this.store.dispatch(new PatchFlow({ cart })).pipe(
        tap(
          () => this.updatingCarts[flowId] = false,
          () => this.updatingCarts[flowId] = false,
        ),
      ).subscribe();
    }
  }

  protected checkCartsEqual(cart1: CartItemInterface[], cart2: CartItemInterface[]): boolean {
    // We can't use just isEqual() because in shop we have issue - we send event when cart was updated but
    // after that shop sets new cart for web component. Shop cart has same items and quantites but prices are empty.
    //  As result backend resets amount after flow patched.

    return cart1?.length === cart2?.length &&
      (cart1?.map(a => ({ id: a.id, productId: a.productId, quantity: a.quantity })) || []).every((item, index) => {
        const correspondingItem = cart2?.[index];

        return (
          correspondingItem &&
          item.id === correspondingItem.id &&
          item.productId === correspondingItem.productId &&
          item.quantity === correspondingItem.quantity
        );
      });
  }
}
