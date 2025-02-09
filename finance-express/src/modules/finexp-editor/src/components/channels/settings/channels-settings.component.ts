import { Component, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';

import { Subscription, defer } from 'rxjs';
import { debounceTime, filter, map, startWith, takeUntil } from 'rxjs/operators';

import { ColorPickerAlign } from '@pe/forms';
import {
  CheckoutModeEnum,
  CheckoutPlacementEnum,
  PaymentMethodEnum,
  RatesOrderEnum,
  WidgetConfigInterface,
  WidgetConfigPaymentInterface,
  WidgetTypeEnum
} from '@pe/checkout-types';

import { CheckoutInterface, PaymentsViewInterface } from '../../../interfaces';
import { AbstractWidgetSettingsComponent } from '../abstract-widget-settings.component';
import { CheckoutModalActionsInterface } from '../../../shared/modal/types/navbar-controls.type';

const checkUrlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors => {
  const a = document.createElement('a');
  a.href = control.value;
  return !control.value || (a.host && a.host !== window.location.host) ? null : { invalid: true };
};

@Component({
  selector: 'checkout-channel-button',
  templateUrl: './channels-settings.component.html',
  styleUrls: ['./channels-settings.component.scss']
})
export class ChannelsSettingsComponent extends AbstractWidgetSettingsComponent implements OnInit {

  readonly RatesOrderEnum = RatesOrderEnum;
  readonly colorPickerAlign = ColorPickerAlign;
  readonly checkoutModeEnum = CheckoutModeEnum;
  readonly WidgetTypeEnum = WidgetTypeEnum;

  public isFormCreated: boolean;
  currentCheckout: CheckoutInterface;
  checkoutModes = [
    CheckoutModeEnum.FinanceExpress,
    CheckoutModeEnum.Calculator,
    CheckoutModeEnum.None
  ];

  public readonly form = this.formBuilder.group({
    isVisible: null,
    ratesOrder: null,
    successUrl: [null || '', [checkUrlValidator]],
    pendingUrl: [null || '', [checkUrlValidator]],
    cancelUrl: [null || '', [checkUrlValidator]],
    failureUrl: [null || '', [checkUrlValidator]],
    noticeUrl: [null || '', [checkUrlValidator]],
    backgroundColor: null,
    lineColor: null,
    mainTextColor: null,
    regularTextColor: null,
    ctaTextColor: null,
    buttonColor: null,
    fieldBackgroundColor: null,
    fieldLineColor: null,
    fieldArrowColor: null,
    headerTextColor: null,
    minWidth: [null, [
      (control: AbstractControl): {[key: string]: any} | null => {
        const maxWidth = this.form?.controls && this.form.controls['maxWidth'] ? this.form.controls['maxWidth'].value : null;
        const invalid = maxWidth && control.value > maxWidth;
        return invalid ? { limit: maxWidth } : null;
      },
      Validators.min(this.minWidthLimit),
      Validators.required
    ]],
    maxWidth: [null, [
      (control: AbstractControl): {[key: string]: any} | null => {
        const minWidth = this.form?.controls && this.form.controls['minWidth'] ? this.form.controls['minWidth'].value : null;
        const invalid = minWidth && control.value < minWidth;
        return invalid ? { limit: minWidth } : null;
      },
      Validators.min(this.minWidthLimit),
      Validators.required
    ]],
    checkoutMode: null,
    checkoutPlacement: null
  });

  checkoutModes$ = this.widgetLoader.selectedPaymentOption$.pipe(
    map((selectedPaymentOption) => {
      const ivySelected = selectedPaymentOption === 'ivy';

      return this.checkoutModes.filter(mode => !ivySelected || mode !== CheckoutModeEnum.Calculator);
    }),
  );

  public filteredPayments$ = defer(() => this.form.get('checkoutMode').valueChanges.pipe(
    startWith(this.form.get('checkoutMode').value),
    map((mode: CheckoutModeEnum) => {
      if (mode === CheckoutModeEnum.Calculator
        || this.widgetConfig.type !== WidgetTypeEnum.Button
      ) {
        // this.form.get('checkoutPlacement').setValue(CheckoutPlacementEnum.Bottom);
        const ivyIdx = this.connectedPayments.findIndex(p => p.paymentMethod === PaymentMethodEnum.IVY);
        const isIvySelected = this.widgetConfig.payments.find(p => p.paymentMethod === PaymentMethodEnum.IVY)
        isIvySelected && this.removePayment(this.connectedPayments[ivyIdx]);

        return this.connectedPayments.filter(p => p.paymentMethod !== PaymentMethodEnum.IVY);
      }

      return this.connectedPayments;
    }),
  ));

  checkoutPlacements = Object.values(CheckoutPlacementEnum);

  backgroundColorControl: FormControl = new FormControl('#f8f8f8');

  openedPaymentSettings: PaymentsViewInterface;

  amountLimitsForm: FormGroup = this.formBuilder.group({});
  amountLimitsFormSubscription: Subscription;

  modalActions: CheckoutModalActionsInterface[] = [];

  private defaultMinWidth = 380;

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.initModalActions();
    super.ngOnInit();

    this.connectedPayments = this.connectedPayments.filter(
      p => p.paymentMethod !== PaymentMethodEnum.IVY && this.widgetConfig.type !== WidgetTypeEnum.Button
    );
  }

  setOpenedPaymentSettings(payment: WidgetConfigPaymentInterface): void {
    this.openedPaymentSettings = this.openedPaymentSettings === payment ? null : payment;
    if (this.openedPaymentSettings) {
      this.amountLimitsForm = this.formBuilder.group({
        minLimit: [this.openedPaymentSettings?.amountLimits?.min, [Validators.required]],
        maxLimit: [this.openedPaymentSettings?.amountLimits?.max, [Validators.required]],
      }, { validators: this.paymentLimitsValidator().bind(this) });
      if (this.amountLimitsFormSubscription) {
        this.amountLimitsFormSubscription.unsubscribe();
      }
      this.amountLimitsFormSubscription = this.amountLimitsForm.valueChanges
        .pipe(takeUntil(this.destroyed$), filter(() => this.amountLimitsForm?.valid), debounceTime(300))
        .subscribe(limits => {
          const editedPayment = this.getPaymentPaymentFromPaymentsArray(this.openedPaymentSettings);
          if (editedPayment) {
            editedPayment.amountLimits.min = limits.minLimit ?? 0;
            editedPayment.amountLimits.max = limits.maxLimit ?? 0;
          }
          const connectedPayment = this.getPaymentPaymentFromPaymentsArray(this.openedPaymentSettings, this.connectedPayments);
          connectedPayment.amountLimits = editedPayment.amountLimits;
          this.updateGeneralLimits();
          this.validateLimits();
          this.updateWidgetSettings();
          this.saveSettings().subscribe();
        });
    } else {
      this.amountLimitsForm = this.formBuilder.group({});
      if (this.amountLimitsFormSubscription) {
        this.amountLimitsFormSubscription.unsubscribe();
      }
    }
  }

  onPaymentsChange(payment: PaymentsViewInterface, event: MatCheckboxChange): void {
    if (event.checked) {
      const addedPayment = {
        paymentMethod: payment.paymentMethod,
        amountLimits: {
          min: payment.amountLimits.min,
          max: payment.amountLimits.max
        },
        enabled: true,
        isBNPL: payment.isBNPL,
        productId: payment.productId
      };
      this.widgetConfig.payments.push(addedPayment);
    } else {
      this.removePayment(payment);
    }
    this.updateGeneralLimits();
    this.validateLimits();
    this.updateWidgetSettings();
    this.saveSettings().subscribe();
  }

  isPaymentSelected(payment: PaymentsViewInterface): boolean {
    return !!this.getPaymentPaymentFromPaymentsArray(payment);
  }

  mathFloor(value: number): number {
    return Math.floor(value);
  }

  protected createForm(settings: WidgetConfigInterface): void {
    const buttonStyles = settings || this.defaultWidgetConfig;
    this.form.setValue({
      isVisible: buttonStyles.isVisible,
      ratesOrder: buttonStyles.ratesOrder,
      successUrl: buttonStyles.successUrl || '',
      pendingUrl: buttonStyles.pendingUrl || '',
      cancelUrl: buttonStyles.cancelUrl || '',
      failureUrl: buttonStyles.failureUrl || '',
      noticeUrl: buttonStyles.noticeUrl || '',
      backgroundColor: buttonStyles.styles.backgroundColor,
      lineColor: buttonStyles.styles.lineColor,
      mainTextColor: buttonStyles.styles.mainTextColor,
      regularTextColor: buttonStyles.styles.regularTextColor,
      ctaTextColor: buttonStyles.styles.ctaTextColor,
      buttonColor: buttonStyles.styles.buttonColor,
      fieldBackgroundColor: buttonStyles.styles.fieldBackgroundColor,
      fieldLineColor: buttonStyles.styles.fieldLineColor,
      fieldArrowColor: buttonStyles.styles.fieldArrowColor,
      headerTextColor: buttonStyles.styles.headerTextColor,
      minWidth: buttonStyles.minWidth || this.defaultMinWidth,
      maxWidth: buttonStyles.maxWidth,
      checkoutMode: buttonStyles.checkoutMode,
      checkoutPlacement: buttonStyles.checkoutPlacement
    });
    this.isFormCreated = true;
    this.cdr.detectChanges();
  }

  paymentLimitsValidator(): ValidationErrors | null {
    return (form: FormGroup) => {
      // const paymentOptions = this.paymentsOptions.find(options => options.payment_method === this.openedPaymentSettings.paymentMethod);
      const min = this.amountLimitsForm?.controls['minLimit'];
      const max = this.amountLimitsForm?.controls['maxLimit'];
      if (min && max) {
        min.setValidators([
          Validators.required,
          Validators.min(this.openedPaymentSettings.validationLimits.min),
          Validators.max(max?.value)
        ]);
        max.setValidators([
          Validators.required,
          Validators.max(this.openedPaymentSettings.validationLimits.max),
          Validators.min(min?.value)
        ]);
        min.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        max.updateValueAndValidity({ onlySelf: true, emitEvent: false });
      }
      return form.errors;
    };
  }

  resetWidgetSettings() {
    this.resetPayments();
    this.form.controls['isVisible'].patchValue(this.defaultWidgetConfig.isVisible);
    this.form.controls['ratesOrder'].patchValue(this.defaultWidgetConfig.ratesOrder);
    this.form.controls['successUrl'].patchValue(this.defaultWidgetConfig.successUrl);
    this.form.controls['pendingUrl'].patchValue(this.defaultWidgetConfig.pendingUrl);
    this.form.controls['cancelUrl'].patchValue(this.defaultWidgetConfig.cancelUrl);
    this.form.controls['failureUrl'].patchValue(this.defaultWidgetConfig.failureUrl);
    this.form.controls['noticeUrl'].patchValue(this.defaultWidgetConfig.noticeUrl);
    this.form.controls['backgroundColor'].patchValue(this.defaultWidgetConfig.styles.backgroundColor);
    this.form.controls['lineColor'].patchValue(this.defaultWidgetConfig.styles.lineColor);
    this.form.controls['mainTextColor'].patchValue(this.defaultWidgetConfig.styles.mainTextColor);
    this.form.controls['regularTextColor'].patchValue(this.defaultWidgetConfig.styles.regularTextColor);
    this.form.controls['ctaTextColor'].patchValue(this.defaultWidgetConfig.styles.ctaTextColor);
    this.form.controls['buttonColor'].patchValue(this.defaultWidgetConfig.styles.buttonColor);
    this.form.controls['fieldBackgroundColor'].patchValue(this.defaultWidgetConfig.styles.fieldBackgroundColor);
    this.form.controls['fieldLineColor'].patchValue(this.defaultWidgetConfig.styles.fieldLineColor);
    this.form.controls['fieldArrowColor'].patchValue(this.defaultWidgetConfig.styles.fieldArrowColor);
    this.form.controls['headerTextColor'].patchValue(this.defaultWidgetConfig.styles.headerTextColor);
    this.form.controls['checkoutMode'].patchValue(this.defaultWidgetConfig.checkoutMode);
    this.form.controls['checkoutPlacement'].patchValue(this.defaultWidgetConfig.checkoutPlacement);
    this.form.controls['minWidth'].patchValue(this.defaultWidgetConfig.minWidth ?? this.defaultMinWidth);
    this.form.controls['maxWidth'].patchValue(this.defaultWidgetConfig.maxWidth ?? 500);
    this.backgroundColorControl.patchValue('#f8f8f8');
    this.form.updateValueAndValidity();
  }

  private resetPayments() {
    this.widgetConfig.payments.forEach(payment => {
      payment.amountLimits.min = this.paymentsOptions.find(item => item.payment_method === payment.paymentMethod)?.min;
      payment.amountLimits.max = this.paymentsOptions.find(item => item.payment_method === payment.paymentMethod)?.max;
    });
    this.connectedPayments.forEach(connectedPayment => {
      const configPayment = this.widgetConfig.payments.find(item => item.paymentMethod === connectedPayment.paymentMethod);
      connectedPayment.amountLimits = configPayment ? configPayment.amountLimits : connectedPayment.amountLimits;
    });

    this.openedPaymentSettings = null;
  }

  private initModalActions() {
    this.modalActions = [
      {
        title: this.translationService.translate('finexp.actions.cancel'),
        active: false,
        callback: () => this.goBack()
      },
      {
        title: this.translationService.translate('finexp.channels.generateHtml.getCode'),
        active: true,
        callback: () => this.setIsGeneratedCode(),
      }
    ];
  }

  protected getUpdatedSettings(): WidgetConfigInterface {
    const formValue = this.form.value;

    return {
      _id: this.widgetConfig._id,
      channelSet: this.channelSetId,
      amountLimits: {
        min: this.widgetConfig.amountLimits.min,
        max: this.widgetConfig.amountLimits.max
      },
      isVisible: formValue.isVisible,
      ratesOrder: formValue.ratesOrder,
      successUrl: formValue.successUrl,
      pendingUrl: formValue.pendingUrl,
      cancelUrl:  formValue.cancelUrl,
      failureUrl: formValue.failureUrl,
      noticeUrl:  formValue.noticeUrl,
      styles: {
        backgroundColor: formValue.backgroundColor,
        lineColor: formValue.lineColor,
        mainTextColor: formValue.mainTextColor,
        regularTextColor: formValue.regularTextColor,
        ctaTextColor: formValue.ctaTextColor,
        buttonColor: formValue.buttonColor,
        fieldBackgroundColor: formValue.fieldBackgroundColor,
        fieldLineColor: formValue.fieldLineColor,
        fieldArrowColor: formValue.fieldArrowColor,
        headerTextColor: formValue.headerTextColor
      },
      minWidth: formValue.minWidth,
      maxWidth: formValue.maxWidth,
      checkoutMode: formValue.checkoutMode,
      checkoutPlacement: formValue.checkoutPlacement,
      payments: this.widgetConfig.payments.map(item => {
        return {
          paymentMethod: item.paymentMethod,
          amountLimits: {
            min: item.amountLimits.min,
            max: item.amountLimits.max
          },
          enabled: item.enabled,
          isBNPL: item.isBNPL,
          productId: item.productId
        };
      }),
      type: this.widgetConfig.type
    } as WidgetConfigInterface;
  }

  protected updateWidgetSettings(): void {
    this.widgetConfig = this.getUpdatedSettings();
    this.widgetStyles = JSON.stringify(this.widgetConfig.styles);
    this.widgetPayments = JSON.stringify(this.widgetConfig.payments);
    this.setWidgetAmount(this.openedPaymentSettings
      ? [this.getPaymentPaymentFromPaymentsArray(this.openedPaymentSettings)]
      : this.widgetConfig.payments);
  }

  private removePayment(payment: PaymentsViewInterface): void {
    if (this.openedPaymentSettings) {
      this.openedPaymentSettings =
        !!this.getPaymentPaymentFromPaymentsArray(this.openedPaymentSettings, [payment]) ?
          null : this.openedPaymentSettings;
    }
    const deletedPayment = this.getPaymentPaymentFromPaymentsArray(payment);
    const deletedPaymentIndex = this.widgetConfig.payments.findIndex(item => item === deletedPayment);
    this.widgetConfig.payments.splice(deletedPaymentIndex, 1);
  }
}
