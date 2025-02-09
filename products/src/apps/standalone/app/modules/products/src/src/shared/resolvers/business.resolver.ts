import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { EnvService } from '../services/env.service';
import { ProductsApiService } from '../services/api.service';

@Injectable()
export class BusinessResolver implements Resolve<any> {
  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private envService: EnvService,
    private apiService: ProductsApiService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any {
    const uuid = state.url.split('business/')[1]?.split('/')[0];
    this.envService.businessUuid = uuid;
    return this.apiService.getBusiness(uuid).pipe(
      map((data: any) => {
        this.envService.business = data.data.getBusiness;
      }),
    );
  }
}
