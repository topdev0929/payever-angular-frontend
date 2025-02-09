import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebAPIDataSourceSchema, PebActionSchema } from '@pe/builder/core';

import { PAGE_SIZE } from '../constants';

@Injectable({ providedIn: 'any' })
export class PebIntegrationApiService {
  constructor(
    private readonly http: HttpClient,
    private readonly appEnv: PeAppEnv,
  ) {
  }

  getIntegrations(app: string, connectorId: string): Observable<(PebActionSchema | PebAPIDataSourceSchema)[]> {
    const params = { app, page: 1, limit: PAGE_SIZE };

    return this.http
      .get<PebContextSchemaResponse>(`${this.appEnv.builder}/api/integration/context`, { params })
      .pipe(
        map(response => response.documents.map(item => ({ ...item, connectorId }))),
      );
  }

  getIntegrationDetail(id: string): Observable<PebAPIDataSourceSchema> {
    return this.http.get<PebAPIDataSourceSchema>(`${this.appEnv.builder}/api/integration/${id}`);
  }

  getData(uniqueTag: string, params: any): Observable<any> {
    const payload = {
      uniqueTag,
      params: {
        businessId: this.appEnv.business,
        ...params,
      },
    };

    const url = `${this.appEnv.builder}/api/integration/context/fetch`;

    return this.http.post(url, payload);
  }

  postData(params: { url?: string, body?: any, options?: any }): Observable<any> {
    const url = params.url ?? `${this.appEnv.builder}/api/integration/context/action`;

    return this.http.post(
      url,
      params.body,
      params.options
    );
  }
}

interface PebContextSchemaResponse {
  documents: (PebActionSchema | PebAPIDataSourceSchema)[];
}