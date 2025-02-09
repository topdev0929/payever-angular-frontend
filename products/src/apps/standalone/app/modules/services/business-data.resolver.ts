import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { EnvService } from '@pe/common';

import { CommonService } from './common.service';

@Injectable()
export class BusinessDataResolver implements Resolve<any> {

  constructor(
    private httpClient: HttpClient,
    private commonService: CommonService,
    private envService: EnvService,
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.getBusinessData(this.commonService.businessUuid)
      .pipe(tap((business: any) => {
        this.commonService.businessData = business;
        this.envService.businessData = business;
      }));
  }

  getBusinessData(businessId: string): Observable<any> {
    const users: string = this.commonService.config.users;
    const url = `${users}/api/business/${businessId}`;
    return this.httpClient.get(url);
  }
}
