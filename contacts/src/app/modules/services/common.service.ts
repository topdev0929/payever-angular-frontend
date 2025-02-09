import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';
import { EnvironmentConfigInterface } from '@pe/common/environment-config/interfaces/environment-config.interface';

import { SandboxEnv } from './env.service';

export declare type UserType = 'partner' | 'customer';

export enum UserTypes {
  Partner = 'partner',
  Customer = 'customer'
}

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  get backendConfig(): NodeJsBackendConfigInterface {
    return this.envConfig.backend;
  }

  public userType: UserType = UserTypes.Partner;

  public set businessUuid(value: string) {
    this.businessUuidSorce$.next(value);
  }

  public get businessUuid(): string {
    return this.businessUuidSorce$.getValue();
  }

  protected businessUuidSorce$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  public businessUuid$: Observable<string> = this.businessUuidSorce$.asObservable();

  private businessDataValue$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get businessData(): any {
    return this.businessDataValue$.value;
  }

  set businessData(business: any) {
    this.businessDataValue$.next(business);
  }

  constructor(
    @Inject(PE_ENV) private envConfig: EnvironmentConfigInterface,
    private envService: SandboxEnv,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.businessUuid = route.params['businessUuid'];
    this.envService.businessUuid = route.params['businessUuid'];
    return of({
      businessUuid: this.businessUuid
    });
  }

}
