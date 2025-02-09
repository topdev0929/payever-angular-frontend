import { HttpEvent, HttpProgressEvent, HttpResponse } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { flatMap, map, takeUntil } from 'rxjs/operators';

import { AbstractService, PlatformService } from '../../../common';
import { TranslateService } from '../../../i18n';
import { MediaService, BlobCreateResponse, MediaContainerType, MEDIA_CONFIG, MediaConfig } from '../../../media';
import { SnackBarService } from '../../../snack-bar';
import { ImageUploadConfigInterface, ImageUploadWithFileConfigInterface } from '../interfaces';

@Injectable()
export class ImageUploadService extends AbstractService {

  private readonly DEFAULT_MAX_IMAGE_SIZE: number = 5242880; // 5mb
  private readonly DEFAULT_MAX_IMAGE_SIZE_TEXT: string = '5MB';

  get maxFileSize(): number {
    const maxSize: number = { ...this.mediaModuleConfig }.maxImageSize;
    return maxSize || this.DEFAULT_MAX_IMAGE_SIZE;
  }

  get maxFileSizeText(): string {
    const maxSizeText: string = { ...this.mediaModuleConfig }.maxImageSizeText;
    return maxSizeText || this.DEFAULT_MAX_IMAGE_SIZE_TEXT;
  }

  constructor(@Inject(MEDIA_CONFIG) private mediaModuleConfig: MediaConfig,
              private mediaService: MediaService,
              private snackBarService: SnackBarService,
              private translateService: TranslateService,
              private platformService: PlatformService,
  ) {
    super();
  }

  // TODO: rename to selectMedia
  selectImage(type = 'image'): Observable<File> {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = `${type}/*`;
    input.setAttribute('pe-qa-upload-image', 'single');

    const res: Observable<File> = fromEvent(input, 'change').pipe(takeUntil(this.ngUnsubscribe), map(() => {
      input.remove();
      return (event.target as HTMLInputElement).files[0];
    }));

    if (!this.platformService.isTestEnvironment()) {
      input.click();
    } else {
      document.body.appendChild(input);
    }

    return res;
  }

  selectImageAndUpload(config: ImageUploadConfigInterface): Observable<HttpEvent<BlobCreateResponse>> {
    return this.selectImage().pipe(takeUntil(this.ngUnsubscribe), flatMap((file: File) => {
      return this.uploadImage({ file, ...config });
    }));
  }

  uploadImage(config: ImageUploadWithFileConfigInterface): Observable<HttpEvent<BlobCreateResponse>> {
    if (!config) {
      throw new Error('Provided config is not valid');
    }

    if (config.checkImage && !this.checkImage(config.file, config.showErrors)) {
      throw new Error('Image file is not valid');
    }

    return this.postImage(config.file, config.businessId, config.container);
  }

  checkImage(file: File, showErrors: boolean): boolean {
    if (!file.type.startsWith(`image/`) ) {
      if (showErrors) {
        this.snackBarService.show(this.translateService.translate('ng_kit.forms.error.image_picker.wrong_type'));
      }
      return false;
    }

    if (!this.isFileSizeValid(file) ) {
      if (showErrors) {
        this.snackBarService.show(this.translateService.translate('ng_kit.forms.error.image_picker.max_size', {size: this.maxFileSizeText}));
      }
      return false;
    }

    return true;
  }

  postImage(file: File, businessId: string, container: MediaContainerType): Observable<HttpEvent<BlobCreateResponse>> {
    return this.mediaService.createBlobByBusiness(businessId, container, file);
  }

  deleteImage(blobName: string, businessId: string, container: MediaContainerType): Observable<void> {
    return this.mediaService.deleteBlobByBusiness(businessId, container, blobName);
  }

  isFileSizeValid(file: File): boolean {
    return file.size <= this.maxFileSize;
  }

  getProgressFromEvent(event: HttpProgressEvent): number {
    return Number(((event.total * 100) / event.loaded).toFixed(0));
  }

  getBlobNameFromEvent(event: HttpResponse<BlobCreateResponse>): string {
    if (!event.body.blobName) {
      throw new Error('Cannot extract blobName from response');
    }
    return event.body.blobName;
  }
}
