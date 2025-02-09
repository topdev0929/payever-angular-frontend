export interface SelectedRateMultiTitle {
  label: string;
  text: string;
}

export interface DetailInterface {
  title: string;
  value: string;
}

export interface RateInterface {
  listTitle: string;
  selectedTitle: string;
  selectedMultiTitles: SelectedRateMultiTitle[];
  details: DetailInterface[];
  value: any;
  raw: any;
  isOneLine?: boolean;
  isDefault?: boolean;
}

export interface CheckoutAndCreditsInterface<CreditInterface> {
  currency: string;
  rates: CreditInterface[];
}
