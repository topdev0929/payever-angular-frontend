import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, map, switchMap, takeUntil } from 'rxjs/operators';

import {
  PebActionSchema,
  PebFieldSchema,
  PebIntegrationAction,
} from '@pe/builder/core';
import { PebConnectorProxyService } from '@pe/builder/integrations';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

import { IntegrationNodeType, PebIntegrationTreeItem } from '../models';
import { PebSchemaResolverService } from '../services/schema-resolver.service';

@Component({
  selector: 'peb-integration-list',
  templateUrl: './integration-list.component.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './integration-list.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebIntegrationListComponent {

  @Input() dataType?: IntegrationNodeType;
  selectedIntegration$: Subject<PebIntegrationTreeItem> = new Subject();

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  element: PebElement;

  integrations$: Observable<any> = this.selectedElements$.pipe(
    switchMap(elements => combineLatest([
      this.getAllConnectorsIntegrations(),      
    ])),
    map(([connectors]) => [...connectors].filter(Boolean)),
    takeUntil(this.destroy$),
  );

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly sideBarService: PebSideBarService,
    private connectorService: PebConnectorProxyService,
    private schemaResolverService: PebSchemaResolverService,
  ) {
  }

  getAllConnectorsIntegrations(): Observable<PebIntegrationTreeItem[]> {
    return forkJoin(this.connectorService.getAll().map((connector) => {
      return combineLatest([
        connector.getDataSources().pipe(catchError(() => of([]))),
        connector.getActions().pipe(catchError(() => of([] as PebIntegrationAction[]))),
      ]).pipe(
        map(([dataSources, actions]) => {
          const tree: PebIntegrationTreeItem = {
            id: connector.id,
            type: IntegrationNodeType.Connector,
            title: connector.title,
            children: [],
          };

          if (actions?.length && (!this.dataType || this.dataType === IntegrationNodeType.Action)) {
            const children: PebIntegrationTreeItem[] = actions.map((item: any) => {
              delete item.integration;
              delete item.inputs;
              const schema = this.getActionSchema(item);

              return { id: item.id, ...schema, type: IntegrationNodeType.Action, value: schema };
            });

            this.dataType
            ? tree.children = children
            : tree.children.push({
              id: `${connector.id}-action`,
              type: IntegrationNodeType.Action,
              title: 'Action',
              children: children,
            });
          }
          if (dataSources?.length && (!this.dataType || this.dataType === IntegrationNodeType.DataSource)) {
            const children: PebIntegrationTreeItem[] =
              dataSources.map((item) => {
                item.integration && delete item.integration;
                item.inputs && delete item.inputs;

                return { ...item, type: IntegrationNodeType.DataSource, value: item };
              });

            this.dataType
            ? tree.children = children
            : tree.children.push({
              id: `${connector.id}-data`,
              type: IntegrationNodeType.Group,
              title: 'Data',
              children: children,
            });
          }

          return tree;
        }),
      );
    })).pipe(
      switchMap(dataTree => of(dataTree.filter(v =>
        (!this.dataType || v.children?.length > 0) &&
        this.dataType !== IntegrationNodeType.ContextField)))
    );
  }

  toFiledIntegrationTree(schema: PebFieldSchema, namespace: string = ''): PebIntegrationTreeItem {
    const hasChild = schema.fields?.length > 0;

    return schema !== undefined
      ? {
        id: schema.name,
        type: IntegrationNodeType.ContextField,
        title: schema.title,
        children: hasChild ? schema.fields.map(sh => this.toFiledIntegrationTree(sh, schema.name + '.'))
          : undefined,
        value: { ...schema, name: `${namespace}${schema.name}` },
      }
      : undefined;
  }

  select(item?: PebIntegrationTreeItem): void {
    if (item.type !== this.dataType) {
      return;
    }

    this.selectedIntegration$.next(item);
    this.sideBarService.back();
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
