import { Injectable } from '@angular/core';
import { Observable, Subject, of, throwError, combineLatest } from 'rxjs';
import { catchError, flatMap, map, share, tap } from 'rxjs/operators';
import { cloneDeep, findLast, forEach, forIn, minBy } from 'lodash-es';

import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { SnackBarService } from '@pe/ng-kit/modules/snack-bar';
import { PlatformService } from '@pe/ng-kit/modules/common';

import {
  ActionInterface,
  ActionRequestInterface,
  ActionRequestRefundItemsInterface,
  BusinessVatInterface,
  DetailInterface,
  ItemInterface,
  OrderHistoryInterface,
  RefundItemsInterface,
  ActionType,
  PaymentType,
  SantanderAppSpecificStateType,
  PaymentInterface
} from '../../shared';
import { ApiService, SettingsService, StatusType } from '../../shared';

import { AuthService } from '@pe/ng-kit/modules/auth';

export interface PaymentCodeInterface {
  _id: string;
  code: string;
}


@Injectable()
export class DetailService {

  welcomeShown: boolean = false;

  private businessVatCashed: BusinessVatInterface[];
  private businessVatObservable: Observable<BusinessVatInterface[]>;
  private orderId: string = null;
  private order: DetailInterface = null;
  private order$: Observable<DetailInterface> = null;
  private orderPaymentId: string = null;
  private orderPayment: PaymentInterface = null;
  private orderPayment$: Observable<PaymentInterface> = null;
  private resetSubject$: Subject<boolean> = new Subject<boolean>();
  private loadingSubject$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private settingsService: SettingsService,
    private snackBarService: SnackBarService,
    private translateService: TranslateService,
    private platformService: PlatformService
  ) {
    this.resetSubject$.next(false);
  }

  set loading(value: boolean) {
    this.loadingSubject$.next(value);
  }

  get loading$(): Observable<boolean> {
    return this.loadingSubject$.asObservable();
  }

  set reset(value: boolean) {
    this.resetSubject$.next(value);
  }

  get reset$(): Observable<boolean> {
    return this.resetSubject$.asObservable();
  }

  getData(businessUuid: string, orderId: string, reset: boolean = false): Observable<DetailInterface> {
    if (!reset && this.order$ && this.orderId === orderId) {
      return this.order$;
    }
    else if (reset || this.orderId !== orderId) {
      this.reset = false;
      this.orderId = orderId;
      this.order$ = this.apiService.getTransactionDetails(this.orderId).pipe(
        flatMap((order: DetailInterface) => {
          this.order = order;
          return combineLatest([
            this.apiService.getShippingActions(order),
            this.apiService.getMailerActions(order)
          ]);
        }),
        map(([shippingActions, mailerActionsUrl]) => {
          this.order._shippingActions = shippingActions;
          this.order._mailerActions = mailerActionsUrl;

          this.makeItemsArray();
          this.compileData();
          this.initOrderPaymentType();
          this.initSantander();
          this.rebuildOrders(); // Must go as last
          this.order$ = null;
          this.loading = false;
          this.platformService.microLoaded = true;

          return this.order;
        }),
        catchError((error: any) => {
          if (Number(error.status) === 403) {
            this.authService.redirectToEntryPageWithUrl('/entry', window.location.href);
          }
          this.order = null;
          this.order$ = null;
          return throwError(error);
        }),
        share());
      return this.order$;
    }
    else {
      return of(this.order);
    }
  }

  getOrderPayment(orderId: string, reset: boolean = false): Observable<PaymentInterface> {
    if (!reset && this.orderPayment$ && this.orderPaymentId === orderId) {
      return this.orderPayment$;
    }
    else if (reset || this.orderPaymentId !== orderId) {
      this.orderPaymentId = orderId;
      this.orderPayment$ = this.apiService.apiGetOrderPayment(orderId).pipe(
        map((res: PaymentInterface) => {
          this.orderPayment = res;
          this.orderPayment$ = null;
          return this.orderPayment;
        }),
        catchError((error: any) => {
          this.orderPayment = null;
          this.orderPayment$ = null;
          return throwError(error);
        }),
        share());
      return this.orderPayment$;
    }
    else {
      return of(this.orderPayment);
    }
  }

  // TODO: move this method to @pe/common/modules/business#BusinessService
  getBusinessVat(): Observable<BusinessVatInterface[]> {
    if (this.businessVatCashed) {
      return of(this.businessVatCashed);
    }
    else if (this.businessVatObservable) {
      return this.businessVatObservable;
    }
    else {
      this.businessVatObservable = this.apiService.getBusinessVat(this.settingsService.businessUuid).pipe(
        map((response: BusinessVatInterface[]) => {
          this.businessVatCashed = response;
          this.businessVatObservable = null;
          return this.businessVatCashed;
        }),
        catchError((error: any) => {
          this.businessVatCashed = null;
          this.businessVatObservable = null;
          return throwError(error);
        }),
        share()
      );
      return this.businessVatObservable;
    }

  }

  actionOrder(
    orderId: string,
    data: ActionRequestInterface,
    action: ActionType,
    dataKey: string,
    serialize: boolean = false,
    paymentType?: PaymentType
  ): Observable<DetailInterface> {
    let requestBody: { [propName: string]: ActionRequestInterface } | ActionRequestInterface | string;

    // const isPaymentAction: boolean = this.settingsService.settings.paymentOnMicro.indexOf(paymentType) !== -1;

    let requestData: { [propName: string]: ActionRequestInterface } | ActionRequestInterface = {};
    // const requestOptions: RequestOptionsArgs = { withCredentials: true };
    if (serialize) {
      requestData[dataKey] = data;
      requestBody = this.makeFormData(requestData as any);
      if (!requestBody) {
        // TODO Find way to remove that hack
        requestBody = dataKey === 'payment_shipping_goods' ? ({ payment_shipping_goods: {} } as any) : dataKey;
      }
      // requestOptions.headers = new Headers();
      // requestOptions.headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }
    else {
      if (dataKey) {
        requestData[dataKey] = data;
      } else {
        requestData = data;
      }

      // if (isPaymentAction) {
      //   requestBody = data;
      // }
      // else {
      //   requestBody = requestData;
      // }
      requestBody = {
        fields: requestData
      };
    }

    return this.apiService.postAction(this.settingsService.businessUuid, orderId, action, requestBody).pipe(
      map((response: any) => {
        this.reset = true;
        return response;
      }),
      catchError((error: Response) => {
        return this.handleError(error, true);
      })
    );
  }

  actionOrderUpload(orderId: string, action: ActionType, payload: any): Observable<Response> {
    // const requestOptions: RequestOptionsArgs = { withCredentials: true };
    //
    // const requestBody: FormData = new FormData();
    // data.map((item: UploadActionRequestInterface, i: number) => {
    //   requestBody.append(`payment_upload[models][${i}][type]`, item.uploadType);
    //   if (item.file) {
    //     requestBody.append(`payment_upload[models][${i}][name]`, item.file.name);
    //     requestBody.append(`payment_upload[models][${i}][data]`, item.file, item.file.name);
    //   }
    // });
    return this.apiService.postAction(this.settingsService.businessUuid, orderId, action, payload).pipe(
      tap((response: any) => {
        this.reset = true;
      })
    );
  }

  handleError(error: any, showSnack?: boolean): Observable<never> {
    if (!error.message) {
      error.message = this.translateService.translate('errors.error');
    }
    if (error.status === 403 || error.statusCode === 403 || error.code === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      this.showError(error.message);
    }
    return throwError(error);
  }

  private showError(error: string): void {
    this.snackBarService.toggle(true, error || 'Unknown error', {
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24
    });
  }

  private makeItemsArray(): void {
    this.order._itemsArray = {};
    forEach(this.order.cart.items, (item: ItemInterface) => this.order._itemsArray[item.uuid] = item);
  }

  private compileData(): void {
    this.order.payment_option.down_payment = +this.order.payment_option.down_payment || 0;
    this.order._refundItems = [];
    this.order._refundFixedAmount = 0;
    this.order._refundReason = null;
    this.order._showSantanderDeQr = false;
    const refundReason: string[] = [];
    if (this.order.history) {
      forEach(this.order.history, (historyItem: OrderHistoryInterface) => {
        if (historyItem.action === 'refund') {
          if (historyItem.refund_items.length > 0) {
            forEach(historyItem.refund_items, (refundItem: RefundItemsInterface) => {
              let counted: boolean = false;
              forEach(this.order._refundItems, (item: RefundItemsInterface, index: number) => {
                if (item.payment_item_id === refundItem.payment_item_id) {
                  this.order._refundItems[index].count += refundItem.count;
                  counted = true;
                }
              });
              if (!counted) {
                this.order._refundItems.push(refundItem);
              }
            });
          }
          else {
            this.order._refundFixedAmount += (+historyItem.amount);
          }
          if (historyItem.reason) {
            refundReason.push(historyItem.reason);
          }
        }
      });
    } else {
      this.order.history = [];
    }
    if (refundReason.length > 0) {
      this.order._refundReason = refundReason.join(', ');
    }

    if (this.order.details) {
      // masking iban
      if (this.order.details.order.iban) {
        this.order.details.order.iban = `**** ${this.order.details.order.iban.replace(/\s/g, '').slice(-4)}`;
      }
    }
  }

  private initOrderPaymentType(): void {
    switch (this.order.payment_option.type) {
      case 'cash':
        this.order._isCash = true;
        break;
      case 'invoice':
        this.order._isInvoice = true;
        break;
      case 'payex_creditcard':
      case 'payex_faktura':
        this.order._isPayex = true;
        break;
      case 'swedbank_creditcard':
      case 'swedbank_invoice':
        this.order._isSwedbank = true;
        break;
      case 'paymill_creditcard':
      case 'paymill_directdebit':
        this.order._isPaymill = true;
        break;
      case 'paypal':
        this.order._isPaypal = true;
        break;
      case 'sofort':
        this.order._isSofort = true;
        break;
      case 'stripe':
      case 'stripe_directdebit':
        this.order._isStripe = true;
        break;
      case 'santander_invoice_de':
        this.order._isSantanderDeInvoice = true;
        break;
      case 'santander_invoice_no':
        this.order._isSantanderNoInvoice = true;
        break;
      default:
        break;
    }
  }

  private initSantander(): void {
    let isRegularSantanderDe: boolean = false;
    switch (this.order.payment_option.type) {
      case 'santander_installment':
      case 'santander_ccp_installment':
      case 'santander_pos_installment':
        this.order._isSantander = true;
        this.order._isSantanderDe = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        isRegularSantanderDe = true;
        break;
      case 'santander_installment_at':
      case 'santander_pos_installment_at':
        this.order._isSantander = true;
        this.order._isSantanderAt = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        break;
      case 'santander_installment_dk':
      case 'santander_pos_installment_dk':
        this.order._isSantander = true;
        this.order._isSantanderDk = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        break;
      case 'santander_installment_no':
      case 'santander_pos_installment_no':
        this.order._isSantander = true;
        this.order._isSantanderNo = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        break;
      case 'santander_installment_nl':
        this.order._isSantander = true;
        this.order._isSantanderNl = true;
        this.order._santanderApplicationNo = this.order.details.order.application_no;
        break;
      case 'santander_invoice_no':
      case 'santander_pos_invoice_no':
        this.order._isSantander = true;
        this.order._isSantanderNo = true;
        this.order._applicationNo = this.order.details.order.pan_id; // was application_number;
        break;
      case 'santander_installment_se':
        this.order._isSantander = true;
        this.order._hideUpdateStatusAction = true;
        break;
      case 'santander_invoice_de':
      case 'santander_pos_invoice_de':
        this.order._isSantanderPosDeFactInvoice = this.order.payment_option.type === 'santander_pos_invoice_de';
        this.order._isSantander = true;
        this.order._isSantanderDe = true;
        this.order._panId = this.order.details.order.pan_id; // was usage_text;
        break;
      case 'santander_factoring_de':
      case 'santander_pos_factoring_de':
        this.order._isSantanderPosDeFactInvoice = this.order.payment_option.type === 'santander_pos_factoring_de';
        this.order._isSantander = true;
        this.order._hideUpdateStatusAction = true;
        this.order._panId = this.order.details.order.pan_id; // was usage_text;
        break;
      default:
        break;
    }

    const statusContractAvailable: StatusType[] = [
      'STATUS_ACCEPTED',
      'STATUS_PAID',
      'STATUS_IN_PROCESS'
    ];

    if (isRegularSantanderDe && this.order.status.general === 'STATUS_PAID') {
      this.order._isForceHideUpdateStatus = true;
    }

    if (this.order.payment_option.type === 'santander_pos_installment') {
      const specificStatusAvailable: SantanderAppSpecificStateType[] = [
        'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS',
        'STATUS_SANTANDER_DEFERRED'
      ];
      this.order._showSantanderDeQr = specificStatusAvailable.indexOf(this.order.status.specific) >= 0;

      const allowDownloadFunctionalityStates: SantanderAppSpecificStateType[] = [
        'STATUS_SANTANDER_APPROVED',
        'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS',
        'STATUS_SANTANDER_ACCOUNT_OPENED'
      ];
      if (allowDownloadFunctionalityStates.indexOf(this.order.status.specific) >= 0) {
        let historyItem: OrderHistoryInterface;
        if (this.order.status.specific === 'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS') {
          historyItem = findLast(this.order.history, (historyItem: OrderHistoryInterface) => historyItem.payment_status === 'STATUS_IN_PROCESS');
        }
        else {
          historyItem = findLast(this.order.history, (historyItem: OrderHistoryInterface) => historyItem.payment_status === 'STATUS_ACCEPTED');
        }
        if (Boolean(historyItem)) {
          const timeout: number = this.settingsService.settings.constants['SANTANDER_DE_POS_ALLOW_CONTRACT_DOWNLOAD_TIMEOUT'] as number;
          this.order._showSantanderContract = this.getCurrentTimeout(historyItem) < timeout;
        }
      }
    }
    if (this.order.payment_option.type === 'santander_pos_factoring_de') {
      this.order._showSantanderFactoringContract = statusContractAvailable.indexOf(this.order.status.general) >= 0;
    }
    if (this.order.payment_option.type === 'santander_pos_invoice_de') {
      this.order._showSantanderInvoiceContract = statusContractAvailable.indexOf(this.order.status.general) >= 0;
    }

    if (this.order.history.length > 0) {
      // find the first history item
      const orderCreatedHistoryItem: OrderHistoryInterface = minBy(
        this.order.history,
        (historyItem: OrderHistoryInterface) => (new Date(historyItem.created_at)).getTime()
      );
      const timeout: number = this.settingsService.settings.constants['SANTANDER_DE_POS_SHOW_CREDIT_ANSWER_TIMEOUT'] as number;
      this.order._showCreditAnswer = this.getCurrentTimeout(orderCreatedHistoryItem) < timeout;
    }
  }

  private rebuildOrders(): void {
    const baseActions: ActionInterface[] = this.order.actions || [];
    const actions: ActionInterface[] = [];
    forEach (baseActions, (actionData: ActionInterface) => {
      actionData = cloneDeep(actionData);
      if (this.order._isSantanderNoInvoice && actionData.action === 'edit') {
        actionData.action = 'update';
        actions.push(actionData);
      } else if (actionData.action === 'edit' && (
                 this.order._isSantanderPosDeFactInvoice ||
                 this.order._isSantanderNo)) {
        actionData.action = 'change_amount';
        actions.push(actionData);
        if (this.order._isSantanderPosDeFactInvoice) {
          actionData = cloneDeep(actionData);
          actionData.action = 'change_reference';
          actions.push(actionData);
        }
      } else {
        actions.push(actionData);
      }
    });

    forEach(actions, (action: ActionInterface) => {
      if (action.enabled) {
        action._label = this.translateService.translate(`details.actions.${this.order.payment_option.type}.${action.action}`);
      }
    });
    console.log('Actions list was transformed', this.order.actions, actions);
    this.order.actions = actions;
  }

  private getCurrentTimeout(historyItem: OrderHistoryInterface): number {
    return (new Date()).getTime() - (new Date(historyItem.created_at)).getTime();
  }

  private makeFormData(data: { [propName: string]: ActionRequestInterface }): string {
    let serializedData: string = '';
    forIn(data, (dataValue: ActionRequestInterface, dataKey: string) => {
      forIn(dataValue, (value: number | string | boolean | ActionRequestRefundItemsInterface[], key: string) => {
        const formKey: string = encodeURIComponent(`${dataKey}[${key}]`);
        if (typeof value === 'string' || typeof value === 'number') {
          serializedData += `&${formKey}=${encodeURIComponent(value as string)}`;
        }
        else if (typeof value === 'boolean') {
          serializedData += `&${formKey}=${value ? '1' : '0'}`;
        }
      });
    });
    return serializedData.replace(/^&/, '');
  }
}
