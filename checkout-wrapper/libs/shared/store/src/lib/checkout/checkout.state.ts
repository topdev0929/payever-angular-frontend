import { Injectable } from '@angular/core';
import { Action, Selector, SelectorOptions, State, StateContext } from '@ngxs/store';

import { ChannelSetDeviceSettingsInterface } from '@pe/checkout/api';
import {
  AccordionPanelInterface,
  CheckoutStateParamsInterface,
  FlowInterface,
  CheckoutSettingsInterface,
  PaymentMethodEnum,
  PaymentOptionInterface,
} from '@pe/checkout/types';

import { FlowState } from '../flow';
import { ParamsState } from '../params';
import { initialPaymentState, PaymentState, PaymentStateModel } from '../payment';
import { SettingsState } from '../settings';
import { StepsState } from '../steps';

import {
  ClearState,
  HidePayment,
  SetChannelSetSettings,
  SetLockedUi,
  SetPaymentComplete,
  SetPrevAction,
} from './checkout.actions';

export interface CheckoutStateModel {
  flow: FlowInterface;
  params: CheckoutStateParamsInterface;
  settings?: CheckoutSettingsInterface;
  steps: AccordionPanelInterface[];
  paymentComplete: boolean;
  lockedUi: boolean;
  hiddenPayments: PaymentMethodEnum[];
  payment: PaymentStateModel;
  channelSetSettings: ChannelSetDeviceSettingsInterface;
  prevAction: unknown;
}

const initialState: CheckoutStateModel = {
  flow: null,
  params: {},
  steps: null,
  hiddenPayments: null,
  lockedUi: null,
  paymentComplete: null,
  payment: initialPaymentState,
  channelSetSettings: null,
  prevAction: null,
};

const IGNORED_PAYMENTS: {
  [payment in PaymentMethodEnum]?: boolean;
} = {
  santander_factoring_de: true,
  santander_pos_factoring_de: true,
  santander_invoice_de: true,
  santander_pos_invoice_de: true,
};

@State<CheckoutStateModel>({
  name: 'checkout',
  children: [
    FlowState,
    ParamsState,
    SettingsState,
    StepsState,
    PaymentState,
  ],
  defaults: initialState,
})
@SelectorOptions({
  injectContainerState: false,
  suppressErrors: false,
})
@Injectable()
export class CheckoutState {

  @Selector() static paymentComplete(state: CheckoutStateModel) {
    return state.paymentComplete;
  }

  @Selector() static lockedUi(state: CheckoutStateModel) {
    return state.lockedUi;
  }

  @Selector() static hiddenPayments(state: CheckoutStateModel) {
    return state.hiddenPayments;
  }

  @Selector() static channelSetSettings(state: CheckoutStateModel) {
    return state.channelSetSettings;
  }

  @Selector() static prevAction(state: CheckoutStateModel) {
    return state.prevAction;
  }

  @Selector([
    FlowState.flow,
    SettingsState.settings,
    ParamsState.params,
    CheckoutState.hiddenPayments,
  ]) static paymentOptions(
    flow: FlowInterface,
    settings: CheckoutSettingsInterface,
    params: CheckoutStateParamsInterface,
    hiddenPayments: PaymentMethodEnum[],
  ) {

    return this.filterPaymentMethods(
      flow,
      settings,
      params,
      hiddenPayments,
    );
  }

  private static filterPaymentMethods(
    flow: FlowInterface,
    settings: CheckoutSettingsInterface,
    params: CheckoutStateParamsInterface,
    hiddenPayments: PaymentMethodEnum[]
  ): PaymentOptionInterface[] {
    const options: PaymentOptionInterface[] = flow.paymentOptions;
    let result: PaymentOptionInterface[] = settings
      ? (options || []).filter(option => (settings.paymentMethods || []).indexOf(option.paymentMethod) >= 0)
      : options;

    if (hiddenPayments) {
      result = result.filter(payment => hiddenPayments.indexOf(payment.paymentMethod) < 0);
    }

    if (!(window as any).ApplePaySession) { // If Apple Pay is not available if hide it
      result = result.filter(option => option.paymentMethod !== PaymentMethodEnum.APPLE_PAY);
    }

    if (flow.connectionId) {
      result = (params.forcePaymentOnly || params.forceChoosePaymentOnlyAndSubmit)
        ? result.filter(o => o.connections.find(c => c.id === flow.connectionId))
        : result;
    }

    if (params.forceSinglePaymentMethodOnly) {
      result = result.filter(o => o.paymentMethod === params.forceSinglePaymentMethodOnly);
    }

    const procutsSubs: {[key: string]: string[]} = {};
    (flow.cart || []).forEach(cart => procutsSubs[cart.productId] = []);
    Object.entries(procutsSubs || {}).forEach(([k, p]) => p.length === 0 ? delete procutsSubs[k] : null);

    // For Billing Subscription we filter only if any of item has Billing Subscription (plan)
    const values = Object.values(procutsSubs || {});
    if (values.length) {
      const intersections = values[0].reduce((acc, value, index) => {
          values.every(str => value === str[index]) && acc.push(value);

          return acc;
      }, []);

      result = result.filter(p => intersections.indexOf(p.paymentMethod) >= 0);
    }

    return result.filter(o => !IGNORED_PAYMENTS[o.paymentMethod]);
  }

  @Action(ClearState)
  clearState({ patchState }: StateContext<CheckoutStateModel>) {
    patchState(initialState);
  }

  @Action(SetLockedUi)
  setLockedUi(
    { patchState }: StateContext<CheckoutStateModel>,
    { lockedUi }: SetLockedUi,
  ) {
    patchState({ lockedUi });
  }

  @Action(SetPaymentComplete)
  setPaymentComplete(
    { patchState }: StateContext<CheckoutStateModel>,
    { payload }: SetPaymentComplete,
  ) {
    patchState({
      paymentComplete: payload ?? true,
    });
  }

  @Action(HidePayment)
  hidePayment(
    { getState, patchState }: StateContext<CheckoutStateModel>,
    { payload }: HidePayment,
  ) {
    const { hiddenPayments } = getState();

    patchState({ hiddenPayments: (hiddenPayments || []).concat(payload) });
  }

  @Action(SetChannelSetSettings)
  setChannelSetSettings(
    { patchState }: StateContext<CheckoutStateModel>,
    { channelSetSettings }: SetChannelSetSettings,
  ) {
    patchState({ channelSetSettings });
  }

  @Action(SetPrevAction)
  setPrevAction(
    { patchState }: StateContext<CheckoutStateModel>,
    { action }: SetPrevAction,
  ) {
    patchState({ prevAction: action });
  }
}
