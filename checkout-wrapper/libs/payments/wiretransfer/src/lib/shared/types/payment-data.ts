export interface NodeAdditionalPaymentRequestInterface {
  shopUserSession?: string;
  posVerifyType?: number;
  posMerchantMode?: boolean;
}

export interface NodePaymentDetailsResponseInterface {
  accountHolder: string;
  bankName: string;
  bankCity: string;
  iban: string;
  bic: string;
}
