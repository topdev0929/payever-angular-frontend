import { Injectable } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';

import type { PaymentMethodEnum } from '@pe/checkout/types';

import { DEVICE_RESTRICTION } from '../constants';

@Injectable()
export class DeviceDetectPaymentsService {
  constructor(
    private deviceService: DeviceDetectorService
  ) {}

  deviceRestriction = DEVICE_RESTRICTION;

  allowDevice(paymentMethod: PaymentMethodEnum) {
    const { os, browser }: DeviceDetectorService = this.deviceService;
    const restrict = this.deviceRestriction[paymentMethod];
    const deviceType = this.deviceService.isMobile() ? 'mobile' : 'desktop';

    if (!restrict) {
      return true;
    }

    const restrictedDevice = restrict[deviceType];

    return restrictedDevice?.os?.includes(os) && restrictedDevice?.browser === browser;
  }
}
