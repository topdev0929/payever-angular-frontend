import { DeviceRestrictionInterface, PaymentMethodEnum } from '@pe/checkout/types';

type DeviceRestrictionConfig = {
  [key in PaymentMethodEnum]?: DeviceRestrictionInterface;
}

export const DEVICE_RESTRICTION: DeviceRestrictionConfig = {
  [PaymentMethodEnum.GOOGLE_PAY]: {
    mobile: {
      os: ['Android'],
      browser: 'Chrome',
    },
    desktop: {
      os: ['Windows'],
      browser: 'Chrome',
    },
  },
  [PaymentMethodEnum.APPLE_PAY]: {
    mobile: {
      os: ['iOS'],
      browser: 'Safari',
    },
    desktop: {
      os: ['Mac'],
      browser: 'Safari',
    },
  },
};
