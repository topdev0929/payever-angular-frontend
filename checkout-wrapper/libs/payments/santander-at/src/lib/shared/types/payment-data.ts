export interface NodePaymentDetailsInterface {
  frontendFinishUrl?: string;
  frontendCancelUrl?: string;
  birthdate?: string;
}

export interface NodePaymentDetailsResponseInterface {
  applicationNumber: string;
  redirectUrl: string;
  frontendCancelUrl: string;
  frontendFinishUrl: string;
  getPaymentStatusUrl: string;
}

export type FormInterface = object; // Nothing for now
