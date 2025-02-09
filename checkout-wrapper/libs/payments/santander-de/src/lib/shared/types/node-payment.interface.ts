export interface SendDocument {
  documentType: string;
  file: string; // base64 but without prefix
  filename: string;
}