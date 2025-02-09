import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { PeAuthService } from '@pe/auth';

@Injectable()
export class PeBusinessResolver implements Resolve<any> {
  constructor(
    private http: HttpClient,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private envService: EnvService,
    private authService: PeAuthService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const uuid = state.url.split('business/')[1]?.split('/')[0];
    return this.getBusinessData(uuid).pipe(
      tap((business: any) => {
        this.envService.businessData = business;
        console.log('inside business resolver', this.envService.businessId);
      }),
    );
  }

  getBusinessData(businessId: string): Observable<any> {
    const users: string = this.env.backend.users;
    const url = `${users}/api/business/${businessId}`;
    return this.http.get(url, {
      headers: {
        Authorization: `Bearer ${this.authService.token}`,
      },
    });
  }
}
