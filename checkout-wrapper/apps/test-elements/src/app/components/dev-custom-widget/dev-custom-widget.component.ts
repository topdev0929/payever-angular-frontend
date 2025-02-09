import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';

import { Login, LoginDto } from '@pe/checkout/store';
import {
  AddressInterface,
  CheckoutModeEnum,
  CheckoutPlacementEnum,
  CustomWidgetConfigInterface,
  RatesOrderEnum,
  SalutationEnum,
  WidgetTypeEnum,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dev-custom-widget.component.html',
})
export class DevLibCheckoutWidgetComponent {

  private readonly store = inject(Store);

  initialChannelSetId =
  'ca9f69c9-9655-42ce-a60f-cd7c5a72053b'; // GOOGLE_PAY TEST
  // 'cd2fac76-2b3a-4919-b0be-67b13d056a99'; // APPLE_PAY TEST

  // 'f34889a4-8f07-42fd-a2f0-fde5a2a2d62b'; // SANTANDER_DE Test
  // '90b135fa-22f2-40ff-b3ea-314df63338f5'; // SANTANDER_AT Test
//  '64461f1b-4cf0-455f-90ba-2b36bf118c5e'; // SANTANDER_DE Staging
  // '60349384-1e46-4506-844e-061887f075a2'; // SANTANDER_DE Staging
  // '4e0e633c-6e7d-4d49-af73-bc91cf339d64'; // SANTANDER_DK Staging
  // 'b1d43804-eae7-482d-ad73-71a06759a6fe'; // SANTANDER_NO Staging
  // '080db92c-9aca-42cd-b928-fb7717ec16b4'; // SANTANDER_SE Staging

  formGroup = this.fb.group({
    amount: [localStorage.getItem('amount') || '250'],
    minWidth: [localStorage.getItem('minWidth') || '200'],
    maxWidth: [localStorage.getItem('maxWidth') || '500'],
    checkoutMode: [localStorage.getItem('checkoutMode') || CheckoutModeEnum.None],
    channelSetId: [this.initialChannelSetId, [Validators.required]],
    paymentMethod: [
      localStorage.getItem('paymentMethod') || PaymentMethodEnum.APPLE_PAY,
      Validators.required,
    ],
    type: [
      localStorage.getItem('type') || WidgetTypeEnum.Button,
      Validators.required,
    ],
    theme: [localStorage.getItem('theme') || 'dark'],
  });

  themes = ['light', 'dark'];

  loginForm = this.fb.group({
    email: this.fb.control('payments.test@payever.org'),
    plainPassword: this.fb.control('Payever123!'),
  });

  options = [
    PaymentMethodEnum.IVY,
    PaymentMethodEnum.SANTANDER_INSTALLMENT,
    PaymentMethodEnum.SANTANDER_INSTALLMENT_AT,
    PaymentMethodEnum.SANTANDER_FACTORING_DE,
    PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
    PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
    PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
    PaymentMethodEnum.SANTANDER_INSTALLMENT_NL,
    PaymentMethodEnum.GOOGLE_PAY,
    PaymentMethodEnum.APPLE_PAY,
  ];

  selectedPayment$: Observable<PaymentMethodEnum> = this.formGroup.get('paymentMethod').valueChanges.pipe(
    startWith(this.formGroup.get('paymentMethod').value),
    map(value => value as PaymentMethodEnum),
    tap(value => localStorage.setItem('paymentMethod', value)),
  );

  type$ = this.formGroup.get('type').valueChanges.pipe(
    startWith(this.formGroup.get('type').value),
    tap(value => localStorage.setItem('type', value)),
  );

  channelSetId$ = this.formGroup.get('channelSetId').valueChanges.pipe(
    startWith(this.formGroup.get('channelSetId').value),
    shareReplay(1),
  );

  amount$ = this.formGroup.get('amount').valueChanges.pipe(
    tap(value => localStorage.setItem('amount', value)),
    startWith(this.formGroup.get('amount').value),
    shareReplay(1),
  );

