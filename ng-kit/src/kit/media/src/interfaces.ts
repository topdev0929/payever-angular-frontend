export interface MediaConfig {
  maxImageSize?: number; // in bytes
  maxImageSizeText?: string; // text like '5MB' - used in error message
}

export interface BlobCreateResponse {
  blobName: string;
  brightnessGradation?: string;
}

export interface FileUploadResponse {
  id: string;
  url: string;
}
