export interface FormRatesMainInterface {
  socialSecurityNumber?: string;
  registeredPostNumber?: string;
  telephoneMobile?: string;
}

export interface FormAmlInterface {
  politicalExposedPerson?: boolean;
  appliedOnBehalfOfOthers?: boolean;
  paySource?: string;
  professionalStatus?: string;
  payWithMainIncome?: boolean;
  otherPaySource?: string;
}

export interface FormInterface {
  formRatesMain?: FormRatesMainInterface;
  formAml?: FormAmlInterface;
}

export interface NodePaymentDetailsInterface extends FormRatesMainInterface {
  ___?: void; // To fix lint error
}

export interface NodePaymentResponseDetailsInterface {
  applicantSignReferenceUrl: string;
  applicationNumber: string;
}
