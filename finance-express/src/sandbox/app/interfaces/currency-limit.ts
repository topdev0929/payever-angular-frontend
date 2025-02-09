export type CurrenciesLimits = CurrencyLimit[];

export interface CurrencyLimit {
  currency: string;
  max: number;
  min: number;
  payment_method: string[];
}

