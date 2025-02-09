import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import produce from 'immer';
import { EMPTY, Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import {
  PEB_DEFAULT_PAGINATION,
  PEB_ROOT_CONTEXT_ID,
  PebAPIDataSourceParams,
  PebClonePositioningType,
  PebContextCloneConfig,
  PebContextFieldKey,
  PebContextTree,
  PebElementType,
  PebElementWithIntegration,
  PebIntegration,
  PebIntegrationDataModels,
  PebIntegrationDataType,
  PebMap,
  PebPositionType,
  PebRootContext,
  PebUniqueContext,
  evaluate,
  hasDataIntegration,
  isEditorContainer,
} from '@pe/builder/core';
import {
  getDefaultContextField,
  extractContextArrayValue,
  getRenderConfigByDataType,
  isPlainObject,
  getPatchedDataParam,
} from '@pe/builder/render-utils';
import { PebViewContextSetRootAction } from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewContextDataService } from './context-data.service';

@Injectable()
export class PebViewContextRenderService {
  constructor(
    private readonly store: Store,
    private readonly contextDataService: PebViewContextDataService,
  ) {
  }

  createRootContext$(): Observable<PebRootContext> {
    const query = this.store.selectSnapshot(PebViewState.query);

    const rootContext: PebRootContext = {
      id: PEB_ROOT_CONTEXT_ID,
      urlParameters: query.urlParameters,
      children: [],
      uniqueContexts: {},
    };

    return this.store.dispatch(new PebViewContextSetRootAction(rootContext)).pipe(
      map(() => rootContext)
    );
  }

  resolveContext$(rootElement: PebElementWithIntegration): Observable<PebContextTree | undefined> {
    const rootContext = this.store.selectSnapshot(PebViewState.rootContext);
    if (!rootContext) {
      return of(undefined);
    }

    return this.resolveContextRecursive$(rootElement, rootContext).pipe(
      tap(context => rootContext.children = context.children),
    );
  }

  private resolveContextRecursive$(
    element: PebElementWithIntegration,
    root?: PebRootContext,
    parentContext?: PebContextTree,
    index?: number,
  ): Observable<PebContextTree> {
    const contexts = this.store.selectSnapshot(PebViewState.contexts);
    const newContext = contexts[element.id] ?? this.createNewContext(element, root, parentContext, index);
    const context$ = this.resolveContextData$(newContext, element);

    return context$.pipe(
      switchMap(context => this.resolveChildContexts$(element, context)),
      catchError((err) => {
        console.error(err);

        return context$;
      }),
    );
  }

  resolveChildContexts$(
    element: PebElementWithIntegration,
    context: PebContextTree,
  ): Observable<PebContextTree> {
    const container = this.store.selectSnapshot(PebViewState.container);
    const isArrayContext = context.dataType === PebIntegrationDataType.Array
      || context.dataType === PebIntegrationDataType.Table && element.type !== PebElementType.Grid;

    if (!isEditorContainer(container) && isArrayContext) {
      const arrayRender$ = this.generateArrayChildrenContexts$(element, context);

      if (arrayRender$) {
        return arrayRender$.pipe(
        tap(children => context.children = children),
        map(() => context),
      );
      }
    };

    const children = element.children ?? [];
    const root = context.root;

    if (!children.length || !root) {
      context.children = [];

      return of(context);
    }

    return forkJoin(children.map((elm, idx) => this.resolveContextRecursive$(elm, root, context, idx))).pipe(
      tap(children => context.children = children),
      map(() => context),
    );
  }

  resolveContextData$(
    context: PebContextTree,    
    element: PebElementWithIntegration,
  ): Observable<PebContextTree> {
    this.handleContextField(context, element);

    return this.contextDataService.resolveValue$(context).pipe(
      tap(context => this.handleRenderConfigs(context, element)),
    );
  }

  findInheritedContexts(uniqueTag: string): PebContextTree[] {
    return Object.values(this.store.selectSnapshot(PebViewState.contexts)).filter(ctx => ctx.uniqueTag === uniqueTag);
  }

  findUniqueContext(uniqueTag: string): PebUniqueContext | undefined {
    if (!uniqueTag) {
      return undefined;
    }
    const root = this.store.selectSnapshot(PebViewState.rootContext);

    return root?.uniqueContexts?.[uniqueTag];
  }

