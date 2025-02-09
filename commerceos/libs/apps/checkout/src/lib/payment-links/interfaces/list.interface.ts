import { FiltersConditionType } from "./filters.type";

export interface SearchFilterInterface {
  condition: FiltersConditionType | string;
  value: any;
}

export interface SearchFiltersInterface {
  [propName: string]: SearchFilterInterface[]; // Non-array for hardcoded not editable filters, like channel_set_uuid
}

export interface SearchPaymentLinksInterface {
  orderBy?: string;
  direction?: string;
  page?: number;
  perPage?: number;
  configuration?: SearchFiltersInterface;
}

export interface SortInterface {
  orderBy: string;
  direction: string;
}


export enum PaymentLinkStatusEnum {
  Active = 'active',
  Deactivated = 'deactivated',
}

export type PaymentLinkStatusType = `${PaymentLinkStatusEnum}`

export interface GetLinksResponse {
  totalPages: number;
  total: number;
  page: number;
  pageSize: number;
  paymentLinks: SearchPaymentLinksItem[]
}


export interface SearchPaymentLinksResponse {
  pagination_data: {
    page: number;
    total: number;
  };
  collection: PaymentLinksInterface[]
}


export interface SearchPaymentLinksItem extends Omit<PaymentLinksInterface, 'createdAt' | 'expiresAt' | 'serviceEntityId'> {
  expires_at?: string | {};
  created_at?: string;
  id: string;
}

export interface PaymentLinksInterface {
  redirect_url?: string;
  serviceEntityId: string;
  reusable: boolean,
  business_id: string;
  is_deleted: false;
  createdAt: string;
  updated_at: string;
  amount?: number;
  expiresAt?: string | {};
  phoneMandatory?: boolean;
  salutationMandatory?: boolean;
  birthdateMandatory?: boolean;
  allowBillingStep?: boolean;
  allowSeparateShippingAddress: boolean;
  isActive: boolean;
  viewsCount: number;
  transactionsCount: number;
  // --- not implemented
  status: PaymentLinkStatusType;
  creator_name: string;
}


export interface GetPaymentLinkResponse extends Omit<PaymentLinksInterface, '_id' | 'redirect_url'> {
  id: string;
  redirectUrl: string;
}
