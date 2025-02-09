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
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this.getBusinessData(this.commonService.businessUuid)
      .pipe(tap((business: any) => {
        this.commonService.businessData = business;
        // todo: implement theme switcher
        // this.themeSwitcherService.changeTheme(business.themeSettings.theme);
        this.envService.businessData = business;
      }));
  }

  getBusinessData(businessId: string): Observable<any> {
    const users: string = this.commonService.backendConfig.users;
    const url: string = `${users}/api/business/${businessId}`;
    return this.httpClient.get(url, { withCredentials: true });
  }
}
