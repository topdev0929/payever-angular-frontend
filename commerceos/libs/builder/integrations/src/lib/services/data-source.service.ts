import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  PebAPIDataSource,
  PebAPIDataSourceParams,
  PebDataSourceFilterObj,
  PebIntegrationApiCachedDataAddAction,
  PebIntegrationData,
} from '@pe/builder/core';

import { PebIntegrationState } from '../state/integration.state';

import { PebConnectorProxyService } from './connector-proxy.service';


@Injectable()
export class PebDataSourceService {
  constructor(
    private readonly store: Store,
    private readonly connectorService: PebConnectorProxyService,
  ) {
  }

  getData$(dataSource: PebAPIDataSource, params: PebAPIDataSourceParams): Observable<PebIntegrationData | undefined> {
    try {      
      const data$ = this.getApiData$(dataSource, params);
      if (!data$) {
        return of(undefined);
      }

      return data$.pipe(
        map(value => ({ value, dataType: dataSource.dataType })),
        catchError((err) => {
          console.error(`connector`, err, { dataSource });

          return of(undefined);
        }),
      );
    }
    catch (err) {
      console.error('evaluate', err, { dataSource });

      return of(undefined);
    }
  }

  getApiData$(dataSource: PebAPIDataSource, params: PebAPIDataSourceParams): Observable<PebIntegrationData | undefined> {
    const connector = this.connectorService.getConnector(dataSource.connectorId);
    if (!connector) {
      return of(undefined);
    }
    const filters = Object.values(params.filters ?? {}).map(this.toApiFilter);
    const pagination = params.pagination;
    const apiParam = { filters, pagination, ...params.params };

    const cacheKey = connector.getDataCacheKey(dataSource.dataSourceId, apiParam);
    const cachedData = cacheKey && this.store.selectSnapshot(PebIntegrationState.apiCachedData)[cacheKey];
    if (cachedData !== undefined) {
      return of(cachedData);
    }

    return connector.getData(dataSource.dataSourceId, apiParam).pipe(
      tap(data => cacheKey && this.store.dispatch(new PebIntegrationApiCachedDataAddAction({ [cacheKey]: data }))),
    );
  }

  private toApiFilter(filter: PebDataSourceFilterObj) {
    return filter?.value;
  }
}
