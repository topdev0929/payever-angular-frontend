import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';

import { PebRestrictAccessFormInterface } from './restrict-access-form.interface';

@Injectable({ providedIn: 'any' })
export class PebRestrictAccessFormService {

  getPageRestrictAccess(): PebRestrictAccessFormInterface {
    return undefined;
  }

  setPageRestrict(restrictAccess: PebRestrictAccessFormInterface): Observable<any> {
    return EMPTY;
  }
}
