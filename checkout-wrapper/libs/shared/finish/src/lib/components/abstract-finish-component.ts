import {
  Injector,
  Input,
  Output,
  EventEmitter,
  Directive,
  OnChanges,
  SimpleChanges,
  LOCALE_ID,
} from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import dayjs from 'dayjs';
import { timer } from 'rxjs';

import { TopLocationService } from '@pe/checkout/location';
import { ApiCallUrlService } from '@pe/checkout/node-api';
import { PluginEventsService } from '@pe/checkout/plugins';
import { FlowStorage, SendToDeviceStorage } from '@pe/checkout/storage';
import { FlowState } from '@pe/checkout/store';
import {
  AddressInterface,
  FlowInterface,
  NodePaymentResponseInterface,
  PaymentInterface,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  ChangePaymentDataInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import {
  Payment,
  PaymentHelperService,
  PAYMENT_STATUS,
  SALUTATION_TRANSLATION,
} from '@pe/checkout/utils';
import { PE_ENV } from '@pe/common/core';

import { ModalButtonListInterface } from '../types';

@Directive()
export abstract class AbstractFinishComponent implements OnChanges {

  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) paymentMethod: PaymentMethodEnum;

  @Input() isLoading: boolean;
  @Input() isChangingPaymentMethod: boolean;
  @Input() embeddedMode: boolean;
  @Input() merchantMode: boolean;

  @Input() set showCloseButton(value: boolean) {
    this.closeButton = value;
  }

  get showCloseButton(): boolean {
    return this.closeButton || !!this.flow.apiCall.cancelUrl;
  }

  @Input() showChangePaymentButton: boolean;
  @Input() isDisableChangePayment: boolean;
  @Input() darkMode: boolean;

  @Input() payment: PaymentInterface = null;
  @Input() nodeResult: NodePaymentResponseInterface<any> = null;

  /* @deprecated use isDisableChangePayment instead */
  @Input() set asSinglePayment(asSinglePayment: boolean) {
    this.isDisableChangePayment = asSinglePayment;
  }

  /* @deprecated use isDisableChangePayment instead */
  get asSinglePayment(): boolean {
    return this.isDisableChangePayment;
  }

  @Input() set errorMessage(message: string) {
    this._errorMessage = message;
    if (message) {
      this._onErrorMessageUpdate();
    }
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  @Output() cleanUp: EventEmitter<any> = new EventEmitter();
  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() closeButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() changePaymentMethod: EventEmitter<ChangePaymentDataInterface> = new EventEmitter();
  @Output() tryAgain: EventEmitter<any> = new EventEmitter();

  readonly PaymentStatusEnum: typeof PaymentStatusEnum = PaymentStatusEnum;
  readonly PaymentSpecificStatusEnum: typeof PaymentSpecificStatusEnum = PaymentSpecificStatusEnum;

  get applicationNumber(): string {
    if (this.nodeResult?.paymentDetails) {
      return this.nodeResult.paymentDetails.applicationNo || this.nodeResult.paymentDetails.applicationNumber;
    } else if (this.payment?.payment_details) {
      return this.payment.payment_details.application_no || this.payment.payment_details.application_number;
    }

    return null;
  }

  get transactionNumber(): string {
    if (this.nodeResult?.paymentDetails) {
      return this.nodeResult.paymentDetails.transactionNumber;
    }
    if (this.payment?.payment_details) {
      return this.payment.payment_details.transaction_number;
    }

    return null;
  }

  get signingCenterLink(): string {
    const id: string = this.payment ? this.payment.id : null;

    return id ? `${this.env.backend.checkout}/santander-de/download-contract/${id}` : '';
  }

  get buttons(): ModalButtonListInterface {
    return this.isLoading ? {} : this._buttons;
  }

  get enableHiddenCalls(): boolean {
    return this.isShopRedirectEnabled();
  }

  get failureUrl(): string {
    return this.apiCallUrlService.getFailureUrl(this.nodeResult, this.payment, this.flow);
  }

  get customerRedirectUrl(): string {
    return this.apiCallUrlService.getCustomerRedirectUrl(this.nodeResult, this.payment, this.flow);
  }

  get successUrl(): string {
    return this.apiCallUrlService.getSuccessUrl(this.nodeResult, this.payment, this.flow);
  }

  get pendingUrl(): string {
    return this.apiCallUrlService.getPendingUrl(this.nodeResult, this.payment, this.flow);
  }

  get customerRedirectPendingUrl(): string {
    return this.apiCallUrlService.getCustomerRedirectPendingUrl(this.nodeResult, this.payment, this.flow);
  }

  get paymentStatusAsText(): string {
    return PAYMENT_STATUS[this.specificStatus as Payment] || this.specificStatus;
  }

  get transactionLink(): string {
    return this.payment ? this.payment.customer_transaction_link : null;
  }

  get orderId(): string {
    const f = this.flow || ({} as FlowInterface);
    const result = f.reference || f.id;

    return result ? result.toUpperCase() : null;
  }

  get createdAt(): string {
    const locale: string = this.injector.get(LOCALE_ID);
    let createdAt: null | string = null;

    if (this.nodeResult) {
      createdAt = this.nodeResult.createdAt;
    } else if (this.payment) {
      createdAt = this.payment.created_at;
    }

    return createdAt ? dayjs(createdAt).locale(locale).format('DD.MM.YYYY HH:mm:ss') : null;
  }

  get status(): PaymentStatusEnum {
    return this.getPaymentStatus();
  }

  get specificStatus(): PaymentSpecificStatusEnum {
    if (this.nodeResult?.payment) {
      return this.nodeResult.payment.specificStatus;
    }
    if (this.payment?.specific_status) {
      return this.payment.specific_status;
    }

    return null;
  }

  protected _pluginEventsService: PluginEventsService = this.injector.get(PluginEventsService);

  private _buttons: ModalButtonListInterface = {};
  private _errorMessage: string;
  private closeButton: boolean;

  private apiCallUrlService = this.injector.get(ApiCallUrlService);
  private env = this.injector.get(PE_ENV);
  private windowTopLocation = this.injector.get(TopLocationService);
  private flowStorage = this.injector.get(FlowStorage);
  private sendToDeviceStorage = this.injector.get(SendToDeviceStorage);
  protected paymentHelperService = this.injector.get(PaymentHelperService);

  constructor(protected injector: Injector) {}

  isPosPayment(): boolean {
    return this.paymentHelperService.isPos(this.flow);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.flowId || changes.payment || changes.nodeResult || changes.embeddedMode) {
      if (this.flow && (this.payment || this.nodeResult)) {
        this._onPaymentUpdate();
      }
    }
  }

  addressLine(): string {
    let result: string = null;
    if (this.flow.billingAddress) {
      const parts: string[] = [
        this.flow.billingAddress?.street,
        this.flow.billingAddress?.zipCode,
        this.flow.billingAddress?.country,
        this.flow.billingAddress?.city,
      ].filter(d => !!d);
      result = parts.join(', ');
    }

    return result;
  }

  billingAddressName(): string {
    return this.flow && this.getNameString(this.flow.billingAddress);
  }

  getNameString(address: AddressInterface): string {
    let nameString = '';
    if (address) {
      if (address.salutation) {
        nameString += SALUTATION_TRANSLATION[address.salutation];
      }
      if (address.firstName) {
        nameString += ` ${address.firstName}`;
      }
      if (address.lastName) {
        nameString += ` ${address.lastName}`;
      }
    }

    return nameString;
  }

  canChangePaymentMethod(): boolean {
    return this.apiCallUrlService.canChangePaymentMethod(
      this.isDisableChangePayment,
      this.nodeResult,
      this.flow,
    );
  }

  onChangePaymentMethod(): void {
    this.isChangingPaymentMethod = true;
    this.changePaymentMethod.emit({
      redirectUrl: this.apiCallUrlService.getChangePaymentUrl(this.nodeResult, this.payment, this.flow, false),
    });
  }

  onCloseMethod(): void {
    this.closeButtonClicked.emit();
  }

  onClose(): void {
    this.close.emit();
  }

  getPaymentStatus(): PaymentStatusEnum {
    if (this.nodeResult?.payment) {
      return this.nodeResult.payment.status;
    }
    if (this.payment?.status) {
      return this.payment?.status;
    }

    return null;
  }

  isPaymentAlreadySubmitted(): boolean {
    // This is very bad solution but backend can't provide any special flag for that case
    // (discussed with Andrei P. at 05.03.2021)
    return this.errorMessage && this.errorMessage.indexOf('already submitted') >= 0;
  }

  isCanShowTransactionLink(): boolean {
    return this.payment && !!this.payment.customer_transaction_link;
  }

  isStatusFail(): boolean {
    return [
      PaymentStatusEnum.STATUS_FAILED,
      PaymentStatusEnum.STATUS_DECLINED,
    ].indexOf(this.getPaymentStatus()) >= 0;
  }

  isStatusSuccess(): boolean {
    return [
      PaymentStatusEnum.STATUS_ACCEPTED,
      PaymentStatusEnum.STATUS_PAID,
      PaymentStatusEnum.STATUS_IN_PROCESS,
    ].indexOf(this.getPaymentStatus()) >= 0;
  }

  isStatusPending(): boolean {
    return false; // Should be defined in child component if pending is needed
  }

  isStatusUnknown(): boolean {
    return !this.isStatusSuccess() && !this.isStatusFail() && !this.isStatusPending();
  }

  getApiCallUrl(): string {
    if (this.payment || this.nodeResult) {
      if (this.isStatusSuccess() && this.successUrl) {
        return this.successUrl;
      }
      if (this.isStatusPending() && this.pendingUrl) {
        return this.pendingUrl;
      }
      if (this.isStatusFail() && this.failureUrl) {
        return this.failureUrl;
      }
    }

    return null;
  }

  getIframeCallbackUrl(): string {
    return this.isShopRedirectEnabled() ? null : this.customerRedirectUrl;
  }

  isShopRedirectEnabled(): boolean {
    return this.payment?.shop_redirect_enabled || this.nodeResult?.options?.shopRedirectEnabled;
  }

  protected onCleanUp(): void {
    // Can be redeclared
  }

  protected _onPaymentUpdate(): void {
    if (this.isStatusSuccess()) {
      this._onStatusSuccess();
    } else if (this.isStatusFail()) {
      this._onStatusFail();
    } else if (this.isStatusPending()) {
      this._onStatusPending();
    }

    if (this.payment) {
      this._pluginEventsService.emitSantanderPaymentStatus(this.payment.status, this.flow, this.payment.apiCall);
    } else if (this.nodeResult) {
      this._pluginEventsService.emitSantanderPaymentStatus(
        this.nodeResult.payment.status,
        this.flow,
        this.nodeResult._apiCall
      );
    } else {
      // eslint-disable-next-line
      console.error('Cant emit event for status!');
    }
  }

  protected _onStatusSuccess(): void {
    this.onCleanUp();
    this.clearServerFlowDump();
    this.cleanUp.next();
    let buttons: ModalButtonListInterface = {};
    const successOrShopUrl = this.customerRedirectUrl || this.successUrl || this?.flow?.shopUrl;
    if (successOrShopUrl && !this.isPosPayment() && !this.embeddedMode) {
      buttons = {
        submit: {
          title: $localize`:@@checkout_sdk.action.return_to_store:`,
          classes: 'btn btn-primary btn-link',
          click: () => {
            this.changeWindowTopLocation(successOrShopUrl);
          },
        },
      };
    }
    this.addBackToPosTerminalButtons(buttons);
    this.setButtons(buttons);

    const successRedirectUrl: string = this.successUrl;
    if (this.isShopRedirectEnabled() && successRedirectUrl) {
      this.isLoading = true;
      this.changeWindowTopLocation(successRedirectUrl);
    }
  }

  protected _onStatusFail(): void {
    this.onCleanUp();
    this.cleanUp.next();
    let buttons: ModalButtonListInterface = {};
    if (this.canChangePaymentMethod()) {
      buttons = {
        submit: {
          title: $localize`:@@checkout_sdk.action.change_payment_method:`,
          classes: 'btn btn-primary btn-link',
          click: () => this.onChangePaymentMethod(),
        },
      };
    }
    if (this.showCloseButton) {
      buttons.cancel = {
        title: $localize`:@@checkout_sdk.action.cancel:`,
        classes: 'btn btn-primary btn-link',
        click: () => this.onCloseMethod(),
      };
    }
    this.setButtons(buttons);

    const failureRedirectUrl: string = this.failureUrl;
    if (this.isShopRedirectEnabled() && failureRedirectUrl) {
      this.isLoading = true;
      this.changeWindowTopLocation(failureRedirectUrl);
    }
  }

  protected _onStatusPending(): void {
    this.onCleanUp();
    this.clearServerFlowDump();
    this.cleanUp.next();
    let buttons: ModalButtonListInterface = {};
    const pendingOrShopUrl = this.customerRedirectPendingUrl || this?.flow?.shopUrl;
    if (pendingOrShopUrl && !this.isPosPayment() && !this.embeddedMode) {
      buttons = {
        submit: {
          title: $localize`:@@checkout_sdk.action.return_to_store:`,
          classes: 'btn btn-primary btn-link',
          click: () => {
            this.changeWindowTopLocation(pendingOrShopUrl);
          },
        },
      };
    }
    this.addBackToPosTerminalButtons(buttons);
    this.setButtons(buttons);

    const pendingRedirectUrl: string = this.pendingUrl;
    if (this.isShopRedirectEnabled() && pendingRedirectUrl) {
      this.isLoading = true;
      this.changeWindowTopLocation(pendingRedirectUrl);
    }
  }

  protected _onErrorMessageUpdate(): void {
    this.setButtons({
      submit: {
        title: $localize`:@@checkout_sdk.action.try_again:`,
        classes: 'btn btn-primary btn-link',
        click: () => this.tryAgain.emit(),
      },
      ...(this.showCloseButton && {
        close: {
          title: $localize`:@@checkout_sdk.action.close:`,
          classes: 'btn btn-default btn-link',
          click: () => this.onClose(),
        },
      }),
      ...(this.showChangePaymentButton && {
        close: {
          title: $localize`:@@checkout_sdk.action.change_payment_method:`,
          classes: 'btn btn-primary btn-link',
          click: () => this.onChangePaymentMethod(),
        },
      }),
    });
  }

  protected _getFailStatusList(): PaymentStatusEnum[] {
    return [PaymentStatusEnum.STATUS_FAILED, PaymentStatusEnum.STATUS_DECLINED];
  }

  protected isInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }

  private addBackToPosTerminalButtons(buttons: ModalButtonListInterface): void {
    if (this.merchantMode && this.isInIframe()) {
      buttons.cancel = {
        title: $localize`:@@checkout_sdk.action.return_to_pos:`,
        classes: 'btn btn-primary btn-link',
        click: () => {
          this._pluginEventsService.emitClosed(this.flow ? this.flow.id : null, true);
        },
      };
    }
  }

  private setButtons(buttons: ModalButtonListInterface): void {
    this._buttons = buttons;
  }

  private clearServerFlowDump(): void {
    // This method is to handle case when user restore flow from link given by merchant.
    // Link should live forever but when user successfully paid - data to restore flow should be remove from server.
    const restoreCodeId = this.flowStorage.getServerFlowDumpCodeId(this.flow.id);
    if (restoreCodeId) {
      this.sendToDeviceStorage.removeData(restoreCodeId).subscribe();
    }
  }

  private changeWindowTopLocation(url: string): void {
    // We add small offset to let other requests be called
    timer(100).subscribe(() => {
      this.windowTopLocation.href = url;
    });
  }
}
