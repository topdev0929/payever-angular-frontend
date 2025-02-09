import { PeFilterConditions } from '@pe/grid/shared';

export enum FiltersFieldType {
  ID = 'id',
  PaymentLink = 'redirect_url',
  CreatedAt = 'createdAt',
  Prefilled = 'prefilled',
  Amount = 'amount',
  Channel = 'channel',
  CreatorName = 'creator_name',
  ExpiresAt = 'expiresAt',
  Views = 'views',
  Transactions = 'transactions',
  Status = 'status',
}

export type FiltersConditionType = PeFilterConditions;