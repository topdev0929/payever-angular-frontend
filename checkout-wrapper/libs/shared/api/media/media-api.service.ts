import { Location } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

import { CustomConfigInterface, EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

enum MediaUrlTypeEnum {
  Regular = 'regular',
  Thumbnail = 'thumbnail',
  GridThumbnail = 'grid-thumbnail',
  Blurred = 'blurred',
  BlurredThumbnail = 'blurred-thumbnail'
}

@Injectable({
  providedIn: 'root',
})
export class MediaApiService {

  constructor(@Inject(PE_ENV) private env: EnvironmentConfigInterface) {}

  getMediaUrl(blob: string, container: string, type: MediaUrlTypeEnum = null, size: string = null): string {
    if (!blob) {
      return blob;
    }
    if (blob.startsWith('http://') || blob.startsWith('https://')) {
      return blob;
    }
    type = type || MediaUrlTypeEnum.Regular;
    const containerUrlPart: string = size ? `${container}:${size}` : container;
    const config: CustomConfigInterface = this.env.custom;
    const baseUrlNormalized: string = Location.stripTrailingSlash(config.storage);

    // NOTE: Suffixes '-thumbnail' and '-blurred' are set y media micro (NOT FOR ALL BLOB CONTAINERS!)
    const blobName: string = ['regular', ''].indexOf(type) >= 0 ? blob : `${blob}-${type}`;

    const blobEncoded: string = encodeURIComponent(blobName).replace('(', '%28').replace(')', '%29');

    return `${baseUrlNormalized}/${containerUrlPart}/${blobEncoded}`;
  }
}
