import { BehaviorSubject } from 'rxjs';

import { CheckoutSettingsInterface, CheckoutUISettingsInterface } from '@pe/checkout/types';

export interface SettingsDataInterface {
  channelSetId: string;
  data: CheckoutSettingsInterface;
  loading: boolean;
}

export interface SettingsEventInterface {
  channelSetId: string;
  eventName: string;
  value: any;
}

export interface UISettingsStateInterface {
  subject: BehaviorSubject<CheckoutUISettingsInterface>;
  processed: boolean;
}
