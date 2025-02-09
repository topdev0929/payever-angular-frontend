import { PaymentMethodEnum } from '@pe/checkout-types';

interface DeviceRestrictionInterface {
  mobile: {
      os: string[];
      browser:string[];
  };
  desktop: {
      os: string[];
      browser: string[];
  };
}

type DeviceRestrictionConfig = {
  [key in PaymentMethodEnum]?: DeviceRestrictionInterface;
};

export const DEVICE_RESTRICTION: DeviceRestrictionConfig = {
  [PaymentMethodEnum.GOOGLE_PAY]: {
    mobile: {
      os: ['Android'],
      browser: ['Mobile Chrome', 'Chrome', 'Chrome Mobile'],
    },
    desktop: null,
  },
  [PaymentMethodEnum.APPLE_PAY]: {
    mobile: {
      os: ['iOS'],
      browser: ['Mobile Safari', 'Safari'],
    },
    desktop: {
      os: ['Mac OS'],
      browser: ['Safari'],
    },
  },
};
