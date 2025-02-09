import { Injectable, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Action,
  Selector,
  SelectorOptions,
  State,
  StateContext,
} from '@ngxs/store';
import { forkJoin, of, Subject, throwError } from 'rxjs';
import { catchError, map, skipWhile, switchMap, tap } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { FlowStorage } from '@pe/checkout/storage';
import {
  CheckoutWindow,
  FlowInterface,
  PaymentOptionInterface,
  PaymentOptionConnectionInterface,
  ShippingAddressSettings,
} from '@pe/checkout/types';
import { PE_ENV } from '@pe/common';

import { SetTokens } from '../auth';
import { ClearState, SetChannelSetSettings, SetPaymentComplete } from '../checkout';

import {
  AttachPaymentCode,
  CloneFlow,
  CreateFinexpFlow,
  CreateFlow,
  FinishFlow,
  GeneratePaymentCode,
  GetFlow,
  InitFlow,
  PatchAddress,
  PatchFlow,
  SetAddress,
  SetClonedFlow,
  SetFlow,
  UpdateAddress,
} from './flow.actions';

@State<FlowInterface>({
  name: 'flow',
  defaults: null,
})
@SelectorOptions({
  injectContainerState: false,
  suppressErrors: false,
})
@Injectable()
export class FlowState implements OnDestroy {

  private env = inject(PE_ENV);

