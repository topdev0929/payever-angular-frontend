export interface FormMainInterface {
  name?: string;
  email?: string;
}

export interface FormInterface {
  formRatesMain?: FormMainInterface;
}

export interface NodePaymentResponseDetailsInterface {
  chargeId: string;
  clientSecret: string;
  postbackUrl: string;
}
