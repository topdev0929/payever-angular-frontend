import { DeviceDetectorService } from 'ngx-device-detector';

import { PaymentMethodEnum } from '@pe/checkout/types';

import { DEVICE_RESTRICTION } from './device-restrictions.constant';

export function isDeviceAllowed(deviceService: DeviceDetectorService, paymentMethod: PaymentMethodEnum) {
  const { os, browser } = deviceService;
  const restrict = DEVICE_RESTRICTION[paymentMethod];
  const deviceType = deviceService.isMobile() ? 'mobile' : 'desktop';

  if (!restrict) {
    return true;
  }

  const restrictedDevice = restrict[deviceType];

  return !!restrictedDevice?.os?.includes(os) && restrictedDevice?.browser === browser;
}
