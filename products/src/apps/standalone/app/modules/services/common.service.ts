import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { EnvService } from './env.service';

export declare type UserType = 'partner' | 'customer';

export enum UserTypes {
  Partner = 'partner',
  Customer = 'customer',
}

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  get config() {
    try {
      return this.env.backend;
    } catch (e) {}
    return null;
  }

  public userType: UserType = UserTypes.Partner;

  public set businessUuid(value: string) {
    this.businessUuidSorce$.next(value);
  }

  public get businessUuid(): string {
    return this.businessUuidSorce$.getValue();
  }

  protected businessUuidSorce$: BehaviorSubject<string> = new BehaviorSubject(undefined);

  // tslint:disable-next-line:member-ordering
  public businessUuid$: Observable<string> = this.businessUuidSorce$.asObservable();

  private businessDataValue$: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  get businessData$(): Observable<any> {
    return this.businessDataValue$.asObservable();
  }

  get businessData(): any {
    return this.businessDataValue$.value;
  }

  set businessData(business: any) {
    this.businessDataValue$.next(business);
  }

  constructor(@Inject(PE_ENV) private env: EnvironmentConfigInterface, private envService: EnvService) {}

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    this.businessUuid = route.params.businessUuid;
    this.envService.businessUuid = route.params.businessUuid;
    return of({
      businessUuid: this.businessUuid,
    });
  }
}
