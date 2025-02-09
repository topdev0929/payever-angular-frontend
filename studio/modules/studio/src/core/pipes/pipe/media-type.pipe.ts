import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
  name: 'getMedia',
})
export class MediaTypePipe implements PipeTransform {
  transform(value: any[], args?: any): any {
    const items = {
      images: [],
      videos: []
    };
    value.forEach(data => {
      if (data.type === 'video'){
        items.videos.push(data);
      }
      if (data.type === 'image'){
        items.images.push(data);
      }
    }
      );
    return _.cloneDeep(items);

  }
}
