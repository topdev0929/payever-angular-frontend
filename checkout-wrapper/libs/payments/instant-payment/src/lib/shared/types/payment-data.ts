export interface NodePaymentDetailsResponseInterface {
  senderHolder?: string;
  senderIban?: string;
  transactionId?: string;
  wizardSessionKey?: string;
}

export interface FormCardMainInterface {
  senderHolder?: string;
  senderIban?: string;
}
export interface FormCardCheckboxes1Interface {
  adsAgreement?: boolean;
}

export interface FormInterface {
  formCardMain?: FormCardMainInterface;
  formCardCheckboxes1?: FormCardCheckboxes1Interface;
}

export interface NodeAdditionalPaymentDetailsInterface {
  recipientHolder?: string;
  recipientIban?: string;
}

export interface NodePaymentDetailsInterface extends
  FormCardMainInterface,
  FormCardCheckboxes1Interface,
  NodeAdditionalPaymentDetailsInterface {
}
