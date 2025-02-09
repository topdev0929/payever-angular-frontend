export interface DetailsFormValue {
  birthday: Date;
  phone: string;
}

export interface TermValue {
  value: boolean;
  documentId: string;
  label: string;
}

export interface TemporaryTermsFormValue {
  legal: boolean;
}

export type TermsFormValue = {
  [key: string]: TermValue[];
} & TemporaryTermsFormValue;

export interface FormValue {
  detailsForm: DetailsFormValue;
  termsForm: TermsFormValue;
}