  patchDataParams$(
    uniqueTag: string,
    update: Partial<PebAPIDataSourceParams>,
    elements: PebMap<PebElementWithIntegration>,
  ): Observable<PebContextTree[]> {
    const uniqueContext = this.findUniqueContext(uniqueTag);
    if (!uniqueContext || !update) {
      return EMPTY;
    }
    const dataParams = getPatchedDataParam(uniqueContext.dataParams, update);

    return this.setDataParams$(uniqueContext, dataParams, elements);
  }

  setDataParams$(
    uniqueContext: PebUniqueContext,
    dataParams: PebAPIDataSourceParams,
    elements: PebMap<PebElementWithIntegration>,
  ): Observable<PebContextTree[]> {
    if (!uniqueContext.uniqueTag) {
      return EMPTY;
    }

    uniqueContext.value = undefined;
    uniqueContext.dataParams = dataParams;
    const inheritedContexts = this.findInheritedContexts(uniqueContext.uniqueTag);

    return this.contextDataService.resolveUniqueContextData$(uniqueContext).pipe(
      switchMap(() => forkJoin(
        inheritedContexts.map(ctx => this.resolveContextRecursive$(elements[ctx.id ?? ''])))),
      map(() => inheritedContexts),
    );
  }

  patchContext$(
    element: PebElementWithIntegration,
    context: PebContextTree,
    update: {
      value?: { [key: string]: any },
      dataParams?: Partial<PebAPIDataSourceParams>,
    },
  ): Observable<PebContextTree> {
    if (!update) {
      return of(context);
    }
    const { value } = update;

    if (value) {
      context.value = !context.value || !value || !isPlainObject(context.value)
        ? value
        : { ...context.value, ...value };
    }

    if (update.dataParams) {
      context.dataParams = getPatchedDataParam(context.dataParams, update.dataParams);
    }

    return this.resolveChildContexts$(element, context);
  }

  private generateArrayChildrenContexts$(
    element: PebElementWithIntegration,
    context: PebContextTree,
  ): Observable<PebContextTree[]> | undefined {
    const arrayValue = extractContextArrayValue(context) ?? [];
    const repeatingElement = 
      element.children.find(elm => elm.integration?.contextField?.eval?.startsWith(PebContextFieldKey.ListItem));

    if (!repeatingElement) {
      return undefined;
    }

    const parent = context;
    const root = context.root;

    const clonedContexts: PebContextTree[] = arrayValue.map((value, idx) => {
      const cloneId = `.${idx}`;

      const itemContext: PebContextTree = {
        id: `${repeatingElement.id}${cloneId}`,
        name: `${repeatingElement.name}.${idx}`,
        index: idx,
        dataType: PebIntegrationDataType.Object,
        value,
        parent,
        root,
        renderConfigs: {
          clone: {
            originalElementId: repeatingElement.id,
            parentElementId: repeatingElement.parent?.id ?? '',
            cloneId,
            positioning: { type: PebClonePositioningType.Array },
          },
        },
        children: [],
        uniqueTag: `${context.uniqueTag}[${idx}]`,
        integration: repeatingElement.integration,
        dataParams: { pagination: { ...PEB_DEFAULT_PAGINATION } },
        fields: { ...context.fields },
      };

      this.contextDataService.resolveContextField(itemContext);
      this.handleRenderConfigs(itemContext);

      return itemContext;
    });

    const keepIds = clonedContexts.map(elm => elm.id);
    const noRenderIds = element.children
      .map(elm => elm.id)
      .filter(id => id.startsWith(repeatingElement.id) && keepIds.every(kid => kid !== id));

    const noRenderContexts: PebContextTree[] = noRenderIds.map(id => ({
      id,      
      name: repeatingElement.name,
      index: 0,
      dataType: PebIntegrationDataType.Null,
      parent,
      root,
      renderConfigs: { display: { hidden: true } },
      children: [],
      uniqueTag: '',    
      fields: {},  
    }));

    if (!clonedContexts.length) {
      return of([...noRenderContexts, ...clonedContexts]);
    }

    const populateChildren$ = clonedContexts
      .map(ctx => this.deepCloneContextChildren$({ ...repeatingElement, id: ctx.id ?? '' }, ctx).pipe(
        tap(resolved => ctx.children = resolved.children),
      ));

    return forkJoin(populateChildren$).pipe(
      map(() => [...noRenderContexts, ...clonedContexts]),
    );
  }

