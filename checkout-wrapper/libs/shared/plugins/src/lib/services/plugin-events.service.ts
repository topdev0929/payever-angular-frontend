import { Injectable } from '@angular/core';

import {
  CartItemInterface,
  FlowInterface,
  PaymentStatusEnum,
  PluginSantanderStateEnum,
} from '@pe/checkout/types';
import { SnackBarConfig } from '@pe/checkout/ui/snackbar';

export enum CheckoutPluginEventEnum {
  payeverCheckoutModalShow = 'payeverCheckoutModalShow',
  payeverCheckoutModalHide = 'payeverCheckoutModalHide',
  payeverCheckoutStepPanelOpened = 'payeverCheckoutStepPanelOpened',
  payeverCheckoutHeightChanged = 'payeverCheckoutHeightChanged',
  payeverCheckoutHeightChangedEx = 'payeverCheckoutHeightChangedEx',
  payeverCheckoutFlowFinished = 'payeverCheckoutFlowFinished',
  payeverCheckoutCartChanged = 'payeverCheckoutCartChanged',
  payeverCheckoutLoaded = 'payeverCheckoutLoaded',
  payeverCheckoutClosed = 'payeverCheckoutClosed',
  payeverCheckoutFlowSavedToStorage = 'payeverCheckoutFlowSavedToStorage',
  payeverCheckoutSnackBarToggle = 'payeverCheckoutSnackBarToggle',
  payeverCheckoutBeforeFlowClone = 'payeverCheckoutBeforeFlowClone',
  payeverCheckoutAfterFlowClone = 'payeverCheckoutAfterFlowClone',
  payeverCheckoutScrollOfParentElement = 'payeverCheckoutScrollOfParentElement',
  payeverCheckoutSantanderStateChanged = 'payeverCheckoutSantanderStateChanged',
  payeverCheckoutSantanderStateChangedEx = 'payeverCheckoutSantanderStateChangedEx'
}

export interface CheckoutEventInterface {
  event: string;
  value: any;
}

@Injectable()
export class PluginEventsService {

  private lastHeight = 0;

  emitModalShow(flowId: string): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutModalShow, {
      flowId,
    });
  }

  emitModalHide(flowId: string): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutModalHide, {
      flowId,
    });
  }

  emitPanelOpened(flowId: string, topOffset: number): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutStepPanelOpened, {
      flowId,
      topOffset,
    });
  }

  emitHeight(flowId: string, height: number): void {
    if (this.lastHeight !== height) {
      this.lastHeight = height;
      this.emit(CheckoutPluginEventEnum.payeverCheckoutHeightChanged, height);
      this.emit(CheckoutPluginEventEnum.payeverCheckoutHeightChangedEx, { flowId, value: height });
    }
  }

  emitFlowFinished(status: 'success' | 'fail', flow: FlowInterface, apiCall: any): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutFlowFinished, {
      status,
      apiCall,
      flowId: flow.id,
      flowData: this.makeShortFlowData(flow),
    });
  }

  emitCart(flowId: string, cart: CartItemInterface[]): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutCartChanged, {
      flowId,
      cart,
    });
  }

  emitLoaded(flowId: string): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutLoaded, {
      flowId,
      status: 'success',
    });
  }

  emitClosed(flowId: string, flowFinished: boolean): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutClosed, {
      flowId,
      finished: flowFinished,
    });
  }

  emitFlowSavedToStorage(flowId: string, restoreUrl: string): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutFlowSavedToStorage, {
      flowId,
      restoreUrl,
    });
  }

  emitSnackBarToggle(isShow: boolean, message: string, config: SnackBarConfig = null): void {
    // For snack bar notifications we have to send event both to parent and current
    // because sometimes in shop's iframe we don't have handling for notifications on shop's side
    this.emit(CheckoutPluginEventEnum.payeverCheckoutSnackBarToggle, {
      isShow,
      message,
      config,
    });
  }

  emitSantanderPostPayment(flow: FlowInterface): void {
    this.emitSantanderState(PluginSantanderStateEnum.started, flow, null);
  }

  emitSantanderPaymentTimeout(flow: FlowInterface): void {
    this.emitSantanderState(PluginSantanderStateEnum.timeout, flow, null);
  }

  emitSantanderPaymentError(flow: FlowInterface): void {
    this.emitSantanderState(PluginSantanderStateEnum.error, flow, null);
  }

  emitSantanderPaymentStatus(status: PaymentStatusEnum, flow: FlowInterface, apiCall: any): void {
    if (status) {
      switch (status) {
        case PaymentStatusEnum.STATUS_ACCEPTED:
        case PaymentStatusEnum.STATUS_PAID:
          this.emitSantanderState(PluginSantanderStateEnum.accepted, flow, apiCall);
          break;
        case PaymentStatusEnum.STATUS_IN_PROCESS:
        case PaymentStatusEnum.STATUS_NEW:
          this.emitSantanderState(PluginSantanderStateEnum.inProcess, flow, apiCall);
          break;
        case PaymentStatusEnum.STATUS_CANCELLED:
        case PaymentStatusEnum.STATUS_FAILED:
          this.emitSantanderState(PluginSantanderStateEnum.failed, flow, apiCall);
          break;
        case PaymentStatusEnum.STATUS_DECLINED:
          this.emitSantanderState(PluginSantanderStateEnum.declined, flow, apiCall);
          break;
        default:
          this.emitSantanderState(PluginSantanderStateEnum.failed, flow, apiCall);
          throw new Error(`Unknown santander payment status! Force set "FAILED" \n${JSON.stringify(status)}`);
      }
    }
  }

  emitBeforeFlowClone(flowId: string): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutBeforeFlowClone, { flowId });
  }

  emitAfterFlowClone(prevFlowId: string, nextFlowId: string): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutAfterFlowClone, { prevFlowId, nextFlowId });
  }

  emitScrollOfParentElement(scrollTop: number): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutScrollOfParentElement, scrollTop);
  }

  private emitSantanderState(state: PluginSantanderStateEnum, flow: FlowInterface, apiCall: any): void {
    this.emit(CheckoutPluginEventEnum.payeverCheckoutSantanderStateChanged, state);
    this.emit(CheckoutPluginEventEnum.payeverCheckoutSantanderStateChangedEx, {
      state,
      apiCall,
      flowId: flow ? flow.id : null,
      flowData: this.makeShortFlowData(flow),
    });
  }

  private emit(eventName: string, data: object | number | string): void {
    // Why we don't emit to ReplaySubject instead of window?
    // Events are shared between modules, other custom elements, etc. Not possible to use same service instance.

    if (window !== window.parent) {
      window.parent.postMessage(
        {
          event: eventName,
          value: data,
        },
        '*'
      );
    }

    // We duplicate to self for custom elements handling
    window.postMessage(
      {
        event: eventName,
        value: data,
      },
      '*'
    );
  }

  private makeShortFlowData(flow: FlowInterface): object {
    return flow ? {
      callback_url: flow.callbackUrl,
      cancelUrl: flow.cancelUrl,
      failure_url: flow.failureUrl,
      success_url: flow.successUrl,
      reference: flow.reference,
      total: flow.total,
      currency: flow.currency,
    } : null;
  }
}
