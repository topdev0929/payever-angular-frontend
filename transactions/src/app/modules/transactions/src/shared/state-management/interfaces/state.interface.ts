import { BusinessChannelInterface, BusinessCurrencyInterface, BusinessPaymentOptionInterface } from '@pe/ng-kit/modules/business';

import { TransactionsFilterSchemaInterface } from '../../settings';

import { ListResponseInterface, UserBusinessInterface } from '../../interfaces';

export interface GlobalStateInterface {
  orders: OrdersStateInterface;
}

export interface OrdersStateInterface {
  transactionsListData: ListResponseInterface;
  filters: any; // TODO !!!! Add correct type
  businessChannels: BusinessChannelInterface[];
  businessPaymentOptions: BusinessPaymentOptionInterface[];
  businessCurrencies: BusinessCurrencyInterface[];
  businessSettings: UserBusinessInterface;
  activeColumns: string[];
  filtersSchema: TransactionsFilterSchemaInterface[];
}
