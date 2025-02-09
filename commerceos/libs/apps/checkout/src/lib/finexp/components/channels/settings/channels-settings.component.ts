import { Component, Injector, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';
import { BehaviorSubject, Subscription, defer } from 'rxjs';
import { debounceTime, filter, map, startWith, takeUntil, tap } from 'rxjs/operators';

import {
  CheckoutModeEnum,
  CheckoutPlacementEnum,
  PaymentMethodEnum,
  RatesOrderEnum,
  WidgetConfigPaymentInterface,
  WidgetTypeEnum,
} from '@pe/checkout-types';
import { ExtendedWidgetConfigInterface, AlignmentEnum, ThemeEnum } from '@pe/finexp';
import { ColorPickerAlign } from '@pe/forms';

import { CheckoutInterface, PaymentsViewInterface } from '../../../interfaces';
import { CheckoutModalActionsInterface } from '../../../shared/modal/types/navbar-controls.type';
import { AbstractWidgetSettingsComponent } from '../abstract-widget-settings.component';

const checkUrlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors => {
  const a = document.createElement('a');
  a.href = control.value;

  return !control.value || a.host && a.host !== window.location.host ? null : { invalid: true };
};

const ONLY_BUTTON_PAYMENTS = [
  PaymentMethodEnum.APPLE_PAY,
  PaymentMethodEnum.GOOGLE_PAY,
  PaymentMethodEnum.IVY,
];

// FinanceExpress mode is disabled for these payments
const PAYMENTS_WITHOUT_FINANCE_EXPRESS_MODE = [
  PaymentMethodEnum.ZINIA_INSTALMENT,
  PaymentMethodEnum.ZINIA_INSTALMENT_DE,
];

@Component({
  selector: 'checkout-channel-button',
  templateUrl: './channels-settings.component.html',
  styleUrls: ['./channels-settings.component.scss'],
})
export class ChannelsSettingsComponent extends AbstractWidgetSettingsComponent implements OnInit {

  readonly RatesOrderEnum = RatesOrderEnum;
  readonly colorPickerAlign = ColorPickerAlign;
  readonly checkoutModeEnum = CheckoutModeEnum;
  readonly WidgetTypeEnum = WidgetTypeEnum;

  private readonly heightEnable$ = new BehaviorSubject<boolean>(false);
  private readonly themeEnable$ = new BehaviorSubject<boolean>(false);

  public isFormCreated: boolean;
  currentCheckout: CheckoutInterface;
  checkoutModes = [
    CheckoutModeEnum.FinanceExpress,
    CheckoutModeEnum.Calculator,
    CheckoutModeEnum.None,
  ];

  public readonly form = this.formBuilder.group({
    isVisible: null,
    isDefault: null,
    ratesOrder: null,
    successUrl: ['', [checkUrlValidator]],
    pendingUrl: ['', [checkUrlValidator]],
    cancelUrl: ['', [checkUrlValidator]],
    failureUrl: ['', [checkUrlValidator]],
    noticeUrl: ['', [checkUrlValidator]],
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
    minWidth: [null, this.minValidators(this.minWidthLimit, 'maxWidth')],
    maxWidth: [null, this.maxValidators(this.minWidthLimit, 'minWidth')],
    minHeight: [null, this.minValidators(this.minHeightLimit, 'maxHeight')],
    maxHeight: [null, this.maxValidators(this.minHeightLimit, 'minHeight')],
    checkoutMode: null,
    alignment: [AlignmentEnum.Left],
    theme: [ThemeEnum.Light],
    checkoutPlacement: null,
  });

  checkoutModes$ = this.widgetLoader.selectedPaymentOption$.pipe(
    map((selectedPaymentOption) => {
      const isButtonPayment = ONLY_BUTTON_PAYMENTS.includes(selectedPaymentOption);
      const hideFinanceExpress = PAYMENTS_WITHOUT_FINANCE_EXPRESS_MODE.includes(selectedPaymentOption);

      return this.checkoutModes.filter(mode =>
        (!isButtonPayment || mode !== CheckoutModeEnum.Calculator)
        && (!hideFinanceExpress || mode !== CheckoutModeEnum.FinanceExpress)
      );
    }),
  );

  public filteredPayments$ = defer(() => this.form.get('checkoutMode').valueChanges.pipe(
    startWith(this.form.get('checkoutMode').value),
    map((mode: CheckoutModeEnum) => {
      if (mode === CheckoutModeEnum.FinanceExpress) {
        return this.disableConnectedPayments([
          ...this.widgetConfig.type !== WidgetTypeEnum.Button
          ? ONLY_BUTTON_PAYMENTS
          : [],
          ...PAYMENTS_WITHOUT_FINANCE_EXPRESS_MODE,
        ]);
      }

      if (mode === CheckoutModeEnum.Calculator
        || this.widgetConfig.type !== WidgetTypeEnum.Button
      ) {
        return this.disableConnectedPayments(ONLY_BUTTON_PAYMENTS);
      }

      return this.connectedPayments;
    }),
  ));

  checkoutPlacements = Object.values(CheckoutPlacementEnum);

  backgroundColorControl: FormControl = new FormControl('#f8f8f8');

  openedPaymentSettings: PaymentsViewInterface;
  selectedPaymentSettings: PaymentsViewInterface;

  amountLimitsForm: FormGroup = this.formBuilder.group({});
  amountLimitsFormSubscription: Subscription;

  modalActions: CheckoutModalActionsInterface[] = [];

  private defaultMinWidth = 380;

  private minValidators(minWidthLimit: number, maxFieldName: string): ValidatorFn[] {
    return [
      (control: AbstractControl): {[key: string]: any} | null => {
        const maxWidth = this.form?.controls?.[maxFieldName] ? this.form.controls[maxFieldName].value : null;
        const invalid = maxWidth && control.value > maxWidth;

        return invalid ? { limit: maxWidth } : null;
      },
      Validators.min(minWidthLimit),
      Validators.required,
    ];
  }

  private maxValidators(minWidthLimit: number, minFieldName: string): ValidatorFn[] {
    return [
      (control: AbstractControl): {[key: string]: any} | null => {
        const minWidth = this.form?.controls?.[minFieldName] ? this.form.controls[minFieldName].value : null;
        const invalid = minWidth && control.value < minWidth;

        return invalid ? { limit: minWidth } : null;
      },
      Validators.min(minWidthLimit),
      Validators.required,
    ];
  }

  get newSettings() {
    const formValue = this.form.value;

    return {
      isVisible: formValue.isVisible,
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
        headerTextColor: formValue.headerTextColor,
      },
      minWidth: formValue.minWidth,
      maxWidth: formValue.maxWidth,
      minHeight: formValue.minHeight || this.minHeightLimit,
      maxHeight: formValue.maxHeight || this.defaultHeight,
      alignment: formValue.alignment || AlignmentEnum.Left,
      theme: formValue.theme || ThemeEnum.Light,
      isDefault: formValue.isDefault ?? true,
    };
  }

  get oldSettings() {
    return {
      isVisible: this.widgetConfig.isVisible,
      styles: {
        backgroundColor: this.widgetConfig.styles.backgroundColor,
        lineColor: this.widgetConfig.styles.lineColor,
        mainTextColor: this.widgetConfig.styles.mainTextColor,
        regularTextColor: this.widgetConfig.styles.regularTextColor,
        ctaTextColor: this.widgetConfig.styles.ctaTextColor,
        buttonColor: this.widgetConfig.styles.buttonColor,
        fieldBackgroundColor: this.widgetConfig.styles.fieldBackgroundColor,
        fieldLineColor: this.widgetConfig.styles.fieldLineColor,
        fieldArrowColor: this.widgetConfig.styles.fieldArrowColor,
        headerTextColor: this.widgetConfig.styles.headerTextColor,
      },
      minWidth: this.widgetConfig.minWidth,
      maxWidth: this.widgetConfig.maxWidth,
      minHeight: this.widgetConfig.minHeight || this.minHeightLimit,
      maxHeight: this.widgetConfig.maxHeight || this.defaultHeight,
      alignment: this.widgetConfig.alignment || AlignmentEnum.Left,
      theme: this.widgetConfig.theme || ThemeEnum.Light,
      isDefault: this.widgetConfig.isDefault ?? true,
    };
  }

  get finexpWidgetConfig() {
    const formValue = this.form.value;

    const paymentCustomWidgetSetting = this.selectedPaymentSettings
      && this.getPaymentPaymentFromPaymentsArray(this.selectedPaymentSettings)?.customWidgetSetting;
    const styles = this.selectedPaymentSettings
      ? JSON.stringify(paymentCustomWidgetSetting?.styles)
      : this.widgetStyles;

    const paymentSettings = {
      ...this.selectedPaymentSettings?.paymentMethod ?
        {
          [this.selectedPaymentSettings.paymentMethod]: {
            styles: JSON.parse(styles ?? this.widgetStyles),
            isVisible: formValue.isDefault ? this.widgetConfig?.isVisible : paymentCustomWidgetSetting?.isVisible ?? formValue.isVisible,
            minWidth: formValue.isDefault ? this.widgetConfig?.minWidth : paymentCustomWidgetSetting?.minWidth ?? formValue.minWidth,
            maxWidth: formValue.isDefault ? this.widgetConfig?.maxWidth : paymentCustomWidgetSetting?.maxWidth ?? formValue.maxWidth,
            isDefault: formValue.isDefault,
            alignment: formValue.isDefault ? this.widgetConfig?.alignment : paymentCustomWidgetSetting?.alignment ?? formValue.alignment,
            minHeight: formValue.isDefault ? this.widgetConfig?.minHeight : paymentCustomWidgetSetting?.minHeight ?? formValue.minHeight,
            maxHeight: formValue.isDefault ? this.widgetConfig?.maxHeight : paymentCustomWidgetSetting?.maxHeight ?? formValue.maxHeight,
            theme: formValue.isDefault ? this.widgetConfig?.theme : paymentCustomWidgetSetting?.theme ?? formValue.theme,
          },
        } : {},
    };

    return {
      isVisible: formValue.isVisible,
      minWidth: formValue.minWidth,
      maxWidth: formValue.maxWidth,
      styles: this.widgetStyles,
      minHeight: formValue.minHeight,
      maxHeight: formValue.maxHeight,
      alignment: formValue.alignment || AlignmentEnum.Left,
      theme: formValue.theme || ThemeEnum.Light,
      paymentSettings: JSON.stringify(paymentSettings),
    };
  }

  constructor(protected injector: Injector) {
    super(injector);
  }

  ngOnInit(): void {
    this.initModalActions();
    super.ngOnInit();

    this.connectedPayments = this.connectedPayments.filter(
      p => p.paymentMethod !== PaymentMethodEnum.IVY && this.widgetConfig.type !== WidgetTypeEnum.Button
    );

    this.selectedPaymentOption$.pipe(
      tap((paymentMethod: PaymentMethodEnum) => {
        const heightEnable = this.heightEnabledForPayments.includes(paymentMethod);
        this.heightEnable$.next(heightEnable);

        const themeEnabled = this.themeEnabledForPayments.includes(paymentMethod);
        this.themeEnable$.next(themeEnabled);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
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
        .subscribe((limits) => {
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

  selectedPayment(payment: PaymentsViewInterface): void {
    this.selectedPaymentSettings = payment;

    const paymentCustomWidgetSetting = payment
      && this.getPaymentPaymentFromPaymentsArray(payment)?.customWidgetSetting;
    const settings = payment ? paymentCustomWidgetSetting ?? this.oldSettings : this.oldSettings;

    this.form.patchValue({
      ...settings,
      ...settings.styles,
    }, { emitEvent: false });

    this.updateFormValidators(payment);

    this.setWidgetAmount(this.openedPaymentSettings
      ? [this.getPaymentPaymentFromPaymentsArray(this.openedPaymentSettings)]
      : this.widgetConfig.payments, this.selectedPaymentSettings?.paymentMethod);

    this.form.updateValueAndValidity();
  }

  onPaymentsChange(payment: PaymentsViewInterface, event: MatCheckboxChange): void {
    if (event.checked) {
      const addedPayment = {
        paymentMethod: payment.paymentMethod,
        amountLimits: {
          min: payment.amountLimits.min,
          max: payment.amountLimits.max,
        },
        enabled: true,
        isBNPL: payment.isBNPL,
        productId: payment.productId,
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

  protected updateFormValidators(payment: PaymentsViewInterface) {
    const minWidth = payment
      ? this.minWidthLimitByPayment[payment.paymentMethod] ?? this.minWidthLimit
      : this.minWidthLimit;
    this.form.get('minWidth').setValidators(this.minValidators(minWidth, 'maxWidth'));
    this.form.get('minWidth').updateValueAndValidity({ emitEvent: false });
    this.form.get('maxWidth').setValidators(this.maxValidators(minWidth, 'minWidth'));
    this.form.get('maxWidth').updateValueAndValidity({ emitEvent: false });
  }

  protected createForm(settings: ExtendedWidgetConfigInterface): void {
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
      checkoutPlacement: buttonStyles.checkoutPlacement,
      minHeight: buttonStyles.minHeight || this.minHeightLimit,
      maxHeight: buttonStyles.maxHeight || this.defaultHeight,
      alignment: buttonStyles.alignment || AlignmentEnum.Left,
      theme: buttonStyles.theme || ThemeEnum.Light,
      isDefault: buttonStyles.isDefault ?? true,
    });

    this.isFormCreated = true;
    this.cdr.detectChanges();
  }

  paymentLimitsValidator(): ValidationErrors | null {
    return (form: FormGroup) => {
      const min = this.amountLimitsForm?.controls['minLimit'];
      const max = this.amountLimitsForm?.controls['maxLimit'];
      if (min && max) {
        min.setValidators([
          Validators.required,
          Validators.min(this.openedPaymentSettings.validationLimits.min),
          Validators.max(max?.value),
        ]);
        max.setValidators([
          Validators.required,
          Validators.max(this.openedPaymentSettings.validationLimits.max),
          Validators.min(min?.value),
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
    this.form.controls['minHeight'].patchValue(this.defaultWidgetConfig.minHeight ?? this.minHeightLimit);
    this.form.controls['maxHeight'].patchValue(this.defaultWidgetConfig.maxHeight ?? this.defaultHeight);
    this.form.controls['alignment'].patchValue(this.defaultWidgetConfig.alignment ?? AlignmentEnum.Left);
    this.form.controls['isDefault'].patchValue(this.defaultWidgetConfig.isDefault ?? true);
    this.backgroundColorControl.patchValue('#f8f8f8');
    this.form.updateValueAndValidity();
  }

  private resetPayments() {
    this.widgetConfig.payments.forEach((payment) => {
      payment.amountLimits.min = this.paymentsOptions.find(item => item.payment_method === payment.paymentMethod)?.min;
      payment.amountLimits.max = this.paymentsOptions.find(item => item.payment_method === payment.paymentMethod)?.max;
    });
    this.connectedPayments.forEach((connectedPayment) => {
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
        callback: () => this.goBack(),
      },
      {
        title: this.translationService.translate('finexp.channels.generateHtml.getCode'),
        active: true,
        callback: () => this.setIsGeneratedCode(),
      },
    ];
  }

  protected getUpdatedSettings(): ExtendedWidgetConfigInterface {
    const formValue = this.form.value;

    return {
      _id: this.widgetConfig._id,
      channelSet: this.channelSetId,
      amountLimits: {
        min: this.widgetConfig.amountLimits.min,
        max: this.widgetConfig.amountLimits.max,
      },
      ratesOrder: formValue.ratesOrder,
      successUrl: formValue.successUrl,
      pendingUrl: formValue.pendingUrl,
      cancelUrl: formValue.cancelUrl,
      failureUrl: formValue.failureUrl,
      noticeUrl: formValue.noticeUrl,
      ...this.selectedPaymentSettings ? this.oldSettings : this.newSettings,
      checkoutMode: formValue.checkoutMode,
      checkoutPlacement: formValue.checkoutPlacement,
      payments: this.widgetConfig.payments.map((item) => {
        return {
          paymentMethod: item.paymentMethod,
          amountLimits: {
            min: item.amountLimits.min,
            max: item.amountLimits.max,
          },
          enabled: item.enabled,
          isBNPL: item.isBNPL,
          productId: item.productId,
          ...this.selectedPaymentSettings && this.selectedPaymentSettings?.paymentMethod === item.paymentMethod ? {
            customWidgetSetting: this.newSettings,
          } : item?.customWidgetSetting ? { customWidgetSetting: item.customWidgetSetting } : {},
        };
      }),
      type: this.widgetConfig.type,
    } as ExtendedWidgetConfigInterface;
  }

  protected updateWidgetSettings(): void {
    this.widgetConfig = this.getUpdatedSettings();
    this.widgetStyles = JSON.stringify(this.widgetConfig.styles);
    this.widgetPayments = JSON.stringify(this.widgetConfig.payments);
    this.setWidgetAmount(this.openedPaymentSettings
      ? [this.getPaymentPaymentFromPaymentsArray(this.openedPaymentSettings)]
      : this.widgetConfig.payments, this.selectedPaymentSettings?.paymentMethod);

    this.cdr.detectChanges();
  }

  private disableConnectedPayments(disabledPayments: PaymentMethodEnum[]) {
    const indexes = this.connectedPayments
      .reduce((acc, p, idx) => {
        disabledPayments.includes(p.paymentMethod) && acc.push(idx);

        return acc;
      }, []);
    const isSelected = this.widgetConfig.payments.find(p => disabledPayments.includes(p.paymentMethod));
    if (isSelected) {
      indexes.forEach(idx => this.removePayment(this.connectedPayments[idx]));
    }

    return this.connectedPayments.filter(p => !disabledPayments.includes(p.paymentMethod));
  }

  private removePayment(payment: PaymentsViewInterface): void {
    if (this.openedPaymentSettings) {
      this.openedPaymentSettings =
        this.getPaymentPaymentFromPaymentsArray(this.openedPaymentSettings, [payment])
          ? null
          : this.openedPaymentSettings;
    }
    const deletedPayment = this.getPaymentPaymentFromPaymentsArray(payment);
    const deletedPaymentIndex = this.widgetConfig.payments.findIndex(item => item === deletedPayment);
    this.widgetConfig.payments.splice(deletedPaymentIndex, 1);
  }

  getBackgroundColor(): string {
    return this.connectedPayments?.length ? this.backgroundColorControl.value : 'transparent';
  }
}
