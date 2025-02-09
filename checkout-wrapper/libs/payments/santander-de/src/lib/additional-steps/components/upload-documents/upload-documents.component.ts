
import { Component, Input, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import dayjs from 'dayjs';

import { PickedFileInterface } from '../image-capture';
export interface DocumentDataInterface {
  type: string; // 'jpg' for example
  filename: string;
  base64: string;
}

@Component({
  selector: 'santander-de-upload-documents',
  templateUrl: './upload-documents.component.html',
  styleUrls: ['./upload-documents.component.scss'],
})
export class UploadDocumentsComponent {
  private overlayData: {
    close: (docs: DocumentDataInterface[]) => void
  } = inject(MAT_DIALOG_DATA);

  @Input() multipleFiles = true;
  @Input() title = 'Document upload';
  @Input() subtitle = 'Please select documents:';
  @Input() docsText = '';

  public docs: DocumentDataInterface[] = [];
  public isFilePicked = false;
  public errorMessage: string;
  private unNamedFileCount = 0;

  public get filePickerTitle(): string {
    return this.isFilePicked
      ? this.docs[0].filename
      : $localize `:@@checkout_sdk.action.pick:`;
  }

  public onFilePickedBase64(data: PickedFileInterface): void {
    const extension: string = this.getFileExtensionFromBase64(data.base64);
    this.docs.push({
      type: extension,
      filename: data.fileName || `${dayjs().format('DD-MM-YYYY-HH-mm-ss')}-${++this.unNamedFileCount}.${extension}`,
      base64: data.base64,
    });
    if (!this.multipleFiles) {
      this.isFilePicked = true;
    }
  }

  public onFileRemove(index?: number) {
    if (!this.multipleFiles) {
      this.isFilePicked = false;
      this.docs = [];

      return;
    }
    this.docs.splice(index, 1);
  }

  public back(): void {
    this.overlayData.close([]);
  }

  public done(): void {
    this.overlayData.close(this.docs);
  }

  public onErrorTriggered(error: string): void {
    this.errorMessage = error;
  }

  private getFileExtensionFromBase64(base64: string): string {
    return base64.split(';')[0].split('/')[1];
  }

}
