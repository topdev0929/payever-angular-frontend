export interface DetailsFormValue {
  birthday: Date;
  phone: string;
}

export interface RatesFormValue {
  duration: number;
  interest: number;
}

export interface TermValue {
  value: boolean;
  documentId: string;
}

export interface TemporaryTermsFormValue {
  legal: boolean;
}

export type TermsFormValue = {
  [key: string]: TermValue[];
} & TemporaryTermsFormValue;

export interface FormValue {
  ratesForm: RatesFormValue;
  detailsForm: DetailsFormValue;
  termsForm: TermsFormValue;
}
