import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';

import { CheckoutStateParamsInterface } from '@pe/checkout/types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'params',
  templateUrl: './params.component.html',
})
export class ParamsComponent implements AfterViewInit {

  // Params
  @Input() defaultParams: CheckoutStateParamsInterface = {};

  @Output() onUpdateFlow: EventEmitter<void> = new EventEmitter();
  @Output() onUpdateSettings: EventEmitter<void> = new EventEmitter();
  @Output() onOpenOrderStep: EventEmitter<void> = new EventEmitter();
  @Output() onUpdateSteps: EventEmitter<void> = new EventEmitter();
  @Output() onSaveFlowToStorage: EventEmitter<void> = new EventEmitter();

  @Output() paramsChanged: EventEmitter<CheckoutStateParamsInterface> = new EventEmitter();
  @Output() disableLocaleDetectionChanged: EventEmitter<boolean> = new EventEmitter();

  @LocalStorage() disableLocaleDetection: boolean;

  @LocalStorage() embeddedMode: boolean;
  @LocalStorage() forceUseCard: boolean;
  @LocalStorage() forceNoPaddings: boolean;
  @LocalStorage() forceFullScreen: boolean;
  @LocalStorage() merchantMode: boolean;
  @LocalStorage() forceNoSnackBarNotifications: boolean;
  @LocalStorage() showQRSwitcher: boolean;
  @LocalStorage() showCreateCart: boolean;
  @LocalStorage() forceNoScroll: boolean;
  @LocalStorage() forcePhoneRequired: boolean;
  @LocalStorage() forceCodeForPhoneRequired: boolean;
  @LocalStorage() forceNoCloseButton: boolean;
  @LocalStorage() forceShowBusinessHeader: boolean;
  @LocalStorage() forceShowOrderStep: boolean;
  @LocalStorage() generatePaymentCode: boolean;
  @LocalStorage() forceNoOrder: boolean;
  @LocalStorage() forceNoHeader: boolean;
  @LocalStorage() forceNoSendToDevice: boolean;
  @LocalStorage() forceHideReference: boolean;
  @LocalStorage() layoutWithPaddings: boolean;
  @LocalStorage() cancelButtonText: boolean;
  @LocalStorage() flash_bag: boolean;
  @LocalStorage() editMode: boolean;
  @LocalStorage() setDemo: boolean;
  @LocalStorage() clientMode: boolean;
  @LocalStorage() showOrderAmount: boolean;

  ngAfterViewInit(): void {
    this.onChanged();
  }

  get params(): CheckoutStateParamsInterface {
    const params: CheckoutStateParamsInterface = {
      embeddedMode: this.isBoolean(this.embeddedMode)
        ? this.embeddedMode
        : this.defaultParams.embeddedMode,
      forceUseCard: this.isBoolean(this.forceUseCard)
        ? this.forceUseCard
        : this.defaultParams.forceUseCard,
      forceNoPaddings: this.isBoolean(this.forceNoPaddings)
        ? this.forceNoPaddings
        : this.defaultParams.forceNoPaddings,
      forceFullScreen: this.isBoolean(this.forceFullScreen)
        ? this.forceFullScreen
        : this.defaultParams.forceFullScreen,
      merchantMode: this.isBoolean(this.merchantMode)
        ? this.merchantMode
        : this.defaultParams.merchantMode,
      clientMode: this.isBoolean(this.clientMode)
        ? this.clientMode
        : this.defaultParams.clientMode,
      forceNoSnackBarNotifications: this.isBoolean(this.forceNoSnackBarNotifications)
        ? this.forceNoSnackBarNotifications
        : this.defaultParams.forceNoSnackBarNotifications,
      showQRSwitcher: this.isBoolean(this.showQRSwitcher)
        ? this.showQRSwitcher
        : this.defaultParams.showQRSwitcher,
      showCreateCart: this.isBoolean(this.showCreateCart)
        ? this.showCreateCart
        : this.defaultParams.showCreateCart,
      forceNoScroll: this.isBoolean(this.forceNoScroll)
        ? this.forceNoScroll
        : this.defaultParams.forceNoScroll,
      forcePhoneRequired: this.isBoolean(this.forcePhoneRequired)
        ? this.forcePhoneRequired
        : this.defaultParams.forcePhoneRequired,
      forceCodeForPhoneRequired: this.isBoolean(this.forceCodeForPhoneRequired)
        ? this.forceCodeForPhoneRequired
        : this.defaultParams.forceCodeForPhoneRequired,
      forceNoCloseButton: this.isBoolean(this.forceNoCloseButton)
        ? this.forceNoCloseButton
        : this.defaultParams.forceNoCloseButton,
      forceShowBusinessHeader: this.isBoolean(this.forceShowBusinessHeader)
        ? this.forceShowBusinessHeader
        : this.defaultParams.forceShowBusinessHeader,
      forceShowOrderStep: this.isBoolean(this.forceShowOrderStep)
        ? this.forceShowOrderStep
        : this.defaultParams.forceShowOrderStep,
      generatePaymentCode: this.isBoolean(this.generatePaymentCode)
        ? this.generatePaymentCode
        : this.defaultParams.generatePaymentCode,
      forceNoOrder: this.isBoolean(this.forceNoOrder)
        ? this.forceNoOrder
        : this.defaultParams.forceNoOrder,
      forceNoHeader: this.isBoolean(this.forceNoHeader)
        ? this.forceNoHeader
        : this.defaultParams.forceNoHeader,
      forceNoSendToDevice: this.isBoolean(this.forceNoSendToDevice)
        ? this.forceNoSendToDevice
        : this.defaultParams.forceNoSendToDevice,
      forceHideReference: this.isBoolean(this.forceHideReference)
        ? this.forceHideReference
        : this.defaultParams.forceHideReference,
      layoutWithPaddings: this.isBoolean(this.layoutWithPaddings)
        ? this.layoutWithPaddings
        : this.defaultParams.layoutWithPaddings,
      cancelButtonText: this.cancelButtonText
        ? 'Custom button'
        : null,
      editMode: this.isBoolean(this.editMode)
        ? this.editMode
        : this.defaultParams.editMode,
      setDemo: this.isBoolean(this.setDemo)
        ? this.setDemo
        : this.defaultParams.setDemo,
      showOrderAmount: this.isBoolean(this.showOrderAmount)
        ? this.showOrderAmount
        : this.defaultParams.showOrderAmount,
    };

    return params;
  }

  emitResetToOrderAndUpdate(): void {
    window.postMessage({ event: 'payeverCheckoutDoUpdateFlowAndResetStep' }, '*');
  }

  updateFlow(): void {
    this.onUpdateFlow.next();
  }

  updateSettings(): void {
    this.onUpdateSettings.next();
  }

  updateSteps(): void {
    this.onUpdateSteps.next();
  }

  openOrderStep(): void {
    this.onOpenOrderStep.next();
  }

  saveFlowToStorage(): void {
    this.onSaveFlowToStorage.next();
  }

  onChanged(): void {
    this.paramsChanged.next(this.params);
    this.disableLocaleDetectionChanged.next(this.disableLocaleDetection);
  }

  setLocaleToStorage(locale: string): void {
    window.location.href = String(window.location.href);
  }

  private isBoolean(value: any): boolean {
    return typeof value === 'boolean';
  }
}
