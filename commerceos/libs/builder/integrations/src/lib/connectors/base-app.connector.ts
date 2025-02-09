import { inject } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { 
  PebAPIDataSourceSchema,
  PebActionSchema,
  PebDynamicParams,
  PebIntegrationDataType,
  PebIntegrationType,
  PebIntegrationAction,
  PebConnectorContext,
} from '@pe/builder/core';

import { PebIntegrationConnector } from '../interfaces';
import { PebIntegrationApiService } from '../services';

export abstract class PebBaseAppConnector implements PebIntegrationConnector {
  abstract id: string;
  abstract title: string;
  context$: Observable<PebConnectorContext> = EMPTY;
  protected abstract app: string;

  private api = inject(PebIntegrationApiService);
  private appEnv = inject(PeAppEnv);

  private integrations$!: Observable<(PebActionSchema | PebAPIDataSourceSchema)[]>;

  init(): Observable<boolean> {
    this.integrations$ = this.api.getIntegrations(this.app, this.id).pipe(shareReplay());

    return of(true);
  }

  setContext(context$: Observable<PebConnectorContext>): void {
    this.context$ = context$;
  }

  getDataSources(): Observable<PebAPIDataSourceSchema[]> {
    return this.integrations$.pipe(
      map(items => items
        .filter((item: any): item is PebAPIDataSourceSchema => item.type === PebIntegrationType.DataSource)
        .map(m => ({
          ...m,
          defaultParams: this.getDefaultAPIParam(m),
        } as PebAPIDataSourceSchema))
      ),
      catchError(err => of([])),
    );
  }

  getDataSourceById(id: string): Observable<PebAPIDataSourceSchema | undefined> {
    return this.getDataSources().pipe(map(items => items.find(item => item.id === id)));
  }

  getData(dataSourceId: string, params: any): Observable<any> {
    return this.getDataSourceById(dataSourceId).pipe(
      switchMap(dataSource => this.api.getData(dataSource?.uniqueTag ?? '', params)),
      map(data => data?.dataType === PebIntegrationDataType.Table ? data : data?.value),
      catchError(ex => of(undefined)),
    );
  }

  getDataCacheKey(dataSourceId: string, params: any): string | undefined {
    return [
      dataSourceId,
      this.appEnv.business,
      JSON.stringify(params).replace(/"'/g, `_`),
    ].join('.');
  }

  getActions(): Observable<PebIntegrationAction[]> {
    return this.integrations$.pipe(
      map((items: any) => items.filter((item: any) => item.type === PebIntegrationType.Action)),
      catchError(err => of([])),
    );
  }

  getActionById(id: string): Observable<PebIntegrationAction | undefined> {
    return this.getActions().pipe(map(items => items.find(item => item.id === id)));
  }

  getDefaultAPIParam(schema: PebAPIDataSourceSchema): PebDynamicParams {
    return { contextId: 'context.id' };
  }
}
