import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { PeAppEnv } from '@pe/app-env';
import { BusinessState } from '@pe/user';

import { PebAccessConfig, PebAppDTO, PebPreviewDTO } from './apps.interface';


@Injectable()
export class PebAppsApi {

  get baseUrl(): string {
    const business = this.store.selectSnapshot(BusinessState.businessData);

    return `${this.env.api}/api/business/${business._id}/${this.env.type}`;
  }

  constructor(
    private readonly env: PeAppEnv,
    private readonly http: HttpClient,
    private store: Store,
  ) {
  }

  getList(isDefault?: boolean) {
    return this.http.get<any>(this.baseUrl, { params: isDefault ? { isDefault: JSON.stringify(isDefault) } : null });
  }

  getSingle(id: string) {
    return this.http.get<PebAppDTO>(`${this.baseUrl}/${id}`);
  }

  create(payload: any) {
    return this.http.post<any>(this.baseUrl, payload);
  }

  validateName(name: string) {
    return this.http.get<any>(`${this.baseUrl}/isValidName?name=${name}`);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  update(payload: any) {
    const { id, ...body } = payload;

    return this.http.patch<any>(`${this.baseUrl}/${id}`, body);
  }

  markAsDefault(id: string) {
    return this.http.put<any>(`${this.baseUrl}/${id}/default`, {});
  }

  getDefault() {
    return this.http.get<any>(`${this.baseUrl}/default`);
  }

  updateAccessConfig(id: string, payload: Partial<PebAccessConfig>) {
    return this.http.patch<PebAccessConfig>(`${this.baseUrl}/access/${id}`, payload);
  }

  getPreview(id: string, include?: string[]) {
    return this.http.get<PebPreviewDTO>(`${this.baseUrl}/${id}/preview`, { params: { page: 'front' } });
  }

  checkIsLive(id: string) {
    return this.http.get<boolean>(`${this.baseUrl}/access/${id}/is-live`);
  }

  patchIsLive(id: string, isLive: boolean) {
    return this.http.patch(`${this.baseUrl}/access/${id}`, { isLive });
  }

  getAllDomains(id: string) {
    return this.http.get<any>(`${this.baseUrl}/${id}/domain`);
  }

  addSocialImage(accessId: string, image: string) {
    return this.http.patch(`${this.baseUrl}/access/${accessId}`, { socialImage: image });
  }

  addDomain(id: string, domain: string) {
    return this.http.post<any>(`${this.baseUrl}/${id}/domain`, { name: domain });
  }

  checkDomain(id: string, domainId: string) {
    return this.http.post<any>(`${this.baseUrl}/${id}/domain/${domainId}/check`, {});
  }

  patchDomain(id: string, domainId: string, domain: string) {
    return this.http.patch(`${this.baseUrl}/${id}/domain/${domainId}`, { name: domain });
  }

  deleteDomain(id: string, domainId: string) {
    return this.http.delete(`${this.baseUrl}/${id}/domain/${domainId}`);
  }
}
