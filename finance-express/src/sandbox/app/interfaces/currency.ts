export type Currencies = Currency[];

export interface Currency {
  name: string;
  symbol: string;
  code: string;
  rate: number;
}
