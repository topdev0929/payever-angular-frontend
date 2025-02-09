export interface PaymentDetails {
  frontendFinishUrl?: string;
  frontendCancelUrl?: string;
}

export interface PaymentResponse {
  applicationNumber: string;
  redirectUrl: string;
  frontendCancelUrl: string;
  frontendFinishUrl: string;
  getPaymentStatusUrl: string;
}
