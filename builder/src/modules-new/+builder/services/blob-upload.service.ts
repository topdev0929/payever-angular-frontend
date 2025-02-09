import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, fromEvent, merge, Observable, throwError } from 'rxjs';
import { filter, map, take, tap } from 'rxjs/operators';

import { pebCreateElement, PebElement, PebElementType, PebScreen } from '@pe/builder-core';
import { EditorAppendElementInterface } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { EDITOR_CONTENT_WIDTH } from '@pe/builder-editor/projects/modules/shared/interfaces';
import { PlatformService } from '@pe/ng-kit/modules/common';
import { CustomConfigInterface, EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { ImageUploadService } from '@pe/ng-kit/modules/form';
import { BlobCreateResponse, FileUploadResponse, MediaContainerType, MediaService } from '@pe/ng-kit/modules/media';

interface ElementDs {
  width: number;
  height: number;
}

@Injectable()
export class BlobUploadService {
  constructor(
    private imageUploadService: ImageUploadService,
    private configService: EnvironmentConfigService,
    private mediaService: MediaService,
    private readonly platformService: PlatformService,
  ) {}

  /**
   * Upload file to 'miscellaneous' blob container without information about business
   */
  uploadLogo(file: File): Observable<string> {
    return this.mediaService.uploadFile(file).pipe(
      filter(response => response.type === HttpEventType.Response),
      map((event: HttpResponse<FileUploadResponse>) => {
        return event.body.url;
      }),
    );
  }

  /**
   * Upload file to 'builder' container. But need to pass business id
   */
  createBlob(businessId: string, file: File, type: 'video' | 'image' = 'image'): Observable<string> {
    return this.mediaService.createBlobByBusiness(businessId, MediaContainerType.Builder, file).pipe(
      filter(response => response.type === HttpEventType.Response),
      map((event: HttpResponse<BlobCreateResponse>) => {
        const config: CustomConfigInterface = this.configService.getCustomConfig();
        const blobName: string = this.imageUploadService.getBlobNameFromEvent(event) || '';

        return `${config.storage}/${type === 'video' ? 'builder-video' : MediaContainerType.Builder}/${blobName}`;
      }),
    );
  }

  deleteBlob(blobName: string, businessId: string, container: MediaContainerType): Observable<void> {
    return this.mediaService.deleteBlobByBusiness(businessId, container, blobName);
  }

  createImageElement(
    file: File,
    elementToAppend: EditorAppendElementInterface,
  ): Observable<{ file: File; element: PebElement }> {
    const element: PebElement = pebCreateElement(PebElementType.Image);
    element.meta.loading = true;
    const img: HTMLImageElement = new Image();
    img.src = window.URL.createObjectURL(file);
    const screen = elementToAppend.component && elementToAppend.component.screen;

    return merge(
      fromEvent(img, 'load').pipe(
        take(1),
        map(() => {
          const { width, height } = fitImageIntoParent(img, elementToAppend.dimensions);

          window.URL.revokeObjectURL(img.src);
          element.style = { width: { [screen]: width }, height: { [screen]: height } };

          return { file, element };
        }),
      ),
      fromEvent(img, 'error').pipe(
        take(1),
        tap((err: any) => {
          throwError(err);
        }),
      ),
    );
  }

  createCarouselElement(
    files: File[],
    elementToAppend: EditorAppendElementInterface,
  ): Observable<{ files: File[]; element: PebElement }> {
    const element: PebElement = pebCreateElement(PebElementType.Carousel);
    element.meta.loading = true;
    const images = files.map(file => {
      const img = new Image();
      img.src = window.URL.createObjectURL(file);

      return img;
    });
    const screen = elementToAppend.component && elementToAppend.component.screen;

    const sources = images.map(image => fromEvent(image, 'load'));

    return combineLatest(sources).pipe(
      map((events: Event[]) => {
        const { width, height } = fitImageIntoParent(images[0], elementToAppend.dimensions);

        images.forEach(image => window.URL.revokeObjectURL(image.src));

        element.style = { width: { [screen]: width }, height: { [screen]: height } };

        return { files, element };
      }),
    );
  }

  selectImages(): Observable<File[]> {
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.setAttribute('pe-qa-upload-image', 'multiple');

    const res: Observable<File[]> = fromEvent(input, 'change').pipe(
      tap(() => input.remove()),
      map(event => {
        return Array.from((event.target as HTMLInputElement).files);
      }),
    );

    if (!this.platformService.isTestEnvironment()) {
      input.click();
    } else {
      document.body.appendChild(input);
    }

    return res;
  }
}

const fitImageIntoParent = (img: HTMLImageElement, parentDs: ElementDs): ElementDs => {
  const widthScale = parentDs.width / img.naturalWidth;
  const heightScale = parentDs.height / img.naturalHeight;
  const scale = Math.min(widthScale, heightScale);
  const newWidth = img.naturalWidth * scale;
  const newHeight = img.naturalHeight * scale;

  if (scale >= 1) {
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
    };
  }

  return {
    width: newWidth,
    height: newHeight,
  };
};
