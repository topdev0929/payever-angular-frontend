import { Injectable, OnDestroy } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { forkJoin, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, map, takeUntil, tap } from 'rxjs/operators';

import { PeFilterType } from '@pe/grid/shared';
import {
  ActionModel,
  ActionType,
  RuleModel,
  RuleObservableService,
  RuleOverlayData,
  RulesService,
  RuleValues,
} from '@pe/rules';


import { PeFolder } from '../../shared/interfaces/folder.interface';
import { ProductsApiService } from '../../shared/services/api.service';

import { ValuesService } from './values.service';


@Injectable()
export class ProductsRuleService implements OnDestroy {
  onSaveSubject$ = new Subject<any>();

  private readonly destroy$ = new Subject<void>();

  constructor(
    private ruleObservableService: RuleObservableService,
    private ruleService: RulesService,
    private apiService: ProductsApiService,
    private apmService: ApmService,
    private valuesService: ValuesService
  ) {
    this.onSaveSubject$.pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  openRules(): void {
    forkJoin([
      this.apiService.getRulesValues().pipe(
        map((values: RuleValues) => {
          const filters = this.valuesService.filters.reduce((acc, item) => ({
            ...acc,
            [item.fieldName]: item,
          }), {});

          values.fields = values.fields.map((item) => {
            item.fieldName = item.fieldName === 'date' ? 'created_at' : item.fieldName;
            if (filters.hasOwnProperty(item.fieldName)) {
              return {
                ...item,
                type: filters[item.fieldName]?.type,
                options: filters[item.fieldName]?.options,
              };
            }

            return {
              ...item,
              type: PeFilterType.String,
            };
          });

          return values;
        })
      ),
      this.apiService.getRules(),
      this.apiService.getFolders().pipe(
        map((folders) => {
          return this.folderTreeFlatten(folders);
        }),
      ),
    ]).pipe(
      tap(([values, rules, folders]) => {
        const { conditions, fields, actions, channels } = values as RuleValues;
        const data: RuleOverlayData = {
          conditions,
          fields,
          rules,
          folders: folders.filter(folder => folder.isFolder && !folder.isHeadline),
          actions,
          channels };
        this.ruleService.show(this.onSaveSubject$, data);
      }),
      this.errorHandler(),
      takeUntil(this.destroy$),
    ).subscribe();

  }

  initRuleListener(): Observable<ActionModel> {
    return this.ruleObservableService.actions$.pipe(
      tap((action) => {
        if (action) {
          this.ruleAction(action);
        }
      }));
  }

  private errorHandler(): OperatorFunction<any, any> {
    return catchError((error) => {
      this.apmService.apm.captureError(error?.error?.message);

      return of(error);
    });
  }

  private createRule(action: ActionModel): void {
    this.apiService.createRule(action.ruleData).pipe(
      tap((rule: RuleModel) => action?.callback$.next({
        action: action.action,
        rule,
      })),
      this.errorHandler(),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private deleteRule(action: ActionModel): void {
    this.apiService.deleteRule(action.ruleData._id).pipe(
      tap(() => {
        action?.callback$.next({
          action: ActionType.Delete,
          rule: action.ruleData,
        });
      }),
      this.errorHandler(),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private updateRule(action: ActionModel): void {
    this.apiService.updateRule(action.ruleData, action.ruleData._id).pipe(
      tap((rule: RuleModel) => action?.callback$.next({
        action: ActionType.Edit,
        rule,
      })),
      this.errorHandler(),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private ruleAction(action: ActionModel): void {
    switch (action.action) {
      case ActionType.Duplicate:
        this.createRule(action);
        break;
      case ActionType.Add:
        this.createRule(action);
        break;
      case ActionType.Delete:
        this.deleteRule(action);
        break;
      case ActionType.Edit:
        this.updateRule(action);
        break;
    }
  }

  private folderTreeFlatten(tree: PeFolder[]): PeFolder[] {
    return tree.reduce((acc, folder) => {
      if (folder?.children?.length) {
        return acc.concat([folder, ...this.folderTreeFlatten(folder.children)]);
      }

      return acc.concat(folder);
    }, []);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
