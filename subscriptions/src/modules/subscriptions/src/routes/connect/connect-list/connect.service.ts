import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Injectable({ providedIn: 'root' })
export class PeConnectService {
  businessId = this.router.url.split('/')[2] || '1c26bc12-0d41-4db2-a45a-95d7b50b84b2';

  subscriptionsBackend = `${this.env.backend.billingSubscription}/api`;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
    private router: Router,
  ) {}
}
