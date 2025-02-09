export interface PaymentDetails {
  frontendSuccessUrl: string;
  frontendFinishUrl: string;
  frontendFailureUrl: string;
  frontendCancelUrl: string;
  forceRedirect: boolean;
}
