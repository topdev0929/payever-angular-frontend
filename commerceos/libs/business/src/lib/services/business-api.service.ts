import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { TokensInterface } from '@pe/api';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { BusinessInterface, BusinessListInterface, UpdateBusinessInterface } from '../business.interface';

@Injectable({
  providedIn: 'root',
})
export class BusinessApiService {
  constructor(private httpClient: HttpClient, @Inject(PE_ENV) private env: EnvironmentConfigInterface) {}

  updateBusinessData(id: string, newData: UpdateBusinessInterface): Observable<BusinessInterface> {
    const url = `${this.env.backend.users}/api/business/${id}`;

    return this.httpClient.patch<BusinessInterface>(url, newData);
  }

  getBusinessData(businessId: string): Observable<BusinessInterface> {
    const url = `${this.env.backend.users}/api/business/${businessId}`;

    return this.httpClient.get<BusinessInterface>(url);
  }

  getBusinessesList(active= 'false', page?: string, limit?: string): Observable<BusinessListInterface> {
    const url = `${this.env.backend.users}/api/business`;

    return this.httpClient.get<BusinessListInterface>(url,{ params:{
      page: page ?? '1',
      limit: limit ?? '20',
      active,
    }});
  }

  getactiveBusiness() {
    const url = `${this.env.backend.users}/api/business`;

    return this.httpClient.get<{ businesses:BusinessInterface[],total:number}>(url,{ params:{
      active:'true',
    } });
  }


  enableBusiness(businessId: string): Observable<TokensInterface> {
    const url = `${this.env.backend.auth}/api/business/${businessId}/enable`;

    return this.httpClient.patch<TokensInterface>(url, {});
  }

  getBusinessWallpaper(businessId: string) {
    return this.httpClient.get(`${this.env.backend.wallpapers}/api/business/${businessId}/wallpapers`);
  }

  checkAccess<T>(businessId: string): Observable<T> {
    return this.httpClient.get<T>(
      `${this.env.backend.auth}/api/business/${businessId}/enable/access`,
    );
  }
}
