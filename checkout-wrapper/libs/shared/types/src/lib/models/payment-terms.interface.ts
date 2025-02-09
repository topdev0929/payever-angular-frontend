export interface PaymentTerms {
  consents: PaymentTermsDocument[];
  policies: PaymentTermsDocument[];
  terms: PaymentTermsDocument[];
}

export interface PaymentTermsDocument {
  documentId: string;
  metadata: PaymentTermsDocumentMetadata;
  required: boolean;
  sortOrder: number;
  text: string;
  title: string;
}

export interface PaymentTermsDocumentMetadata {
  assetsLinks: Record<string, string>;
  poEditorKey: string;
  poEditorText: string;
}
