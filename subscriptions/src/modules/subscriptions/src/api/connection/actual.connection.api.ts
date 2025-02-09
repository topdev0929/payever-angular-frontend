import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService } from '@pe/common';

import { PeConnectionApi } from './abstract.connection.api';
import { PEB_SUBSCRIPTION_API_PATH } from '../../constants';
import { SubscriptionEnvService } from '../subscription/subscription-env.service';

@Injectable()
export class PeActualConnectionApi extends PeConnectionApi {
  apiURL = `${this.subscriptionApiPath}/api/business/${this.envService.businessId}`;

  constructor(
    @Inject(PEB_SUBSCRIPTION_API_PATH) private subscriptionApiPath: string,

    private http: HttpClient,
    @Inject(EnvService) private envService: SubscriptionEnvService,
  ) {
    super();
  }

  getAllConnections() {
    return this.http.get<any>(`${this.apiURL}/connection`);
  }

  updateConnectionInstall(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/connection/${id}/install`, {});
  }

  updateConnectionUnInstall(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiURL}/connection/${id}/uninstall`, {});
  }
}
