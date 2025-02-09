import { FilterOptionsInterface } from './filters.interface';
import { FiltersConditionType } from './filters.type';
import { PaginationInterface } from './pagination.interface';
import { PaymentType } from './payment.type';
import { StatusType } from './status.type';

export interface ListInterface {
  amount?: string;
  business_name?: string;
  channel?: string;
  created_at?: string;
  currency?: string;
  customer_email?: string;
  customer_name?: string;
  down_payment?: number;
  uuid: string;
  last_action?: string;
  merchant_email?: string;
  merchant_name?: string;
  seller_email?: string;
  seller_name?: string;
  reference?: string;
  status?: StatusType;
  specific_status?: string;
  // status_color?: string;
  // status_translated?: string;
  total?: string;
  type?: PaymentType;

  _channelThumbnail?: string;

  // @deprecated
  _statusColor?: string;
  // channelThumbnail?: string;
  // customerEmail?: string;
  // customerName?: string;
  // downPayment?: number;
  // merchantEmail?: string;
  // merchantName?: string;
}

export interface ListResponseInterface {
  collection: ListInterface[];
  pagination_data: PaginationInterface;
  usage: FilterOptionsInterface;
}

export interface ListColumnsInterface {
  columns_to_show: string[];
  direction?: string;
  filters?: any;
  id?: number;
  limit?: string;
  order_by?: string;
}

export interface ColumnsInterface {
  columnsToShow: string[];
}

export interface FilterRangeInterface {
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchFilterInterface {
  condition: FiltersConditionType | string;
  value: any;
}

export interface SearchFiltersInterface {
  [propName: string]: SearchFilterInterface | SearchFilterInterface[]; // Non-array for hardcoded not editable filters, like channel_set_uuid
}

export interface SearchTransactionsInterface {
  orderBy?: string;
  direction?: string;
  configuration?: SearchFiltersInterface;
  search?: string;
  page?: number;
  created_at?: string;
  currency?: string;
}

export interface SortInterface {
  orderBy: string;
  direction: string;
}

export interface UserBusinessInterface {
  _id: string;
  name: string;
  active: boolean;
  companyDetails: any; // TODO Type
  companyAddress: any; // TODO Type
  contactDetails: any; // TODO Type
  bankAccount: any; // TODO Type
  taxes: any; // TODO Type
  currency: string;
  companyName?: string;
}
