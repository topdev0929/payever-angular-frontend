import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PEB_SHIPPING_API_PATH } from '../constants';
import { EnvService } from '@pe/common';

@Injectable({ providedIn: 'any' })
export class PebShippingBusinessService {
  constructor(
    private http: HttpClient,
    @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
    private envService: EnvService,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  private baseUrl = `${this.shippingApiPath}/business/${this.businessId}`;

  getShippingSettings() {
    return this.http.get(`${this.baseUrl}`);
  }
}
