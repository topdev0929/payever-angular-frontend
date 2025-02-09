import { Observable } from 'rxjs';

import { PebAPIDataSourceSchema, PebConnectorContext, PebIntegrationAction } from '@pe/builder/core';

export interface PebIntegrationConnector {
  id: string;
  title: string;

  init(): Observable<boolean>;
  setContext(context: Observable<PebConnectorContext>): void;

  getDataSources(): Observable<PebAPIDataSourceSchema[]>;

  getDataSourceById(id: string): Observable<PebAPIDataSourceSchema | undefined>;

  getData(dataSourceId: string, params: any): Observable<any>;

  getDataCacheKey(dataSourceId: string, params: any): string | undefined;

  getActions(): Observable<PebIntegrationAction[]>;

  getActionById(id: string): Observable<PebIntegrationAction | undefined>;
}
