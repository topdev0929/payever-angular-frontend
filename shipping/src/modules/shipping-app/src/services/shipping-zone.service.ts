import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ShippingZoneInterface } from '../interfaces';
import { PEB_SHIPPING_API_PATH } from '../constants';
import { EnvService } from '@pe/common';

@Injectable({ providedIn: 'any' })
export class PebShippingZoneService {
  constructor(
    private http: HttpClient,
    @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
    private envService: EnvService,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  baseUrl = `${this.shippingApiPath}/business/${this.businessId}/shipping-zone`;

  getShippingZoneById(zoneId) {
    return this.http.get(`${this.baseUrl}/${zoneId}`);
  }

  editShippingZone(id: string, data: ShippingZoneInterface) {
    const payload: ShippingZoneInterface = {
      name: data.name,
      countryCodes: data.countryCodes,
      rates: data.rates,
    };

    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  addShippingZone(payload: ShippingZoneInterface) {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  deleteShippingZone(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
