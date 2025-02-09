export interface ZiniaViewTerms {
  [key: string]: ZiniaViewTerm[];
}

export interface ZiniaViewTerm {
  label: string;
  required: boolean;
  documentId: string;
}

export interface TermsDTOValue {
  label: string;
  required: boolean;
  documentId: string;
}

export interface TermsDTO {
  [key: string]: TermsDTOValue[];
}
