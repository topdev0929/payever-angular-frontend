import { forEach } from 'lodash-es';
import UAParser from 'ua-parser-js';

import { PaymentMethodEnum } from '@pe/checkout-types';

import { ExpandedCustomWidgetConfigInterface } from '../../models';
import { calcTotal } from '../element.util';

import { DEVICE_RESTRICTION } from './device-restrictions.constant';

export function isDeviceAllowed(paymentMethod: PaymentMethodEnum) {
  const detector = new UAParser();

  const restrict = DEVICE_RESTRICTION[paymentMethod];
  const deviceType = ['mobile', 'tablet'].includes(detector.getDevice().type) ? 'mobile' : 'desktop';

  if (!restrict) {
    return true;
  }

  const restrictedDevice = restrict[deviceType];

  return !!restrictedDevice?.os?.includes(detector.getOS().name) && restrictedDevice?.browser.includes(detector.getBrowser().name);
}

export function getPaymentMethodByAmountAndEnabled(customConfig: ExpandedCustomWidgetConfigInterface): PaymentMethodEnum {
  let result: PaymentMethodEnum = null;
  const total = calcTotal(customConfig);

  forEach(customConfig.payments, (payment) => {
    if (payment.enabled && (
      !payment.amountLimits ||
      (total >= payment.amountLimits.min || !payment.amountLimits.min) &&
      (total <= payment.amountLimits.max || !payment.amountLimits.max)

    ) && isDeviceAllowed(payment.paymentMethod) && !result || !!customConfig.previewPayment) {
      result = payment.paymentMethod;
    }
  });

  return result;
}


