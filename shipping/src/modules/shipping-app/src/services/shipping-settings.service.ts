import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PEB_SHIPPING_API_PATH } from '../constants';
import { EnvService } from '@pe/common';

@Injectable({ providedIn: 'any' })
export class PebShippingSettingsService {
  constructor(
    private http: HttpClient,
    @Inject(PEB_SHIPPING_API_PATH) private shippingApiPath: string,
    private envService: EnvService,
  ) {}

  private get businessId() {
    return this.envService.businessId;
  }

  baseUrl = `${this.shippingApiPath}/business/${this.businessId}/shipping-settings`;

  getSettings() {
    return this.http.get(this.baseUrl);
  }

  editSettingDefaultOrigin(originId) {
    return this.http.put(`${this.baseUrl}/default-origin/${originId}`, {});
  }

  addProfile(payload) {
    return this.http.post(`${this.baseUrl}`, payload);
  }

  editProfile(profileId, payload) {
    return this.http.put(`${this.baseUrl}/${profileId}`, payload);
  }

  deleteProfile(profileId) {
    return this.http.delete(`${this.baseUrl}/${profileId}`);
  }
}