  loader = (window as CheckoutWindow).pe_pageFlowLoader;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private apiService: ApiService,
    private flowStorage: FlowStorage,
  ) {}

  @Selector() static flow(state: FlowInterface) {
    return state;
  }

  @Selector() static flowId(state: FlowInterface) {
    return state.id;
  }

  @Selector() static businessId(state: FlowInterface) {
    return state.businessId;
  }

  @Selector() static company(state: FlowInterface) {
    return state.company;
  }

  @Selector() static paymentOption(state: FlowInterface) {
    const { paymentOptions, connectionId } = state;
    const paymentOption = paymentOptions.find(payment =>
      payment.connections.find(
        connection => connection.id === connectionId
      )
    );

    return paymentOption;
  }

  @Selector([FlowState.paymentOption]) static paymentMethod(state: PaymentOptionInterface) {
    return state?.paymentMethod;
  }

  @Selector([FlowState.activeConnection]) static paymentVersion(connection: PaymentOptionConnectionInterface) {
    return connection?.version;
  }

  @Selector() static activeConnection(state: FlowInterface) {
    const { paymentOptions, connectionId } = state;
    const connection = paymentOptions.reduce((acc, option) => {
      option.connections.find((connection) => {
        if (connection.id === connectionId) {
          acc = connection;
        }
      });

      return acc;
    }, <PaymentOptionConnectionInterface>null);

    return connection;
  }

  @Selector([FlowState.flow, FlowState.activeConnection]) static shippingAddressSettings(
    flow: FlowInterface, connection: PaymentOptionConnectionInterface
  ): ShippingAddressSettings {
    if (connection) {
      return connection;
    }

    const settings = flow.paymentOptions.reduce((acc, paymentOption) => {
      acc.push(...paymentOption.connections);

      return acc;
    }, <ShippingAddressSettings[]>[]);

    return {
      shippingAddressAllowed: settings.some(s => s.shippingAddressAllowed),
    };
  }

  @Selector([FlowState.flow]) static address(flow: FlowInterface) {
    return flow.billingAddress;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Action(InitFlow)
  initFlow(
    { setState }: StateContext<FlowInterface>,
    { flow }: InitFlow,
  ) {
    setState(flow);
  }

  @Action(GetFlow, { cancelUncompleted: true })
  getFlow({ getState, dispatch }: StateContext<FlowInterface>, action: GetFlow) {
    const flow = getState();

    return flow?.id === action.flowId
      ? flow
      : this.apiService._getFlow(action.flowId).pipe(
        tap(flow => dispatch(new SetFlow(flow))),
      );
  }

  @Action(CreateFlow, { cancelUncompleted: true })
  createFlow(
    { dispatch }: StateContext<FlowInterface>,
    action: CreateFlow,
  ) {
    const {
      amount,
      billingAddress,
      cart,
      channelSetId,
      currency,
      flowRawData,
      generatePaymentCode,
      merchantMode,
      paymentCodeId,
      phoneNumber,
      reference,
      source,
    } = action.payload;

    const data: FlowInterface = {
      ...flowRawData || {},
      ...billingAddress && { billingAddress },
      ...channelSetId && { channelSetId },
      ...merchantMode && { pos_merchant_mode: merchantMode },
      ...currency && { currency },
      ...amount && { amount },
      ...reference && { reference },
      ...cart?.length && {
        cart,
      },
    };

    return dispatch([
      new ClearState(),
      ...window.origin === this.env.frontend.checkoutWrapper
        ? [new SetTokens({ accessToken: null })]
        : [],
    ]).pipe(
      switchMap(() => this.apiService._createFlow(data).pipe(
        switchMap(flow => flow.guestToken
          ? dispatch(new SetTokens({ accessToken: flow.guestToken })).pipe(
            map(() => flow),
          )
          : of(flow)
        ),
        switchMap(flow => dispatch([
          new SetFlow(flow),
          ...(generatePaymentCode
            ? [new GeneratePaymentCode({
              channelSetId,
              paymentFlowId: flow.id,
              ...amount && { amount },
              ...phoneNumber && { phoneNumber },
              ...source && { source },
            })]
            : []),
          ...(paymentCodeId
            ? [new AttachPaymentCode({
                flowId: flow.id,
                paymentCodeId,
              })]
            : []),
        ])),
        ),
    ));
  }

  @Action(CreateFinexpFlow)
  createFinexpFlow({ dispatch }: StateContext<FlowInterface>, action: CreateFinexpFlow) {
    const { channelSetId, ...payload } = action.payload;

    return this.apiService._createFinExpFlow(channelSetId, payload).pipe(
      switchMap(flow =>
        dispatch([
          new ClearState(),
          new SetFlow(flow),
          ...flow.guestToken ? [new SetTokens({ accessToken: flow.guestToken })] : [],
        ])
      )
    );
  }

  @Action(PatchFlow)
  patchFlow(
    { getState, patchState }: StateContext<FlowInterface>,
    { payload }: PatchFlow,
  ) {
    const flow = getState();

    patchState(payload);

    return this.apiService._patchFlow(flow.id, payload).pipe(
      tap(flow => patchState(flow)),
      catchError((err) => {
        patchState(flow);

        return throwError(err);
      })
    );
  }

  @Action(SetAddress)
  setAddress({ patchState, getState }: StateContext<FlowInterface>, action: PatchAddress) {
    const flow = getState();

    patchState({
      ...flow,
      [`${action.payload.type}Address`]: {
        ...action.payload,
        id: null,
      } as Partial<FlowInterface>,
    });

  }

  @Action(PatchAddress)
  patchAddress({ dispatch }: StateContext<FlowInterface>, action: PatchAddress) {
    const flow = {
      [`${action.payload.type}Address`]: {
        ...action.payload,
        id: null,
      },
    } as Partial<FlowInterface>;

    return dispatch(new PatchFlow(flow));
  }

  @Action(UpdateAddress)
  updateAddress({ getState, patchState, dispatch }: StateContext<FlowInterface>, action: PatchAddress) {
    const state = getState();

    patchState({
      ...state,
      [`${action.payload.type}Address`]: action.payload,
    });

    return dispatch(new PatchAddress(action.payload));
  }

  @Action(CloneFlow, { cancelUncompleted: true })
  cloneFlow({ dispatch, getState }: StateContext<FlowInterface>, action: CloneFlow) {
    const flow = getState();
    const { reason, redirect } = action.payload;
    const flowId = flow?.id ?? action.payload.flowId;

    return this.apiService._cloneFlow(flowId, reason).pipe(
      switchMap((clonedFlow) => {
        if (!action.payload.skipData) {
          this.flowStorage.clone(flowId, clonedFlow.id);
        }

        return dispatch(new SetFlow({
          ...clonedFlow,
          connectionId: getState()?.connectionId ?? clonedFlow?.connectionId,
        })).pipe(
          skipWhile(() => !redirect),
          tap(() => {
            !window.origin.includes(this.env.frontend.commerceos)
            && this.router.navigate(['/pay', clonedFlow.id], {
              queryParamsHandling: '',
              preserveFragment: false,
              replaceUrl: true,
            });
          })
        );
      }),
    );
  }

  @Action(GeneratePaymentCode)
  generatePaymentCode({ dispatch }: StateContext<FlowInterface>, action: GeneratePaymentCode) {
    const { channelSetId, ...params } = action.payload;

    return this.apiService.getChannelSetDeviceSettings(channelSetId).pipe(
      switchMap(settings => forkJoin([
          dispatch(new SetChannelSetSettings(settings)),
          ...settings.enabled ? [this.apiService.createPaymentCode(channelSetId, params)] : [],
        ])),
    );
  }

  @Action(AttachPaymentCode)
  attachPaymentCode(ctx: StateContext<FlowInterface>, action: AttachPaymentCode) {
    const { flowId, paymentCodeId } = action.payload;

    return this.apiService.attachPaymentExternalCodeToFlow(flowId, paymentCodeId);
  }

  @Action(SetFlow)
  setFlow({ patchState }: StateContext<FlowInterface>, action: SetFlow) {
    const { payload: flow } = action;

    patchState(flow);
  }

  @Action(SetClonedFlow)
  setClonedFlow({ dispatch }: StateContext<FlowInterface>, action: SetClonedFlow) {
    return dispatch([
      new SetFlow(action.payload),
    ]);
  }

  @Action(FinishFlow)
  finishFlow({ dispatch, getState }: StateContext<FlowInterface>) {
    const { id } = getState();

    return this.apiService._finishFlow(id).pipe(
      switchMap(flow => dispatch([
        new SetFlow(flow),
        new SetPaymentComplete(true),
      ])),
    );
  }
}
