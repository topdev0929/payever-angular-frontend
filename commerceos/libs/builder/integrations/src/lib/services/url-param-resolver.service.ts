import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';

import { PebPageParamsResolver } from '../interfaces/page-params-resolver.interface';

@Injectable({ providedIn: 'any' })
export class PebUrlParamsResolver implements PebPageParamsResolver {
  constructor(
    private readonly route: ActivatedRoute,
  ) {
  }
  
  getParams(): Observable<any> {
    return of(this.route.snapshot.queryParams);
  }
}
