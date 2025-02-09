import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { 
  PebContextFieldKey,
  PebContextTree,
  PebIntegrationDataModels,
  PebIntegrationDataType,
  PebUniqueContext,
  evaluate,
} from '@pe/builder/core';
import { PebDataSourceService } from '@pe/builder/integrations';


@Injectable({ providedIn: 'any' })
export class PebViewContextDataService {
  constructor(
    private readonly dataSourceService: PebDataSourceService
  ) {
  }

  resolveValue$(context: PebContextTree): Observable<PebContextTree> {
    const dataSource = context.integration?.dataSource;
    if (!dataSource) {
      const parent = context.parent;
      context.value = parent?.value;
      context.dataType = parent?.dataType;
      context.fields = { ...parent?.fields };

      return of(context).pipe(
        map(context => this.resolveContextField(context)),
      );
    }

    let uniqueContext = context.uniqueTag
      ? context.root?.uniqueContexts?.[context.uniqueTag]
      : undefined;

    if (uniqueContext && uniqueContext.value !== undefined) {
      this.resolveDataByExistingContext(context, uniqueContext);

      return of(context);
    }

    uniqueContext = { dataSource, dataParams: context.dataParams, uniqueTag: context.uniqueTag };
    if (context.uniqueTag && context.root) {
      context.root.uniqueContexts[context.uniqueTag] = uniqueContext;
    }

    const resolveData$ = this.resolveUniqueContextData$(uniqueContext).pipe(
      map((data) => {
        context.dataType = data?.dataType;
        context.value = data?.value;  
        context.fields[PebContextFieldKey.OriginalData] = data?.value;
        this.generateFields(context);

        return context;
      })
    );

    return resolveData$.pipe(
      map(context => this.resolveContextField(context)),
    );
  }

  resolveUniqueContextData$(context: PebUniqueContext): Observable<PebUniqueContext> {
    return this.dataSourceService.getData$(context.dataSource, context.dataParams ?? {}).pipe(
      map((data) => {
        context.dataType = data?.dataType;
        context.value = data?.value;

        return context;
      })
    );
  }

  resolveDataByExistingContext(context: PebContextTree, uniqueContext: PebUniqueContext) {
    context.dataType = uniqueContext.dataType;
    context.value = uniqueContext.value;
    context.dataParams = uniqueContext.dataParams;
    this.generateFields(context);
    this.resolveContextField(context);
  }

  resolveContextField(context: PebContextTree): PebContextTree {
    const contextField = context.integration?.contextField;

    if (!contextField?.eval) {
      return context;
    }

    const list = context.fields?.[PebContextFieldKey.list];
    context.fields[PebContextFieldKey.ListItem] = list ? list[context.index ?? 0] : undefined;
    context.value = evaluate(contextField?.eval, context.fields);
    context.dataType = contextField.dataType ?? PebIntegrationDataType.Object;
    this.generateFields(context);

    return context;
  }

  generateFields(context: PebContextTree) {
    this.generateFieldsGeneral(context);

    if (context.dataType === PebIntegrationDataType.Table) {
      this.generateFieldsForTable(context);
    }
    else if (context.dataType === PebIntegrationDataType.Array) {
      this.generateFieldsForArray(context);
    }
  }

  private generateFieldsForTable(context: PebContextTree) {
    context.fields = context.fields ?? {};
    const list = (context.value as PebIntegrationDataModels.Table)?.value ?? [];

    context.fields[PebContextFieldKey.list] = list;
    context.fields[PebContextFieldKey.Length] = list.length;
    context.fields[PebContextFieldKey.Filters] = context.dataParams?.filters;
    context.fields[PebContextFieldKey.Pagination] = context.dataParams?.pagination;
  }

  private generateFieldsForArray(context: PebContextTree) {
    context.fields = context.fields ?? {};
    const list = Object.values(context.value as PebIntegrationDataModels.Array ?? {});

    context.fields[PebContextFieldKey.list] = list;
    context.fields[PebContextFieldKey.Length] = list.length;
  }

  private generateFieldsGeneral(context: PebContextTree) {    
    context.fields = context.fields ?? {};
    context.fields[PebContextFieldKey.Value] = context.value;    
    context.fields[PebContextFieldKey.Index] = context.index;
    context.fields[PebContextFieldKey.Root] = context.root;
    context.fields[PebContextFieldKey.ParentValue] = context.parent?.value;
    context.fields[PebContextFieldKey.HasValue] = context.value !== undefined;
  }
}
