import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Actions, ofActionSuccessful } from '@ngxs/store';
import produce from 'immer';
import { takeUntil, tap } from 'rxjs/operators';

import { CreateFlowParamsInterface } from '@pe/checkout/api';
import { PluginEventsService } from '@pe/checkout/plugins';
import { StorageService } from '@pe/checkout/storage';
import { CreateFlow, FlowState, PatchFlow, SetPaymentComplete } from '@pe/checkout/store';
import { CartItemInterface, FlowInterface } from '@pe/checkout/types';
import { isEqual } from '@pe/checkout/utils';
import { BaseCheckoutWrapperComponent } from '@pe/checkout/web-components/shared';
import { PeDestroyService } from '@pe/destroy';

/** Main goal of this component is to:
 * - get input params
 * - get output events from children and dispatch them as outputs
 * - "bootstrap" our application - we're uploading translations here instead of guards, etc.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'checkout-wrapper-by-channel-set-id',
  templateUrl: './checkout-wrapper-by-channel-set-id.component.html',
  styleUrls: [
    '../shared/base-web-component/base-checkout-wrapper.component.scss',
    './checkout-wrapper-by-channel-set-id.component.scss',

    // Instead of /lazy-styles.css we include styles directly:
    '../../../shared/styles/assets/ui-kit-styles/pe_style.scss',
    '../../../shared/styles/assets/temp-global-styles.scss',
    '../skeleton/styles.css',
  ],
  encapsulation: ViewEncapsulation.ShadowDom,
  providers: [
    PeDestroyService,
  ],
})
export class CheckoutWrapperByChannelSetIdComponent extends BaseCheckoutWrapperComponent implements OnInit {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @Input('reCreateFlow') set setReCreateFlow(value: any) {
    this.flowId = null;
    this.cdr.detectChanges();
    this.createFlow(true);
  }

  @Input('reCreateFlowAndResetCart') set setReCreateFlowAndResetCart(value: any) {
    this.flowId = null;
    this.cdr.detectChanges();
    this.cart = [];
    this.createFlow(true);
  }

  createFlowParams: CreateFlowParamsInterface = null;
  @Input('createFlowParams') set setCreateFlowParams(value: CreateFlowParamsInterface) {
    this.createFlowParams = value;
    this.createFlow();
  }

  cart: CartItemInterface[] = null;
  @Input('cart') set setCart(value: CartItemInterface[]) {
    this.cart = value;
    this.updateFlowCart();
  }

  hideCreateFlowErrors = false;
  @Input('hideCreateFlowErrors') set setHideCreateFlowErrors(value: boolean) {
    this.hideCreateFlowErrors = value;
  }

  flowId: string = null;
  forceHide = false;
  lastError: any = null;

  private lastCreateFlowParams: CreateFlowParamsInterface = null;
  private isUpdatingCart = false;
  private isOnInitPassed = false;

  public cdr: ChangeDetectorRef;

  constructor(
    protected injector: Injector,
    private actions$: Actions,
    private pluginEventsService: PluginEventsService,
    private storage: StorageService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.isOnInitPassed = true;

    this.actions$.pipe(
      ofActionSuccessful(SetPaymentComplete),
      tap(() => {
        this.pluginEventsService.emitCart(this.flowId, []);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getFlowId(): string {
    return this.flowId;
  }

  triggerCustomElementReadyCheck(): void {
    super.triggerCustomElementReadyCheck();
    this.createFlow();
  }

  createFlow(forceReCreate = false): void {
    if (!this.isOnInitPassed) {
      return;
    }
    const channelSetIdChanged = this.flow?.channelSetId !== this.createFlowParams?.channelSetId;
    const hasChannelSetId = !!this.createFlowParams?.channelSetId;

    if (this.createFlowParams?.channelSetId) {
      this.initSkeleton(this.createFlowParams?.channelSetId, forceReCreate || channelSetIdChanged);
    }
    if (
      (forceReCreate && hasChannelSetId) ||
      (hasChannelSetId && !isEqual(this.lastCreateFlowParams, this.createFlowParams))
    ) {
      this.lastCreateFlowParams = this.createFlowParams;
      const createFlowParams: CreateFlowParamsInterface = produce(this.createFlowParams, (draft) => {
        if (this.cart) {
          if (!draft.flowRawData) {
            draft.flowRawData = {};
          }
          draft.flowRawData.cart = this.cart;
        }
      });

      if (createFlowParams.posMerchantMode && this.params) {
        this.params.merchantMode = true; // is it pos or not we will know in selected payment
      }

      this.store.dispatch(new CreateFlow(createFlowParams)).pipe(
        tap(
          () => {
            if (forceReCreate && this.flowId) {
              try {
                this.storage.remove(`payever_checkout_flow.${this.flowId}`); // Small hack to not flood local storage too much
              } catch (e) {}
            }
            this.forceHide = true;
            this.updateCustomElementView();
            this.flowId = this.flow.id;
            this.forceHide = false;
            this.updateCustomElementView();
            this.updateFlowCart(); // Update cart if was changed during flow creation
          },
          (err) => {
            this.lastError = err;
            if (!this.hideCreateFlowErrors) {
              this.showError('Not possible to create flow!');
            }
          }
        ),
      ).subscribe();
    }
  }

  updateFlowCart(forceUpdate = false): void {
    if (this.flowId) {
      const currentCart = this.flow.cart;
      if (forceUpdate || (this.cart && !this.checkCartsEqual(currentCart, this.cart))) {
        this.patchCart();
      }
    }
  }

  checkCartsEqual(cart1: CartItemInterface[], cart2: CartItemInterface[]): boolean {
    // We can't use just isEqual() because in shop we have issue - we send event when cart was updated but
    // after that shop sets new cart for web component. Shop cart has same items and quantites but prices are empty.
    //  As result backend resets amount after flow patched.
    return cart1?.length === cart2?.length
      && cart1.every((cart, idx) => cart.id === cart2[idx]?.id
      && cart.quantity === cart2[idx]?.quantity
      && cart.productId === cart2[idx]?.productId
    );
  }

  patchCart(): void {
    if (!this.isUpdatingCart && this.flowId) {
      this.isUpdatingCart = true;
      this.store.dispatch(new PatchFlow({ cart: this.cart })).pipe(
        tap(
          () => {
            this.isUpdatingCart = false;
          },
          (err) => {
            this.isUpdatingCart = false;
            this.lastError = err;
            if (!this.hideCreateFlowErrors) {
              this.showError('Not possible to create flow!');
            }
          }
        ),
      ).subscribe();
    }
  }

  onFlowCloned(event: any): void {
    const flow: FlowInterface = event ? event.cloned : null;
    if (flow) {
      this.flowId = flow.id;
      this.flowCloned.emit(event);
      this.updateCustomElementView();
    } else {
      // Should never happen:
      // eslint-disable-next-line
      console.trace();
      this.showError('Invalid cloned flow data!');
    }
  }
}
