export interface FormMainInterface {
  name?: string;
  email?: string;
}

export interface FormInterface {
  formRatesMain?: FormMainInterface;
}

export interface NodePaymentDetailsInterface extends FormMainInterface {
  ___?: void; // To fix lint error
}

export interface NodePaymentResponseDetailsInterface {
  chargeId: string;
  clientSecret: string;
}

export interface PaymentIntentResponse extends stripe.PaymentIntentResponse{
  inProgress?: boolean;
  cancel?: boolean;
}
