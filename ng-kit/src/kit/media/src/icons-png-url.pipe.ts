import { Pipe, PipeTransform } from '@angular/core';
import { MediaService } from './media.service';

@Pipe({
  name: 'iconsPngUrl'
})
export class IconsPngUrlPipe implements PipeTransform {
  constructor(private mediaService: MediaService) {}
  transform(icon: string): string {
    return this.mediaService.getIconsPngUrl(icon);
  }
}
