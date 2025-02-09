export interface CardDataInterface {
  cardNumber?: string;
  cardHolderName?: string;
  cardExpiration?: number[];
  cardCvc?: number;
}

export interface NodeAdditionalPaymentDetailsInterface {
  tokenId?: string;
  postbackUrl?: string;
  dynamicDescriptor?: string;
}

export interface NodePaymentDetailsResponseInterface {
  cardLast4Digits: string;
  chargeId: string;
  customerId: string;
  postbackUrl: string;
  tokenId: string;
  verifyUrl?: string;
}

export interface FormInterface {
  cardNumber?: string;
  cardHolderName?: string;
  cardExpiration?: string[];
  cardCvc?: string;
}

export interface NodePaymentDetailsInterface extends CardDataInterface, NodeAdditionalPaymentDetailsInterface {
}
