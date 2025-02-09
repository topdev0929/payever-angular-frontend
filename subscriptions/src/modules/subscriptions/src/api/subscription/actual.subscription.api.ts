import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';

import { EnvService } from '@pe/common';

import { PeSubscriptionApi } from './abstract.subscription.api';
import { ProgramEntity } from './subscription.api.interface';
import { PEB_SUBSCRIPTION_API_PATH } from '../../constants';
import { SubscriptionEnvService } from './subscription-env.service';

@Injectable()
export class PeActualSubscriptionApi extends PeSubscriptionApi {

  apiURL = `${this.subscriptionApiPath}/api/business/${this.envService.businessId}`;

  constructor(
    @Inject(PEB_SUBSCRIPTION_API_PATH) private subscriptionApiPath: string,
    @Inject(EnvService) private envService: SubscriptionEnvService,
    private http: HttpClient,
  ) {
    super();
  }

  getAllPlans(): Observable<ProgramEntity[]> {
    return this.http.get<ProgramEntity[]>(`${this.apiURL}/subscription-plans`);
  }

  addPlan(data: any): Observable<any> {
    return this.http.post(`${this.apiURL}/subscription-plans`, data);
  }

  editPlan(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiURL}/subscription-plans/${id}`, data);
  }

  getPlan(id: string) {
    return this.http.get(`${this.apiURL}/subscription-plans/${id}`);
  }

  deletePlans(ids: string[]) {
    const delete$ = ids.map((id: string) => this.http.delete<any>(`${this.apiURL}/subscription-plans/${id}`));
    return forkJoin(delete$);
  }
}
