import { Pipe, PipeTransform } from '@angular/core';
import { Location } from '@angular/common';

import { EnvironmentConfigService } from '../../environment-config';
import { CustomConfigInterface } from '../../environment-config/src/interfaces';
import { MediaService, MediaUrlTypeEnum } from './media.service';

/*
 * Create media url based on blob name
 *
 * Takes a container argument and size argument
 * Takes an optional type argument - 'thumbnail', 'blurred' or 'regular'
 * Takes an optional size argument
 * Usage:
 *   myBlobName | mediaUrl:container:type
 * Example:
 *   {{ 'my-blob.jpg' | mediaUrl:'products':'thumbnail' }}
 *   formats to: https://payeverstaging.blob.core.windows.net/products-sm/my-blob.jpg
*/
@Pipe({name: 'mediaUrl'})
export class MediaUrlPipe implements PipeTransform {

  constructor(
    private configService: EnvironmentConfigService,
    private mediaService: MediaService
  ) {}

  transform(blob: string, container: string, type: MediaUrlTypeEnum = null, size: string = null): string {
    return this.mediaService.getMediaUrl(blob, container, type, size);
  }
}
