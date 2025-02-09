export enum PebDroppedFileEnum {
  Image = 'image',
  Video = 'video',
}

export interface PebUploadedFile {
  url: string;
  preview: string;
  fileType: PebDroppedFileEnum;
  mimeType: string;
}