  private deepCloneContextChildren$(
    element: PebElementWithIntegration,
    context: PebContextTree,
  ): Observable<PebContextTree> {
    const childElements = this.deepCloneElementChildren(element, context.renderConfigs?.clone);
    const clonedElement: PebElementWithIntegration = { ...element, children: childElements };

    return this.resolveChildContexts$(clonedElement, context);
  }

  private deepCloneElementChildren(
    element: PebElementWithIntegration,
    cloneConfig: PebContextCloneConfig | undefined,
  ): PebElementWithIntegration[] {
    const parentCloneId = cloneConfig?.cloneId;
    if (!parentCloneId) {
      return [];
    }

    const children = element.children.map((elm, idx) => {
      const childCloneId = `${parentCloneId}.${idx}`;

      const childCloneConfig: PebContextCloneConfig = {
        originalElementId: elm.id,
        parentElementId: element.id,
        cloneId: childCloneId,
      };
      const renderConfigs = {
        ...elm.integration?.renderConfigs,
        clone: childCloneConfig,
      };
      const cloned: PebElementWithIntegration = {
        id: `${elm.id}${childCloneId}`,
        name: elm.name,
        type: elm.type,
        integration: { ...elm.integration, renderConfigs },
        children: [],
      };
      cloned.parent = { id: element.id };
      cloned.children = this.deepCloneElementChildren({ ...elm, id: cloned.id }, childCloneConfig);

      return cloned;
    });

    return children;
  }

  private createNewContext(
    element: PebElementWithIntegration,
    root: PebRootContext | undefined,
    parent: PebContextTree | undefined,
    index: number | undefined,
  ): PebContextTree {
    const renderConfigs = { ...element.integration?.renderConfigs };
    const integration = element.integration;
    const context: PebContextTree = {
      id: element.id,
      name: element.name,
      root,
      index: index ?? 0,
      parent,
      children: [],
      renderConfigs,
      uniqueTag: this.getContextUniqueTag(element.integration),
      fields: {},
      integration,      
      value: parent?.value,
      dataType: parent?.dataType,
    };
    context.dataParams = this.getInitialDataParams(context);

    const hasData = element.parent?.type === PebElementType.Grid
      ? hasDataIntegration(context.parent?.integration)
      : hasDataIntegration(context.integration);

    if (hasData && integration && !integration.contextField?.eval) {
      const defaultField = getDefaultContextField(element);
      if (defaultField) {
        context.integration = produce(integration, (draft) => {
          draft.contextField = defaultField;
        });
      }
    }

    return context;
  }

  private getInitialDataParams(context: PebContextTree): PebAPIDataSourceParams {
    const dataParams = context.dataParams ?? {};
    const dataSource = context.integration?.dataSource;

    if (dataSource?.params) {
      dataParams.params = evaluate(dataSource.params, context);
    }

    return dataParams;
  }

  private getContextUniqueTag(integration: PebIntegration | undefined): string {
    return integration?.dataSource?.uniqueTag ?? '';
  }

  private handleContextField(
    context: PebContextTree,
    element: PebElementWithIntegration,
  ) {
    if (element.parent?.type === PebElementType.Grid) {
      context.integration = produce(context.integration ?? {}, (draft) => {
        draft.contextField = {
          dataType: PebIntegrationDataType.Object,
          eval: PebContextFieldKey.ListItem,
        };
      });
    }
  }

  private handleRenderConfigs(
    context: PebContextTree,
    element?: PebElementWithIntegration,
  ) {
    if (element?.parent?.type === PebElementType.Grid && context.parent?.dataType === PebIntegrationDataType.Array) {
      const length = (context.parent.value as PebIntegrationDataModels.Array)?.length ?? 0;
      const index = context.index ?? 0;
      const display = index >= length
        ? { hidden: true }
        : { hidden: false, positionType: PebPositionType.Block };
      context.renderConfigs = { ...context.renderConfigs, display };

      return;
    }

    context.renderConfigs = {
      ...context.renderConfigs,
      ...getRenderConfigByDataType(context.dataType),
    };
  }

}
