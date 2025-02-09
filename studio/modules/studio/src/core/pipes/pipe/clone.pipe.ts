import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
@Pipe({
  name: 'clone',
})
export class ClonePipe implements PipeTransform {
  transform(value: any, args?: any): Observable<any> {
    return _.cloneDeep(value);
  }
}
