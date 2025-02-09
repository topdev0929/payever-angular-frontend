export interface NodePaymentDetailsInterface {
  frontendFinishUrl?: string;
  frontendCancelUrl?: string;
}

export interface NodePaymentDetailsResponseInterface {
  transactionId: string;
  redirectUrl: string;
  frontendFinishUrl: string;
  frontendCancelUrl: string;
}
