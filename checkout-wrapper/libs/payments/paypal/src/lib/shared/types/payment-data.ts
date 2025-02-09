export interface NodePaymentDetailsInterface {
  frontendFinishUrl?: string;
  frontendCancelUrl?: string;
}

export interface NodePaymentDetailsResponseInterface {
  token: string;
  redirectUrl: string;
  frontendFinishUrl: string;
  frontendCancelUrl: string;
}

export type FormInterface = object; // Nothing for now
