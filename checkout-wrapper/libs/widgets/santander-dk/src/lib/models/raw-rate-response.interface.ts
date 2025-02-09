import { CreditInterface } from './credit.interface';

export interface RawRatesResponseInterface {
  extra_data: any;
  messages: any;
  credit: CreditInterface[];
}
