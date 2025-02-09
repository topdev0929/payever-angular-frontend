import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvService, EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ChannelTypes } from '../../shared/enums/product.enum';

@Injectable()
export class AttribuiteApiService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
    private envService: EnvService,
  ) { }

  getSchema(category: string, integrations: ChannelTypes[]): Observable<any[]> {
    const businessId: string = this.envService.businessId;
    const url = `${this.env.thirdParty.products}/api/business/${businessId}/integration/${integrations[0]}/category/schema`;

    return this.http.get<any>(url, { params: { category } });
  }
}
