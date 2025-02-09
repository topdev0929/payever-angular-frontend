import { FiltersFieldType, PaymentType } from '../interfaces';

import { PaymentMethodEnum } from '@pe/checkout-sdk/sdk/types';

export const columns: FiltersFieldType[] = [
  FiltersFieldType.Channel,
  FiltersFieldType.OriginalId,
  FiltersFieldType.Reference,
  FiltersFieldType.Total,
  FiltersFieldType.Type,
  FiltersFieldType.CustomerEmail,
  FiltersFieldType.CustomerName,
  FiltersFieldType.MerchantEmail,
  FiltersFieldType.MerchantName,
  FiltersFieldType.SellerEmail,
  FiltersFieldType.SellerName,
  FiltersFieldType.CreatedAt,
  FiltersFieldType.Status,
  FiltersFieldType.SpecificStatus
];

export const notToggleableColumns: FiltersFieldType[] = [
  FiltersFieldType.Channel,
  FiltersFieldType.OriginalId,
  FiltersFieldType.Total
];

export const direction: string[] = ['asc', 'desc'];

export const constants: {[propName: string]: string|number} = {
  SANTANDER_DE_POS_ALLOW_CONTRACT_DOWNLOAD_TIMEOUT: 28 * 24 * 60 * 60 * 1000, // 28 days in ms
  SANTANDER_DE_POS_SHOW_CREDIT_ANSWER_TIMEOUT: 28 * 24 * 60 * 60 * 1000,
};

// todo: remove when all Payments modes to microservices
export const paymentOnMicro: PaymentMethodEnum[] = [PaymentMethodEnum.STRIPE];
