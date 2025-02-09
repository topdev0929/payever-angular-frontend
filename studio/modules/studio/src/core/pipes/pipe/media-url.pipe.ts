import { Pipe, PipeTransform } from '@angular/core';
import { MediaService, MediaUrlTypeEnum } from '@pe/media';
@Pipe({
  name: 'studioMedia',
})
export class StudioMediaUrlPipe implements PipeTransform {
  constructor(private mediaService: MediaService) {}

  transform(blob: string, container: string, type: MediaUrlTypeEnum = null, size: string = null): string {
    return this.mediaService.getMediaUrl(blob, container, type, size);
  }
}
