import { Type } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

export const SELECTOR_TYPES: { [key: string]: { import: () => Promise<Type<AbstractSelectorModule>> } } = {
  'checkout-main-amount-edit':
    { import:
      () => import('@pe/checkout/main/selectors/amount-edit')
        .then(m => m.AmountEditModuleMain),
    },
  'checkout-main-user':
    { import:
      () => import('@pe/checkout/main/selectors/user')
        .then(m => m.UserModuleMain),
    },
  'checkout-main-address':
    { import:
      () => import('@pe/checkout/main/selectors/address')
        .then(m => m.AddressModuleMain),
    },
  'checkout-main-coupons':
    { import:
      () => import('@pe/checkout/main/selectors/coupons')
        .then(m => m.CouponsModuleMain),
    },
  'checkout-main-shipping':
    { import:
      () => import('@pe/checkout/main/selectors/shipping')
        .then(m => m.ShippingModuleMain),
    },
  'checkout-main-payment-summary':
    { import:
      () => import('@pe/checkout/main/selectors/payment-summary')
        .then(m => m.PaymentSummaryModuleMain),
    },
  'checkout-main-choose-payment':
    { import:
      () => import('@pe/checkout/main/selectors/choose-payment-method')
        .then(m => m.ChoosePaymentMethodModuleMain),
    },
  'checkout-main-edit-payment-method':
    { import:
      () => import('@pe/checkout/main/selectors/payment-edit')
        .then(m => m.PaymentEditModuleMain),
    },
  'checkout-main-payment':
    { import:
      () => import('@pe/checkout/main/selectors/payment')
        .then(m => m.PaymentModuleMain),
    },
  'checkout-main-order':
    { import:
      () => import('@pe/checkout/main/selectors/order')
        .then(m => m.OrderModuleMain),
    },
  'checkout-main-user-summary':
    { import:
      () => import('@pe/checkout/main/selectors/user-summary')
        .then(m => m.UserSummaryModuleMain),
    },
  'checkout-main-address-summary':
    { import:
      () => import('@pe/checkout/main/selectors/address-summary')
        .then(m => m.AddressSummaryModuleMain),
    },
  'checkout-main-coupons-summary':
    { import:
      () => import('@pe/checkout/main/selectors/coupons-summary')
        .then(m => m.CouponsSummaryModuleMain),
    },
  'checkout-main-shipping-summary':
    { import:
      () => import('@pe/checkout/main/selectors/shipping-summary')
        .then(m => m.ShippingSummaryModuleMain),
    },
  'checkout-main-send-to-device':
    { import:
      () => import('@pe/checkout/main/selectors/send-to-device')
        .then(m => m.SendToDeviceModuleMain),
    },
  'checkout-send-to-device':
    { import:
      () => import('@pe/checkout/main/selectors/send-to-device')
        .then(m => m.SendToDeviceModuleMain),
    },
};
