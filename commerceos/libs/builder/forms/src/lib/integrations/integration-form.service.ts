import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { PebActionSchema, PebIntegrationAction } from '@pe/builder/core';
import { PebConnectorProxyService } from '@pe/builder/integrations';

import { IntegrationNodeType, PebIntegrationTreeItem } from './models';


@Injectable({ providedIn: 'any' })
export class PebIntegrationFormService {
  constructor(
    private connectorService: PebConnectorProxyService,
  ) {
  }

  getAllConnectorsActions$(): Observable<PebIntegrationTreeItem[]> {
    return forkJoin(this.connectorService.getAll().map((connector) => {
      return connector.getActions().pipe(catchError(() => of([]))).pipe(
        map((actions) => {
          const tree: PebIntegrationTreeItem = {
            id: connector.id,
            type: IntegrationNodeType.Action,
            title: connector.title,
            children: [],
          };

          if (!actions?.length) {
            return tree;
          }

          tree.children = actions.map((item) => {
            const schema = this.getActionSchema(item);

            return { id: item.id, ...schema, type: IntegrationNodeType.Action, value: schema };
          });

          return tree;
        }),
        shareReplay(1),
      );
    }));
  }

  getAllConnectorsDataSources$(): Observable<PebIntegrationTreeItem[]> {
    return forkJoin(this.connectorService.getAll().map((connector) => {
      return connector.getDataSources().pipe(catchError(() => of([]))).pipe(
        map((dataSources) => {
          const tree: PebIntegrationTreeItem = {
            id: connector.id,
            type: IntegrationNodeType.DataSource,
            title: connector.title,
            children: [],
          };

          if (!dataSources?.length) {
            return tree;
          }

          tree.children = dataSources.map(item => ({ ...item, type: IntegrationNodeType.DataSource, value: item }));

          return tree;
        }),
        shareReplay(1),
      );
    }));
  }


  private getActionSchema(action: PebIntegrationAction): PebActionSchema {
    return {
      ...action,
      actionId: action.id,
      connectorId: action.connectorId,
      title: action.title,
      dynamicParams: action.dynamicParams,
    };
  }
}