import { BrowserInfoInterface, DeviceInfoInterface } from '../models';

import { TermsFormValue } from './form.interface';


export interface PaymentDetails {
  birthday: Date;
  phone: string;
  isPhoneValidated: boolean;
  customer: CustomerDetails;
  frontendSuccessUrl: string;
  frontendFinishUrl: string;
  frontendFailureUrl: string;
  frontendCancelUrl: string;
  forceRedirect: boolean;
  riskSessionId?: string;
  deviceInfo: DeviceInfoInterface,
  browserInfo: BrowserInfoInterface,
}

export type CustomerDetails = TermsFormValue;
