import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';

import { UserBusinessDataInterface, UserBusinessInterface } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {

  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private http: HttpClient,
    private router: Router
  ) {}

  getUserBusinessesList(): Observable<UserBusinessDataInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.connect}/api/business/${this.getBusinessId()}/integration?businessData=true`;
    return this.http.get<UserBusinessDataInterface>(url);
  }

  saveUserBusinesses(businessId: string, data: UserBusinessInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    return this.http.patch<void>(`${config.users}/api/business/${businessId}`, data);
  }

  getBusinessId(): string {
    const data = this.router.url.split('/');
    return data[2];
  }
}
