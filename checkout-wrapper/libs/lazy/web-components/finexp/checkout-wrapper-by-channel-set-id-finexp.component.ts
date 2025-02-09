import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation, inject } from '@angular/core';
import produce from 'immer';

import { FinExpApiCallInterface } from '@pe/checkout/api';
import { StorageService } from '@pe/checkout/storage';
import { CreateFinexpFlow, FlowState } from '@pe/checkout/store';
import { CartItemInterface, FlowInterface } from '@pe/checkout/types';
import { BaseCheckoutWrapperComponent } from '@pe/checkout/web-components/shared';
import { PeDestroyService } from '@pe/destroy';

export interface FinExpCreateFlowParamsInterface {
  channelSetId: string;
  apiCallData: FinExpApiCallInterface;
  clientMode?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'checkout-wrapper-by-channel-set-id-finexp',
  templateUrl: './checkout-wrapper-by-channel-set-id-finexp.component.html',
  styleUrls: [
    '../shared/base-web-component/base-checkout-wrapper.component.scss',
    './checkout-wrapper-by-channel-set-id-finexp.component.scss',

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
export class CheckoutWrapperByChannelSetIdFinExpComponent extends BaseCheckoutWrapperComponent {
  private storage = inject(StorageService);

  createFlowFinExpParams: FinExpCreateFlowParamsInterface = null;
  @Input('finExpCreateFlowParams') set setCreateFlowFinExpParams(value: FinExpCreateFlowParamsInterface) {
    const hasFlowParamChanged = this.hasFlowParamsChanged(this.createFlowFinExpParams, value);
    if (hasFlowParamChanged) {
      this.createFlowFinExpParams = value;
      this.createFlow();
    }
  }

  hideCreateFlowErrors = false;
  @Input('hideCreateFlowErrors') set setHideCreateFlowErrors(value: boolean) {
    this.hideCreateFlowErrors = value;
  }

  flowId: string = null;
  forceHide = false;
  lastError: any = null;
  private lastCreateFlowFinExpParams: FinExpCreateFlowParamsInterface = null;

  getFlowId(): string {
    return this.flowId;
  }

  triggerCustomElementReadyCheck(): void {
    super.triggerCustomElementReadyCheck();
    this.createFlow();
  }

  initEnv(): void {
    // For some reason APP_INITIALIZER in not triggered sometimes in CosEnvInitializer
  }

  createFlow(forceReCreate = false): void {
    this.initEnv();
    const hasChannelSetId = !!this.createFlowFinExpParams?.channelSetId;
    if (this.createFlowFinExpParams?.channelSetId) {
      this.initSkeleton(this.createFlowFinExpParams?.channelSetId, forceReCreate);
    }
    if (
      (forceReCreate && hasChannelSetId) ||
      (hasChannelSetId)
    ) {
      this.lastCreateFlowFinExpParams = this.createFlowFinExpParams;

      const createFlowParams: FinExpCreateFlowParamsInterface = produce(this.createFlowFinExpParams, (draft) => {
        // To fix empty strings that comes from editor and can't be accepted by backend
        ['successUrl', 'pendingUrl', 'cancelUrl', 'failureUrl', 'noticeUrl'].forEach((name) => {
          const apiCallData: any = draft.apiCallData;
          if (apiCallData[name] === '' || apiCallData[name] === null) {
            delete apiCallData[name];
          }
        });
      });

      this.store.dispatch(new CreateFinexpFlow({
        channelSetId: createFlowParams.channelSetId,
        ...createFlowParams.apiCallData,
      })).subscribe(
        () => {
          const flow = this.store.selectSnapshot(FlowState.flow);
          if (forceReCreate && this.flowId) {
            try {
              this.storage.remove(`payever_checkout_flow.${this.flowId}`); // Small hack to not flood local storage too much
            } catch (e) {}
          }
          this.forceHide = true;
          this.updateCustomElementView();
          this.flowId = flow.id;
          this.forceHide = false;
          this.updateCustomElementView();
          this.params = {
            ...this.params,
            clientMode: createFlowParams.clientMode,
          };
        },
        (err) => {
          this.lastError = err;
          if (!this.hideCreateFlowErrors) {
            this.showError('Not possible to create flow!');
          }
        }
      );
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

  private hasFlowParamsChanged(
    oldValue: FinExpCreateFlowParamsInterface,
    newValue: FinExpCreateFlowParamsInterface,
  ): boolean {
    if (!oldValue
      || oldValue.channelSetId !== newValue.channelSetId
      || oldValue.clientMode !== newValue.clientMode) {
      return true;
    }
    if (!oldValue.apiCallData && !newValue.apiCallData) {
      return false;
    }
    const { cart: previousCart, ...otherOldApiCallData } = oldValue.apiCallData;
    const { cart: currentCart, ...otherNewApiCallData } = newValue.apiCallData;

    const otherOldApiCallDataKeys = Object.keys(otherOldApiCallData) as (
      keyof Omit<FinExpApiCallInterface, 'cart'>
    )[];
    const otherNewApiCallDataKeys = Object.keys(otherNewApiCallData);

    const hasOtherApiCallDataChanged = otherOldApiCallDataKeys.length !== otherNewApiCallDataKeys.length
     || !otherOldApiCallDataKeys.every(key => otherOldApiCallData[key] === otherNewApiCallData[key]);

    if (hasOtherApiCallDataChanged) {
      return true;
    }

    const hasCartChanged = previousCart?.length !== currentCart?.length
      || !previousCart?.every((item, index) => {
        const correspondingItem = currentCart[index];

        return correspondingItem
          && (Object.keys(item) as (keyof CartItemInterface)[]).every(key => item[key] === correspondingItem[key]);
      });

    if (hasCartChanged) {
      return true;
    }

    return false;
  }
}
