import { Inject, Injectable, OnDestroy } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import {
  Action,
  Selector,
  SelectorOptions,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import produce from 'immer';
import { combineLatest, from, iif, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ApiService, NodeApiService } from '@pe/checkout/api';
import type { EncryptionService } from '@pe/checkout/encryption';
import { ProductsStateService } from '@pe/checkout/products';
import { FlowStorage } from '@pe/checkout/storage';
import {
  AddressTypeEnum,
  BusinessType,
  CartItemExInterface,
  FlowCloneReason,
  FlowInterface,
  NodePaymentCartItemInterface,
  NodePaymentInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  PollingConfig,
  REMEMBER_ME_KEY,
  ResponseErrorsInterface,
  SectionType,
} from '@pe/checkout/types';
import { extractStreetNameAndNumber } from '@pe/checkout/utils/address';
import { POLLING_CONFIG, pollWhile } from '@pe/checkout/utils/poll';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { AuthSelectors, Register } from '../auth';
import { CheckoutState, HidePayment, SetPaymentComplete } from '../checkout';
import { CloneFlow, FlowState } from '../flow';
import { SettingsState } from '../settings';
import { OpenStep } from '../steps';

import { PaymentProxyService } from './payment-proxy.service';
import {
  EditPayment,
  GetApiCallData,
  GetPaymentOptions,
  PatchPaymentDetails,
  PatchPaymentResponse,
  GetPayment,
  PostPayment,
  SetPaymentDetails,
  SetPaymentOptions,
  SetPayments,
  UpdatePayment,
  PollPaymentForStatus,
  PollUpdatePayment,
  ChangeFailedPayment,
  SetFormState,
  PatchFormState,
  ClearFormState,
  SetPaymentError,
} from './payment.actions';


type PaymentDetails = any;

interface PaymentData<T = any> {
  details: PaymentDetails;
  form: T;
  formOptions: any;
  error: ResponseErrorsInterface;
  response: NodePaymentResponseInterface<any>;
}

export type PaymentStateModel = {
  [Key in PaymentMethodEnum]: {
    [key: string]: PaymentData
  };
}

export const initialPaymentState = Object.values(PaymentMethodEnum).reduce(
  (acc, curr) => {
    acc[curr] = {};

    return acc;
  },
  {} as PaymentStateModel
);

@State<PaymentStateModel>({
  name: 'payment',
  defaults: initialPaymentState,
})
@SelectorOptions({
  injectContainerState: false,
  suppressErrors: false,
})
@Injectable()
export class PaymentState implements OnDestroy {

  private destroy$ = new Subject<boolean>();

  constructor(
    @Inject(POLLING_CONFIG) private pollingConfig: PollingConfig,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private store: Store,
    private apiService: ApiService,
    private nodeApiService: NodeApiService,
    private paymentProxyService: PaymentProxyService,
    private productsStateService: ProductsStateService,
    private flowStorage: FlowStorage,
    private apmService: ApmService,
  ) { }

  @Selector([
    PaymentState,
    FlowState.paymentMethod,
    FlowState.flow,
  ]) private static data(
    state: PaymentStateModel,
    paymentMethod: PaymentMethodEnum,
    flow: FlowInterface,
  ) {

    return state[paymentMethod]?.[flow.connectionId] ?? {};
  }

  @Selector([PaymentState.data]) static details(data: PaymentData) {
    return data.details;
  }

  @Selector([PaymentState.data]) static options(data: PaymentData) {
    return data.formOptions;
  }

  @Selector([PaymentState.data]) static response<T = any>(
    data: PaymentData,
  ): NodePaymentResponseInterface<T> {
    return data.response;
  }

  @Selector([PaymentState.data]) static form(data: PaymentData) {
    return data.form;
  }

  @Selector([PaymentState.data]) static error(data: PaymentData) {
    return data.error;
  }

  @Selector([
    FlowState.flow,
    PaymentState.details,
  ]) static paymentPayload(
    flow: FlowInterface,
    paymentDetails: PaymentDetails,
  ): NodePaymentInterface<any> {
    const companyData = (
      flow.businessType
      && flow.businessType !== BusinessType.B2C
      && flow?.company?.externalId
    )
      ? { company: flow.company }
      : {};

    return {
      paymentDetails,
      payment: {
        flowId: flow.id,
        reference: flow.reference,
        total: flow.total,
        amount: flow.amount,
        currency: flow.currency,
        customerName: flow.billingAddress ? `${flow.billingAddress?.firstName} ${flow.billingAddress?.lastName}`.trim() : null,
        customerEmail: flow.billingAddress?.email,
        businessId: flow.businessId,
        businessName: flow.businessName,
        deliveryFee: flow.deliveryFee || 0,
        shippingOrderId: flow.shippingOrderId,
        shippingMethodName: flow.shippingMethodName,
        apiCallId: flow.apiCall?.id,
        channel: flow.channel,
        channelSetId: flow.channelSetId,
        channelSource: flow.channelSource,
        channelType: flow.channelType,
        customerType: flow.customerType,
        ...(flow.apiCall?.company
          && typeof flow.apiCall?.company === 'object'
          && Object.keys(flow.apiCall?.company).length ? { company: flow.apiCall.company }
          : companyData),
        ...flow.billingAddress && { address: this.getAddress(flow, AddressTypeEnum.BILLING) },
        ...flow.shippingAddress && { shippingAddress: this.getAddress(flow, AddressTypeEnum.SHIPPING) },
        ...paymentDetails?.downPayment && { downPayment: paymentDetails.downPayment },
        ...flow.shippingOption && { shippingOption: flow.shippingOption },
      },
      paymentItems: (flow.cart || []).map(item => ({
        identifier: item.identifier,
        name: item.name,
        price: item.price,
        priceNet: item.priceNet,
        vatRate: item.vat,
        thumbnail: item.image,
        quantity: item.quantity,
        sku: item.sku,
        productId: item.productId || item._id || item.id,
        options: item.options,
        extraData: {
          subscriptionPlan: null,
        },
      })) || [],
      ...paymentDetails?.forceRedirect && { forceRedirect: paymentDetails.forceRedirect },
      ...flow.apiCall?.skipHandlePaymentFee && { skipHandlePaymentFee: flow.apiCall.skipHandlePaymentFee },
    };
  }

  private static getAddress(flow: FlowInterface, addressType: AddressTypeEnum) {
    const key = `${addressType}Address` as keyof FlowInterface;

    return {
      city: flow[key].city,
      country: flow[key].country,
      email: flow[key].email,
      firstName: flow[key].firstName,
      lastName: flow[key].lastName,
      phone: flow[key].phone,
      salutation: flow[key].salutation,
      street: flow[key].street,
      streetName: flow[key].streetName || extractStreetNameAndNumber(flow[key].street)[0],
      streetNumber: flow[key].streetNumber || extractStreetNameAndNumber(flow[key].street)[1],
      zipCode: flow[key].zipCode,
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @Action(SetPayments)
  setPayments({ getState, setState }: StateContext<PaymentStateModel>, action: SetPayments) {
    const payments = getState();

    setState({
      ...initialPaymentState,
      ...payments,
      ...action.payload,
    });
  }

  @Action(SetPaymentDetails)
  setPayment(
    { getState, patchState }: StateContext<PaymentStateModel>,
    action: SetPaymentDetails,
  ) {
    const payments = getState();
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);

    const state = produce(payments[paymentMethod], (draft) => {
      draft[connectionId] = {
        ...draft[connectionId],
        details: action.payload,
      };
    });

    patchState({ [paymentMethod]: state });
  }

  @Action(PatchPaymentDetails)
  patchPayment(
    { getState, patchState }: StateContext<PaymentStateModel>,
    action: PatchPaymentDetails,
  ) {
    const payments = getState();
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const payload = this.appendGuestTokenToRedirectUrls(action.payload);

    const state = produce(
      payments[paymentMethod],
      (draft) => {
        draft[connectionId] = {
          ...draft[connectionId],
          details: {
            ...draft[connectionId]?.details,
            ...payload,
          },
        } as PaymentData;
      },
    );

    patchState({ [paymentMethod]: state });
  }

  @Action(PatchPaymentResponse)
  patchResponse(
    { getState, patchState }: StateContext<PaymentStateModel>,
    action: PatchPaymentResponse,
  ) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();

    const state = produce(
      payment,
      (draft) => {
        draft[connectionId] = {
          ...draft[connectionId],
          response: action.payload,
        };
      },
    );

    patchState({ [paymentMethod]: state });
  }

  @Action(GetPaymentOptions, { cancelUncompleted: true })
  getPaymentOptions(
    { dispatch }: StateContext<PaymentStateModel>,
  ) {
    const flow = this.store.selectSnapshot(FlowState.flow);

    return this.apiService.getFormOptions(
      flow.id,
      flow.connectionId,
    ).pipe(
      switchMap(options => dispatch(new SetPaymentOptions(options))),
    );
  }

  @Action(SetPaymentOptions)
  setPaymentOptions(
    { getState, patchState }: StateContext<PaymentStateModel>,
    action: SetPaymentOptions,
  ) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();

    try {
      const state = produce(payment, (draft) => {
        draft[connectionId] = {
          ...draft?.[connectionId],
          formOptions: action.payload,
        };
      });

      patchState({ [paymentMethod]: state });
    } catch {
      if (!payment?.[connectionId]) {
        const payments = this.store.selectSnapshot(PaymentState);
        const flow = this.store.selectSnapshot(FlowState);
        this.apmService.apm.setCustomContext({
          payments,
          flow,
        });
        this.apmService.apm.captureError('SetPaymentOptions error');
      }
    }
  }

  @Action(GetApiCallData)
  getApiCallData(
    { dispatch }: StateContext<PaymentStateModel>,
    action: GetApiCallData,
  ) {
    const flowId = this.store.selectSnapshot(FlowState.flowId);

    return this.apiService.getApiCallData(flowId).pipe(
      switchMap((apiCall) => {
        const state = produce(
          action.payload,
          (draft) => {
            draft._apiCall = apiCall;
          },
        );

        return dispatch(new PatchPaymentResponse(state));
      }),
    );
  }

  @Action(PostPayment, { cancelUncompleted: true })
  postPayment(
    { dispatch }: StateContext<PaymentStateModel>,
  ) {
    const flow = this.store.selectSnapshot(FlowState.flow);
    const payload = this.store.selectSnapshot(PaymentState.paymentPayload);
    const token = this.store.selectSnapshot(AuthSelectors.accessToken);

    return combineLatest([
      this.loadEncryptionModule(),
      this.prepareNodePaymentData<unknown>(payload).pipe(
        switchMap((data) => {
          const remembeMe = this.flowStorage.getData<boolean>(flow.id, REMEMBER_ME_KEY);
          const flowId = this.store.selectSnapshot(FlowState.flowId);

          if (remembeMe && !token) {
            return dispatch(new Register(
              flowId,
              {
                country: data.payment?.address?.country.toLowerCase(),
                email: data.payment.customerEmail,
                first_name: data.payment.address?.firstName,
                last_name: data.payment.address?.lastName,
                forceGeneratePassword: true,
              },
              {
                registrationOrigin: {
                  url: window.location.href,
                  account: 'personal',
                },
              },
            )).pipe(
              map(() => data),
            );
          }

          return of(data);
        }),
      ),
    ]).pipe(
      switchMap(([encryptionService, data]) =>
        from(encryptionService.encryptWithSalt(data, data.payment.businessId)).pipe(
          switchMap(encryptedData => this.nodeApiService.submitPayment<unknown>(
            flow.connectionId,
            encryptedData,
          )),
        ),
      ),
      switchMap(response => response.payment.apiCallId
        ? dispatch(new GetApiCallData(response))
        : dispatch(new PatchPaymentResponse(response))
      ),
      catchError((err) => {
        this.store.dispatch([new SetPaymentError(err), new SetPaymentComplete()]);

        return throwError(err);
      })
    );
  }

  @Action(EditPayment, { cancelUncompleted: true })
  editPayment(
    { dispatch }: StateContext<PaymentStateModel>,
    action: EditPayment,
  ) {
    const flow = this.store.selectSnapshot(FlowState.flow);
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { forceRedirect, ...payload } = this.store.selectSnapshot(PaymentState.paymentPayload);

    return this.prepareNodePaymentData(payload).pipe(
      switchMap(data => this.nodeApiService.editTransaction(
        paymentMethod,
        flow.businessId,
        action.payload,
        flow.id,
        data,
      )),
      switchMap(() => dispatch(new UpdatePayment(action.payload))),
    );
  }

  @Action(UpdatePayment, { cancelUncompleted: true })
  updatePayment({ dispatch }: StateContext<PaymentStateModel>, action: UpdatePayment) {
    const flow = this.store.selectSnapshot(FlowState.flow);

    return this.nodeApiService.updatePayment(
      flow.connectionId,
      action.payload,
    ).pipe(
      switchMap(response => response.payment.apiCallId
        ? dispatch(new GetApiCallData(response))
        : dispatch(new PatchPaymentResponse(response))
      ),
    );
  }

  @Action(PollUpdatePayment, { cancelUncompleted: true })
  pollUpdatePayment(
    { getState, dispatch }: StateContext<PaymentStateModel>,
    action: PollUpdatePayment,
  ) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();

    return this.nodeApiService.updatePayment(
      connectionId,
      payment[connectionId].response.id,
    ).pipe(
      pollWhile(
        this.pollingConfig,
        () => {
          const { [paymentMethod]: payment } = getState();

          return !action.payload.includes(payment[connectionId].response.payment.status);
        },
        false,
      ),
      switchMap(response => response.payment.apiCallId
        ? dispatch(new GetApiCallData(response))
        : dispatch(new PatchPaymentResponse(response))
      ),
    );
  }

  @Action(GetPayment, { cancelUncompleted: true })
  getPayment({ dispatch, getState }: StateContext<PaymentStateModel>) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();

    return this.nodeApiService.requestPayment(connectionId, payment[connectionId].response.id).pipe(
      switchMap(response => dispatch(new PatchPaymentResponse(response))),
    );
  }

  @Action(PollPaymentForStatus, { cancelUncompleted: true })
  pollPaymentForStatus(
    { dispatch, getState }: StateContext<PaymentStateModel>,
    action: PollPaymentForStatus,
  ) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();

    return this.nodeApiService.requestPayment(connectionId, payment[connectionId].response.id).pipe(
      pollWhile(
        this.pollingConfig,
        () => {
          const { [paymentMethod]: payment } = getState();

          return !action.payload.includes(payment[connectionId].response.payment.status);
        },
        false,
      ),
      switchMap(response => response.payment.apiCallId
        ? dispatch(new GetApiCallData(response))
        : dispatch(new PatchPaymentResponse(response))
      ),
    );
  }

  @Action(ChangeFailedPayment)
  changeFailedPayment(
    { dispatch }: StateContext<PaymentStateModel>,
    { payload }: ChangeFailedPayment,
  ) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const paymentOptions = this.store.selectSnapshot(CheckoutState.paymentOptions);
    const flow = this.store.selectSnapshot(FlowState.flow);

    return iif(
      () => paymentOptions.length < 1,
      new Observable((sub) => {
        window.location.href = payload.redirectUrl || flow.apiCall.cancelUrl || flow.apiCall.failureUrl;

        sub.next();
        sub.complete();
      }),
      dispatch([
        new SetPaymentError(null),
        ...!flow.disableValidation ? [new HidePayment(paymentMethod)] : [],
        new CloneFlow({
          reason: FlowCloneReason.ChangePaymentOnFail,
          skipData: false,
          redirect: true,
        }),
      ]).pipe(
        switchMap(() => dispatch([
          new SetPaymentComplete(false),
          new OpenStep(SectionType.ChoosePayment),
        ])),
      )
    );
  }

  @Action(SetFormState)
  setFormState<T extends { 'pe-form-token': string }>(
    { getState, patchState }: StateContext<PaymentStateModel>,
    { form }: SetFormState<T>,
  ) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();


    delete form['pe-form-token'];

    const state = produce(payment, (draft) => {
      draft[connectionId] = {
        ...draft[connectionId],
        form,
      };
    });

    patchState({ [paymentMethod]: state });
  }

  @Action(PatchFormState)
  patchFormState<T extends { 'pe-form-token': string }>(
    { getState, patchState }: StateContext<PaymentStateModel>,
    { form }: PatchFormState<T>,
  ) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();

    delete form['pe-form-token'];

    const state = produce(payment, (draft) => {
      draft[connectionId] = {
        ...draft[connectionId],
        form: {
          ...draft[connectionId]?.form,
          ...form,
        },
      } as PaymentData;
    });

    patchState({ [paymentMethod]: state });
  }

  @Action(ClearFormState)
  clearFormState({ getState, patchState }: StateContext<PaymentStateModel>) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();

    const state = produce(payment, (draft) => {
      draft[connectionId] = {
        ...draft[connectionId],
        form: null,
      };
    });

    patchState({ [paymentMethod]: state });
  }

  @Action(SetPaymentError)
  paymentError(
    { getState, patchState }: StateContext<PaymentStateModel>,
    { error }: SetPaymentError) {
    const paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);
    const { connectionId } = this.store.selectSnapshot(FlowState.flow);
    const { [paymentMethod]: payment } = getState();

    const state = produce(payment, (draft) => {
      draft[connectionId] = {
        ...draft[connectionId],
        error,
      };
    });

    patchState({ [paymentMethod]: state });
  }

  private loadEncryptionModule(): Observable<EncryptionService> {
    return from(
      import('@pe/checkout/encryption')
        .then(({ EncryptionService }) => new EncryptionService()),
    );
  }

  private prepareNodePaymentData<PaymentDetails>(
    data: NodePaymentInterface<PaymentDetails>,
  ): Observable<NodePaymentInterface<PaymentDetails>> {

    const settings = this.store.selectSnapshot(SettingsState.settings);

    const productIds = data.paymentItems.reduce((acc, curr) => {
      if (curr.productId) {
        acc.push(curr.productId);
      }

      return acc;
    }, []);

    let req$ = of(data);

    if (productIds.length) {
      req$ = this.productsStateService.getProductsOnce(productIds).pipe(
        map((productsFull) => {
          const fullCartItems = this.productsStateService.cartItemsToExtended(
            productsFull,
            data.paymentItems.map(p => ({ id: p.productId, productId: p.productId, options: p.options })),
            settings,
          );

          data.paymentItems.forEach((item) => {
            // When product doesn't exists on product server (come directly from shop)
            //  it can have uuid and id as null
            const full = fullCartItems.find(c => c.productId
              || c.id
              || c.identifier
              && c.productId === item.productId
              || c.id === item.productId
              || c.identifier === item.identifier
            );

            // Sometimes product can be non-existing on product server (come directly from shop)
            if (full && !Object.values(full).every(f => f === undefined)) {
              this.cartItemToNodeItem(full, item);
            }

            const productFull = productsFull.find(c => c.uuid === item.productId || c.id === item.productId);
            if (productFull) {
              item.description = productFull.description;
            }
          });

          return data;
        }),
      );
    }

    return req$;
  }

  private cartItemToNodeItem(
    cartItem: CartItemExInterface,
    nodeItem: NodePaymentCartItemInterface,
  ): void {
    if (cartItem && nodeItem) {
      nodeItem.identifier = cartItem.identifier;
      nodeItem.name = cartItem.name;
      nodeItem.price = cartItem.price;
      nodeItem.sku = cartItem.sku;
      nodeItem.options = cartItem.options;

      nodeItem.thumbnail = cartItem.image;
      nodeItem.vatRate = cartItem.vat;
      nodeItem.url = cartItem.image;
      nodeItem.priceNet = cartItem.priceNet || (nodeItem.price / (1.0 + nodeItem.vatRate)); // Price without taxes
    }
  }

  private appendGuestTokenToRedirectUrls(payload: PaymentDetails): PaymentDetails {
    if (!window.origin.includes(this.env.frontend.checkoutWrapper)) {
      const accessToken = this.store.selectSnapshot(AuthSelectors.accessToken);

      return produce(payload, (draft: PaymentDetails) => {
        const fields = [
          'frontendSuccessUrl',
          'frontendFinishUrl',
          'frontendFailureUrl',
          'frontendCancelUrl',
          'postbackUrl',
        ];
        fields.forEach((field) => {
          if (draft[field]?.includes(this.env.frontend.checkoutWrapper)) {
            const url = new URL(draft[field]);
            url.searchParams.set('guest_token', accessToken);
            draft[field] = url.toString();
          }
        });
      });
    }

    return payload;
  }
}
