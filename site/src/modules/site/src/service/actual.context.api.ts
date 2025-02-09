import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { catchError, map, pluck, tap } from 'rxjs/operators';
import { get, set } from 'lodash';

import {
  PebContextActionParams,
  PebContextIntegration,
  PebContextIntegrationAction,
  PebContextIntegrationActionFieldMeta,
  PebFilterParams,
  PebOrderParams,
  PebPaginationParams,
} from '@pe/builder-core';
import { EnvService, PE_ENV } from '@pe/common';
import { PebContextApi, PEB_EDITOR_API_PATH } from '@pe/builder-api';

import { SiteEnvService } from './site-env.service';



@Injectable({ providedIn: 'any' })
export class PebActualContextApi implements PebContextApi {

  constructor(
    protected http: HttpClient,
    @Optional() @Inject(PE_ENV) protected env: any,
    @Inject(PEB_EDITOR_API_PATH) protected editorApiPath: string,
    @Inject(EnvService) protected envService: SiteEnvService,
  ) {
  }

  fetchIntegrations(): Observable<PebContextIntegration[]> {
    return this.http.get(`${this.editorApiPath}/api/context/cache`).pipe(
      map((cache: { components: any, integrations: PebContextIntegration[] }) => cache?.integrations ?? []),
      catchError((err) => {
        console.error(err);

        return of([]);
      }),
    );
  }

  fetchAction<T = any>({ integration, action, id = '', filter = [], order = [], pagination = {} }: {
    integration: PebContextIntegration,
    action: PebContextIntegrationAction,
    id?: string,
    filter?: PebFilterParams,
    order?: PebOrderParams,
    pagination?: PebPaginationParams,
  }): Observable<any> {
    const { offset = 0, limit = 100 } = pagination;
    const integrationUrl = get(this.env, integration.envUrl, integration.url);
    return this.http.post(`${integrationUrl}${action.url}`, {
      [action.queryType]: `{
        ${action.method} (
          ${this.getActionParams(action.params, id, filter, order, { offset, limit })}
        ) {
          result {
            ${this.convertMetaToString(action.meta)}
          }
          ${ action.responseType === 'list' ? 'totalCount' : '' }
        }
      }`,
    }).pipe(
      pluck('data', action.method),
    );
  }

  protected convertMetaToString(actionMetas: { [field: string]: PebContextIntegrationActionFieldMeta }): string {
    const keys = Object.entries(actionMetas).reduce(
      (acc, [key, meta]) => {
        set(acc, key, true);
        return acc;
      },
      {},
    );
    const getResult = (data) => {
      return Object.entries(data).map(([field, value]) => {
        if (typeof value === 'object') {
          return `${field} { ${getResult(value)} }`;
        }
        return field;
      }).join(' ');
    };
    return getResult(keys).replace(/\"/g, '\\"');
  }

  protected getActionParams(
    params: Array<PebContextActionParams|string>,
    id: string = '',
    filter: PebFilterParams = [],
    order: PebOrderParams = [],
    { offset = 0, limit = 100 }: PebPaginationParams = {},
  ): string {
    const values = {
      [PebContextActionParams.Filter]: `"${this.convertFiltersToString(filter)}"`,
      [PebContextActionParams.Business]: `"${this.envService.businessId}"`,
      [PebContextActionParams.Shop]: `"${this.envService.siteId}"`,
      [PebContextActionParams.Order]: `"${this.convertFiltersToString(order)}"`,
      [PebContextActionParams.Id]: `"${id}"`,
      [PebContextActionParams.Offset]: `${offset}`,
      [PebContextActionParams.Limit]: `${limit}`,
    };
    return params?.map(param => `${param}: ${values[param] ?? ''},`).join(' ') ?? '';
  }

  protected convertFiltersToString(filters: any): string {
    return JSON.stringify(filters).replace(/\"/g, '\\"');
  }
}
