interface FormMainInterface {
  phone?: string;
}

export interface FormInterface {
  detailsForm?: FormMainInterface;
}

export interface NodeAdditionalPaymentDetailsInterface {
  frontendFinishUrl?: string;
  frontendCancelUrl?: string;
}

export interface NodePaymentDetailsInterface extends FormMainInterface, NodeAdditionalPaymentDetailsInterface {
}

export interface NodePaymentDetailsResponseInterface {
  getTransactionUrl: string;
  frontendFinishUrl: string;
  frontendCancelUrl: string;
  scriptUrl: string;
}
