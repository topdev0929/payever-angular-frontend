export interface NodePaymentAdditionalDetailsInterface {
  frontendFinishUrl?: string;
  frontendFailureUrl?: string;
}

export interface NodePaymentDetailsInterface extends NodePaymentAdditionalDetailsInterface {
  ___?: void; // To fix lint error
}

export interface NodePaymentDetailsResponseInterface {
  redirectUrl: string;
}
