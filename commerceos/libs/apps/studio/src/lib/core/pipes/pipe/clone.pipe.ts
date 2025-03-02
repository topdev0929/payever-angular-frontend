import { Pipe, PipeTransform } from '@angular/core';
import { cloneDeep } from 'lodash-es';

import { PeStudioCategory } from '../../interfaces';

@Pipe({
  name: 'clone',
})
export class ClonePipe implements PipeTransform {
  transform(value: PeStudioCategory[], args?: any): PeStudioCategory[] {
    return cloneDeep(value);
  }
}
