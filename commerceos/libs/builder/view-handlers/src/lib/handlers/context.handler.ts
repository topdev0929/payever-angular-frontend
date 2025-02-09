import { Injectable } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { isEqual } from 'lodash';
import { combineLatest, of } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';

import {
  PebAPIDataSourceParams,
  PebContextTree,
  PebContextUpdateValueInteraction,
  PebIntegrationCommand,
  PebIntegrationContextCommandType,
  PebIntegrationEventAction,
  isContextUpdateInteraction,
} from '@pe/builder/core';
import { PebIntegrationActionInvokerService } from '@pe/builder/integrations';
import { flattenContexts, getContextRenderUpdates } from '@pe/builder/render-utils';
import {
  PebRenderUpdateAction,
  PebViewContextRenderAction,
  PebViewContextRenderAllAction,
  PebViewContextResolveRootAction,
  PebViewContextSetAction,
  PebViewContextUpdateAction,
  PebViewQueryPatchAction,
} from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewContextRenderService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewContextHandler extends PebViewBaseHandler {
  integrationActionResolvers: any = {
    [PebIntegrationContextCommandType.PatchValue]: this.patchContextValue,
    [PebIntegrationContextCommandType.SetDataSourceFilter]: this.setDataSourceFilter,
    [PebIntegrationContextCommandType.ClearDataSourceFilters]: this.clearDataSourceFilters,
  };

  lastContextChange: any;

  queryParametersUpdated$ = this.actions$.pipe(
    ofActionDispatched(PebViewQueryPatchAction),
    filter(({ update }) =>
      !this.lastContextChange ||
      update?.urlParameters !== undefined &&
      !isEqual(this.lastContextChange, update.urlParameters)),
    tap(({ update }) => {
      this.lastContextChange = update?.urlParameters;
      this.store.dispatch(new PebViewContextResolveRootAction());
    })
  );

  contextResolveRoot$ = this.actions$.pipe(
    ofActionDispatched(PebViewContextResolveRootAction),
    switchMap(() => {
      const rootElement = this.store.selectSnapshot(PebViewState.rootElement);
      if (!rootElement) {
        return of(null);
      }
      const rootContext$ = this.contextRenderService.createRootContext$();

      return rootContext$.pipe(
        switchMap(() => this.contextRenderService.resolveContext$(rootElement).pipe(
          tap((context) => {
            this.store.dispatch(new PebViewContextSetAction(flattenContexts(context)));
            this.store.dispatch(new PebViewContextRenderAllAction());
          })
        ))
      );
    })
  );

  renderContextsAll$ = this.actions$.pipe(
    ofActionDispatched(PebViewContextRenderAllAction),
    tap(() => {
      const rootContext = this.store.selectSnapshot(PebViewState.rootContext);
      const renderingContext: PebContextTree = {
        ...rootContext,
        index: 0,
        renderConfigs: {},
        fields: {},
        children: rootContext?.children ?? [],
      };

      rootContext && this.renderContext(renderingContext);
    }),
  );

  renderContexts$ = this.actions$.pipe(
    ofActionDispatched(PebViewContextRenderAction),
    tap((action: PebViewContextRenderAction) => {
      action.context && this.renderContext(action.context);
    }),
  );

  interaction$ = this.actions$.pipe(
    ofActionDispatched(PebIntegrationEventAction),
    tap((action) => {
      if (isContextUpdateInteraction(action)) {
        this.handleUpdateValueInteraction(action);
      }
      else if (isContextUpdateInteraction(action)) {
        this.handlePatchInteraction(action);
      }
    }),
  );

  integrationActions$ = this.actions$.pipe(
    ofActionDispatched(PebIntegrationEventAction),
    filter(({ event }) => event.startsWith('context.')),
    switchMap(({ event, payload }) => this.actionInvoker.runAction(
      this.integrationActionResolvers[event]?.bind(this),
      payload.action,
      payload.context,
    )),
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private actionInvoker: PebIntegrationActionInvokerService,
    private contextRenderService: PebViewContextRenderService,
  ) {
    super();
    this.startObserving(
      this.queryParametersUpdated$,
      this.contextResolveRoot$,
      this.renderContextsAll$,
      this.renderContexts$,
      this.interaction$,
      this.integrationActions$,
    );
  }

  handleUpdateValueInteraction(action: PebContextUpdateValueInteraction) {
  }

  handlePatchInteraction(action: PebContextUpdateValueInteraction) {
  }

  patchContextValue(params: PebIntegrationCommand.Context.PatchValue) {
    if (!params.uniqueTag || !params.patch) {
      return;
    }

    const contexts = this.contextRenderService.findInheritedContexts(params.uniqueTag);
    const elements = this.store.selectSnapshot(PebViewState.elements);

    const patchContexts$ = contexts.map((ctx) => {
      const element = elements[ctx.id ?? ''];

      return this.contextRenderService.patchContext$(element, ctx, { value: params.patch }).pipe(
        tap((ctx) => {
          this.store.dispatch(new PebViewContextUpdateAction(flattenContexts(ctx)));
          this.renderContext(ctx);
        }),
      );
    });

    combineLatest(patchContexts$).pipe(
      take(1),
    ).subscribe();
  }

  setDataSourceFilter(params: PebIntegrationCommand.Context.SetDataSourceFilter) {
    if (!params.uniqueTag || !params?.filter?.field) {
      return;
    }

    const elements = this.store.selectSnapshot(PebViewState.elements);

    const updates: Partial<PebAPIDataSourceParams> = {
      filters: {
        [params.filter.field]: {
          title: params.title,
          value: params.filter,
        },
      },
    };

    this.contextRenderService.patchDataParams$(params.uniqueTag, updates, elements).pipe(
      tap(() => this.renderContextsByUniqueTag(params.uniqueTag)),
      take(1),
    ).subscribe();
  }

  clearDataSourceFilters(params: PebIntegrationCommand.Context.SetDataSourceFilter) {
    const uniqueContext = this.contextRenderService.findUniqueContext(params.uniqueTag);
    if (!params.uniqueTag || !uniqueContext) {
      return;
    }


    const elements = this.store.selectSnapshot(PebViewState.elements);

    const dataParams: PebAPIDataSourceParams = {
      ...uniqueContext?.dataParams,
      filters: {},
    };

    this.contextRenderService.setDataParams$(uniqueContext, dataParams, elements).pipe(
      tap(() => this.renderContextsByUniqueTag(params.uniqueTag)),
      take(1),
    ).subscribe();

  }

  private renderContextsByUniqueTag(uniqueTag: string) {
    const inheritedContexts = this.contextRenderService.findInheritedContexts(uniqueTag);
    inheritedContexts.forEach((ctx) => {
      this.store.dispatch(new PebViewContextUpdateAction(flattenContexts(ctx)));
      this.renderContext(ctx);
    });
  }

  private renderContext(context: PebContextTree) {
    const contexts = { ...this.store.selectSnapshot(PebViewState.contexts) };
    const elements = { ...this.store.selectSnapshot(PebViewState.elements) };

    const updates = getContextRenderUpdates(context, contexts, elements);
    this.store.dispatch(new PebRenderUpdateAction(updates));
  }
}
