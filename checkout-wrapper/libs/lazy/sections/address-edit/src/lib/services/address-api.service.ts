import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { AddressItem } from '@pe/checkout/forms/address-autocomplete';
import { GetCompanyRequestDto, GetCompanyResponseDto } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common';

@Injectable({
  providedIn: 'root',
})
export class AddressApiService {

  private readonly http = inject(HttpClient);
  private readonly env = inject(PE_ENV);

  private readonly sessionId = Date.now().toString();

  public getCompany(connectionId: string, data: GetCompanyRequestDto) {
    return this.http.post<GetCompanyResponseDto[]>(
      `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/company-search`,
      data,
    );
  }

  public getAddresses(search: string) {
    return this.http.get<AddressItem[]>(
      `${this.env.backend.checkout}/api/flow/v1/address/search`,
      { params: new HttpParams().appendAll({ q: search, sessionId: this.sessionId }) },
    );
  }
}
