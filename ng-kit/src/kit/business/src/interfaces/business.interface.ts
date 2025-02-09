import { BusinessDataInterface } from './business-data.interface';
import { BusinessChannelInterface } from './business-channel.interface';
import { BusinessCurrencyInterface } from './business-currency.interface';
import { BusinessPaymentOptionInterface } from './business-payment-option.interface';

export interface BusinessInterface {
  business: BusinessDataInterface;
  channels: {[propName: string]: BusinessChannelInterface};
  currencies: {[propName: string]: BusinessCurrencyInterface};
  paymentOptions: {[propName: string]: BusinessPaymentOptionInterface};
}
