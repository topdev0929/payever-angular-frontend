export enum FiltersFieldType {
  CreatedAt = 'created_at',
  Status = 'status',
  SpecificStatus = 'specific_status',
  Channel = 'channel',
  Store = 'store',
  Amount= 'amount',
  Total = 'total',
  Currency = 'currency',
  CustomerName = 'customer_name',
  CustomerEmail = 'customer_email',
  MerchantName = 'merchant_name',
  MerchantEmail = 'merchant_email',
  SellerName = 'seller_name',
  SellerEmail = 'seller_email',
  Type = 'type',
  OriginalId = 'original_id',
  Reference = 'reference',
}

export enum FiltersTypeType {
  Text = 'text',
  Date = 'date',
  Email = 'email',
  Number = 'number',
  Select = 'select'
}

export enum FiltersConditionType {
  Is = 'is',
  IsIn = 'isIn',
  IsNot = 'isNot',
  IsNotIn = 'isNotIn',
  IsDate = 'isDate',
  IsNotDate = 'isNotDate',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Contains = 'contains',
  DoesNotContain = 'doesNotContain',
    // DynamicTypes:
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
  Between = 'between',
  AfterDate = 'afterDate',
  BeforeDate = 'beforeDate',
  BetweenDates = 'betweenDates'
}

export enum FiltersOptionsSourcesType {
  PaymentMethods = 'payment_methods',
  SpecificStatuses = 'specific_statuses',
  Statuses = 'statuses',
  Channels = 'channels',
  Stores = 'stores',
  Currencies = 'currencies'
}
