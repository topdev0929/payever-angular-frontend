import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService } from '@pe/common';

import { PeSettingsApi } from './abstract.settings.api';
import { PEB_SUBSCRIPTION_API_PATH } from '../../constants';
import { SubscriptionEnvService } from '../subscription/subscription-env.service';

@Injectable()
export class PeActualSettingsApi extends PeSettingsApi {
  apiURL = `${this.subscriptionApiPath}/api/business/${this.envService.businessId}`;

  constructor(
    @Inject(PEB_SUBSCRIPTION_API_PATH) private subscriptionApiPath: string,
    private http: HttpClient,
    @Inject(EnvService) private envService: SubscriptionEnvService,
  ) {
    super();
  }

  getBillingSubscriptionAccess(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/billing-subscription/access/${id}`);
  }

  updateBillingSubscriptionAccessConfig(id: string, data: any): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/billing-subscription/access/${id}`, { data });
  }

  getBillingSubscriptionAccessIsLive(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/billing-subscription/access/${id}/is-live`);
  }

  getAllDomains(planId: string): Observable<any> {
    return this.http.get<any>(`${this.apiURL}/domain/${planId}`);
  }

  addDomain(domain: string): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/domain/${this.envService.applicationId}`, { name: domain });
  }

  deleteDomain(domainId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiURL}/domain/${this.envService.applicationId}/${domainId}`);
  }

  checkDomain(domainId: string): Observable<any> {
    return this.http.post<any>(`${this.apiURL}/domain/${this.envService.applicationId}/${domainId}/check`, {});
  }
  validDomain(name: string): Observable<any> {
    const params = new HttpParams().append('name', name);
    return this.http.get<any>(`${this.apiURL}/domain/${this.envService.applicationId}/isValidName`, { params });
  }
}