  minWidth$ = this.formGroup.get('minWidth').valueChanges.pipe(
    tap(value => localStorage.setItem('minWidth', value)),
    startWith(this.formGroup.get('minWidth').value),
    shareReplay(1),
  );

  maxWidth$ = this.formGroup.get('maxWidth').valueChanges.pipe(
    tap(value => localStorage.setItem('maxWidth', value)),
    startWith(this.formGroup.get('maxWidth').value),
    shareReplay(1),
  );

  theme$ = this.formGroup.get('theme').valueChanges.pipe(
    startWith(this.formGroup.get('theme').value),
    shareReplay(1),
  );

  checkoutMode$ = this.formGroup.get('checkoutMode').valueChanges.pipe(
    tap(value => localStorage.setItem('checkoutMode', value)),
    startWith(this.formGroup.get('checkoutMode').value),
    shareReplay(1),
  );

  readonly paymentMethod = PaymentMethodEnum;
  readonly widgetTypes = Object.values(WidgetTypeEnum);
  readonly checkoutModeTypes = Object.values(CheckoutModeEnum);

  cart = [
    {
      amount: 123,
      description: 'Cart item 1',
      identifier: Math.random().toString(36),
      quantity: 1,
      name: 'Cart item 1',
      price: 123,
      thumbnail: 'https://via.placeholder.com/150',
      unit: 'EACH',
    },
  ];

  shippingAddress: AddressInterface = {
    salutation: SalutationEnum.SALUTATION_MR,
    city: 'Berlin',
    country: 'DE',
    firstName: 'John',
    lastName: 'Doe',
    street: 'Karl-Liebknecht-Str. 5',
    zipCode: '10178',
  };

  shippingOption = {
    name: 'DHL',
  };

  config: CustomWidgetConfigInterface = {
    _id: '79f72200-1ff5-442c-8f7e-4eb76f30de7a',
    amountLimits: {
        min: 99,
        max: 100000,
    },
    checkoutId: '58a380e7-4d1f-50e0-af55-927a727b90e9',
    checkoutMode: CheckoutModeEnum.Calculator, // 'calculator' | 'none' | 'financeExpress'
    checkoutPlacement: CheckoutPlacementEnum.RighSidebar,
    // isBNPL: false,
    isVisible: true,
    maxWidth: 500,
    minWidth: 200,
    payments: [
        {
            paymentMethod: PaymentMethodEnum.SANTANDER_FACTORING_DE,
            amountLimits: {
                min: 99,
                max: 100000,
            },
            enabled: true,
            isBNPL: false,
        },
    ],
    ratesOrder: RatesOrderEnum.Asc,
    styles: {
        backgroundColor: '#ffffff',
        lineColor: '#eeeeee',
        mainTextColor: '#333333',
        regularTextColor: '#333333',
        ctaTextColor: null,
        buttonColor: '#e8e8e8',
        fieldBackgroundColor: '#ffffff',
        fieldLineColor: '#e8e8e8',
        fieldArrowColor: null,
        headerTextColor: '#888888',
    },
    cancelUrl: 'https://github.com/',
    failureUrl: '',
    noticeUrl: '',
    pendingUrl: '',
    successUrl: 'https://www.google.com',
    businessId: 'c193b0d1-c229-4e4d-9587-1c37233d2ee7',
    widgetId: '79f72200-1ff5-442c-8f7e-4eb76f30de7a',
    reference: 'order-id',
    business: 'c193b0d1-c229-4e4d-9587-1c37233d2ee7',
    shippingAddress: this.shippingAddress,
    shippingOption: this.shippingOption,
  };

  config$ = combineLatest([
    this.minWidth$,
    this.maxWidth$,
    this.checkoutMode$,
    this.theme$,
  ]).pipe(
    map(([minWidth, maxWidth, checkoutMode, theme]) => ({
      ...this.config,
      minWidth,
      maxWidth,
      checkoutMode,
      theme,
    }))
  );

  constructor(
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    private fb: FormBuilder,
  ) {}

  login(): void {
    const { valid, value } = this.loginForm;
    if (valid) {
      this.store.dispatch(new Login(value as LoginDto));
    }
  }
}
