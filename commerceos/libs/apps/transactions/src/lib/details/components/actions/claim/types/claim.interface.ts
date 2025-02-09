export interface AddFileInterface {
  fileName: string;
  fileBase64: string;
  type: string;
  size: number;
}

export interface DocumentOptionInterface {
  value: string;
  label: string;
}

export interface ClaimDocumentsInfoInterface {
  fileName: string;
  mimeType: string;
  documentType: DocumentType;
  base64Content: string;
}

export interface ClaimContextInfo {
  isInsolvencyProceeding: boolean;
  isInvoiceDisputed: boolean;
}

export interface ClaimFormInterface {
  documents: ClaimDocumentsInfoInterface[]
}
