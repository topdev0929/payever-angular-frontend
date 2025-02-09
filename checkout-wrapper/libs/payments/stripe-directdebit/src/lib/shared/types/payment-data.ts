export interface FormInterface {
  iban: string;
}

export interface NodeAdditionalPaymentDetailsInterface {
  dynamicDescriptor?: string;
}

export interface NodePaymentDetailsInterface extends FormInterface, NodeAdditionalPaymentDetailsInterface {
}

export interface NodePaymentDetailsResponseInterface {
  chargeId: string;
  iban: string;
  mandateReference: string;
  mandateUrl: string;
  sourceId: string;
}
