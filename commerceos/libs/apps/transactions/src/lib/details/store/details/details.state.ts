/* eslint-disable no-underscore-dangle */
import { Injectable, inject } from '@angular/core';
import { Action, Selector, SelectorOptions, State, StateContext } from '@ngxs/store';
import { cloneDeep } from 'lodash-es';
import { switchMap } from 'rxjs/operators';

import { PaymentMethodEnum } from '@pe/checkout-types';
import { TranslateService } from '@pe/i18n-core';

import { ApiService, SettingsService } from '../../../services';
import {
  ActionInterface,
  ActionTypeEnum,
  DetailInterface,
  DetailInternalKeys,
  SantanderAppSpecificStateType,
} from '../../../shared';

import { HIDDEN_ACTIONS } from './constants';
import { GetActions, GetDetails, SetActions, SetDetails } from './details.action';

@State<DetailInterface>({
  name: 'details',
  defaults: null,
})
@SelectorOptions({
  injectContainerState: false,
  suppressErrors: false,
})
@Injectable()
export class DetailsState {

  private apiService = inject(ApiService);
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);

  @Selector() static orderId(state: DetailInterface) {
    return state.transaction.uuid;
  }

  @Selector() static order(state: DetailInterface) {
    return state;
  }

  @Selector() static quantity(state: DetailInterface): number {
    return state.cart.items?.reduce((acc, item) => acc += item.quantity, 0) ?? 0;
  }

  @Selector() static itemsArray(state: DetailInterface) {
    return state.cart.items.reduce((acc, item) => ({
      ...acc,
      [item.identifier]: item,
    }), {});
  }

  @Selector() static downPayment(state: DetailInterface) {
    return +state.payment_option.down_payment || 0;
  }

  @Selector() static iban(state: DetailInterface) {
    return state.details.order.iban
      ? `**** ${state.details.order.iban.replace(/\s/g, '').slice(-4)}`
      : null;
  }

  @Selector() static actions(state: DetailInterface) {
    return state.actions;
  }

  @Selector() static actionsEnabled(state: DetailInterface) {
    return state.actions?.filter((action: ActionInterface) => action.enabled && !action.hidden);
  }

  @Action(GetDetails)
  getDetails({ getState, dispatch }: StateContext<DetailInterface>, action: GetDetails) {
    const details = action.bypassCacheFlag ? undefined : getState();

    return details || this.apiService.getTransactionDetails(action.orderId).pipe(
      switchMap(details => dispatch(new SetDetails(details))),
    );
  }

  @Action(SetDetails)
  setDetails({ getState, patchState }: StateContext<DetailInterface>, action: SetDetails) {
    const state = getState();
    patchState({
      ...state,
      ...this.rebuildDetails(action.details),
    });
  }

  @Action(GetActions)
  getActions({ dispatch }: StateContext<ActionInterface[]>, action: GetActions) {

    if (this.settingsService.isPersonal || this.settingsService.isAdmin) {
      return dispatch(new SetActions([]));
    }

    return this.apiService.getTransactionActions(action.orderId).pipe(
      switchMap(actions => dispatch(new SetActions(actions))),
    );
  }

  @Action(SetActions)
  setActions({ getState, patchState }: StateContext<DetailInterface>, { actions }: SetActions) {
    const state = getState();

    const filtered = actions.map(item => ({
      ...item,
      hidden: HIDDEN_ACTIONS.includes(item.action),
    }));

    patchState({
      ...state,
      actions: this.rebuildActions(filtered, state),
    });
  }

  private rebuildDetails(details: DetailInterface): DetailInterface {
    const order: DetailInterface = cloneDeep(details);
    if (order.actions.length) {
      order.actions = this.rebuildActions(order.actions, order);
    }

    switch (order.payment_option.type) {
      case PaymentMethodEnum.ZINIA_BNPL_DE:
      case PaymentMethodEnum.ZINIA_BNPL:
      case PaymentMethodEnum.ZINIA_POS_SLICE_THREE:
      case PaymentMethodEnum.ZINIA_INSTALMENT_DE:
      case PaymentMethodEnum.ZINIA_POS_INSTALLMENT_DE:
      case PaymentMethodEnum.ZINIA_INSTALMENT:
      case PaymentMethodEnum.ZINIA_POS_INSTALLMENT:
      case PaymentMethodEnum.ZINIA_SLICE_THREE_DE:
      case PaymentMethodEnum.ZINIA_POS_SLICE_THREE_DE:
      case PaymentMethodEnum.ZINIA_POS:
      case PaymentMethodEnum.ZINIA_POS_DE:
      case PaymentMethodEnum.ZINIA_SLICE_THREE:
        order._ziniaId = order.details.order_id;
        order._ziniaTransferReference = order.details.order.pan_id;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT:
        order._isSantander = true;
        order._isSantanderDe = true;
        order._santanderApplicationNo = order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_AT:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_AT:
        order._isSantander = true;
        order._isSantanderAt = true;
        order._santanderApplicationNo = order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_DK:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_DK:
        order._isSantander = true;
        order._isSantanderDk = true;
        order._santanderApplicationNo = order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_NO:
      case PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_NO:
        order._isSantander = true;
        order._isSantanderNo = true;
        order._santanderApplicationNo = order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_NL:
        order._isSantander = true;
        order._isSantanderNl = true;
        order._santanderApplicationNo = order.details.order.application_no;
        break;
      case PaymentMethodEnum.SANTANDER_INVOICE_NO:
      case PaymentMethodEnum.SANTANDER_POS_INVOICE_NO:
        order._isSantander = true;
        order._isSantanderNo = true;
        order._applicationNo = order.details.order.pan_id;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_SE:
        order._isSantander = true;
        break;
      case PaymentMethodEnum.SANTANDER_INVOICE_DE:
      case PaymentMethodEnum.SANTANDER_POS_INVOICE_DE:
        order._isSantanderPosDeFactInvoice = order.payment_option.type === PaymentMethodEnum.SANTANDER_POS_INVOICE_DE;
        order._isSantander = true;
        order._isSantanderDe = true;
        order._panId = order.details.order.pan_id;
        break;
      case PaymentMethodEnum.SANTANDER_FACTORING_DE:
      case PaymentMethodEnum.SANTANDER_POS_FACTORING_DE:
        order._isSantanderPosDeFactInvoice = order.payment_option.type === PaymentMethodEnum.SANTANDER_POS_FACTORING_DE;
        order._isSantander = true;
        order._panId = order.details.order.pan_id;
        break;
      case PaymentMethodEnum.SANTANDER_INSTALLMENT_FI:
        order._isSantander = true;
        order._santanderApplicationNo = order.details.order.application_no;
        order._panId = order.details.order.pan_id;
        break;
      default:
        break;
    }

    if (order.payment_option.type === 'santander_pos_installment') {
      const specificStatusAvailable: SantanderAppSpecificStateType[] = [
        'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS',
        'STATUS_SANTANDER_DEFERRED',
      ];
      order._showSantanderDeQr = specificStatusAvailable.includes(order.status.specific);
    }


    return DetailInternalKeys.reduce((acc, key) => {
      acc[key] = acc[key] || undefined;

      return acc;
    }, order);
  }

  private rebuildActions(baseActions: ActionInterface[], order: DetailInterface): ActionInterface[] {
    const actions: ActionInterface[] = [];
    const isSantanderNoInvoice = order.payment_option.type === PaymentMethodEnum.SANTANDER_INVOICE_NO;
    baseActions.forEach((actionData: ActionInterface) => {
      actionData = cloneDeep(actionData);
      if (isSantanderNoInvoice && actionData.action === ActionTypeEnum.Edit) {
        actionData.action = ActionTypeEnum.Update;
        actions.push(actionData);
      } else if (actionData.action === ActionTypeEnum.Edit && (
        order._isSantanderPosDeFactInvoice ||
        order._isSantanderNo)) {
        actionData.action = ActionTypeEnum.Change_Amount;
        actions.push(actionData);
        if (order._isSantanderPosDeFactInvoice) {
          actionData = cloneDeep(actionData);
          actionData.action = ActionTypeEnum.EditReference;
          actions.push(actionData);
        }
      } else {
        actions.push(actionData);
      }
    });

    actions.forEach((action: ActionInterface) => {
      if (action.enabled) {
        action.label = this.translateService.translate(`transactions.details.actions.labels.${action.action}`);
      }
    });

    return actions;
  }
}
