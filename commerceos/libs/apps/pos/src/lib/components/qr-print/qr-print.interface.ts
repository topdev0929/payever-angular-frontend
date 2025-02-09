export enum PeQrPrintOperation {
  Print = 'print',
  Preview = 'preview',
  Download = 'download',
}

export enum PeQrPrintFileType {
  Png = 'png',
  Svg = 'svg',
  Pdf = 'pdf',
}

export interface PeQrPrintFormData {
  type: PeQrPrintFileType | string;
  url: string;
}

export interface PeQrPrintOverlayData {
  terminal: any;
}
