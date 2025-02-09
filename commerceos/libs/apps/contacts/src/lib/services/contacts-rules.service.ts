import { Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import { Store } from '@ngxs/store';
import { forkJoin, Observable, of, OperatorFunction, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder/core';
import { PeFilterType } from '@pe/grid/shared';
import { TranslateService } from '@pe/i18n-core';
import {
  RuleObservableService,
  RulesService,
  ActionModel,
  ActionType,
  RuleModel,
  RuleValues,
  RuleOverlayData,
} from '@pe/rules';
import { SetStatuses } from '@pe/shared/contacts';

import { ContactsGQLService } from './contacts-gql.service';
import { StatusGQLService } from './status-gql.service';
class PeFolder {

  name: string;
  position: number;
  _id?: string;
  image?: string;
  parentFolderId?: string;
  isProtected?: boolean;
  isHeadline?: boolean;
  headline?: string;
  id?: string;
  children?: PeFolder[];

  constructor() {
    this.id = this._id;
  }

}

@Injectable()
export class ContactsRuleService {
  onSaveSubject$ = new Subject<any>();
  onErrorSubject$ = new Subject<string>();

  constructor(
    private store: Store,
    private ruleObservableService: RuleObservableService,
    private ruleService: RulesService,
    private apiService: ContactsGQLService,
    private apmService: ApmService,
    private statusGQLService: StatusGQLService,
    private envService: PebEnvService,
    private translateService: TranslateService,
  ) {
  }

  openRules(): Observable<any>  {
    return forkJoin([
      this.statusGQLService.getAllContactsStatus(this.envService.businessId),
      this.apiService.getRulesValues(),
      this.apiService.getRules(),
      this.apiService.getFolders().pipe(
        map((folders) => {
          return this.folderTreeFlatten(folders);
        }),
      ),
    ]).pipe(
      tap(([statuses, values, rules, folders]) => {
        const { conditions, fields, actions, channels } = values as RuleValues;
        this.store.dispatch(new SetStatuses(statuses));

        const data: RuleOverlayData = {
          conditions,
          fields: fields.map((item) => {
            switch (item.fieldName) {
              case 'status':
                return {
                  ...item,
                  type: PeFilterType.Option,
                  options: [
                    ...statuses?.map(status => ({
                      value: status._id,
                      label: this.translateService.translate(status.name),
                    })),
                  ],
                };

              case 'createdAt':
              case 'updatedAt':
                return {
                  ...item,
                  type: PeFilterType.Date,
                };
              default:
                return item;
            }
          }),
          rules,
          folders: folders.filter(folder => folder.isFolder && !folder.isHeadline),
          actions,
          channels,
        };
        this.ruleService.show(this.onSaveSubject$, data, this.onErrorSubject$);
      }),
      this.errorHandler(),
    );
  }

  initRuleListener(): Observable<any> {
    return this.ruleObservableService.actions$.pipe(
      tap((action) => {
        if (action) {
          this.ruleAction(action);
        }
      }),
    );
  }

  private errorHandler(): OperatorFunction<any, any> {
    return catchError((error) => {
      this.apmService.apm.captureError(error.error.message);
      this.onErrorSubject$.next(error.error.message);

      return of(error);
    });
  }

  private createRule(action: ActionModel): Observable<any> {
    return this.apiService.createRule(action.ruleData).pipe(
      tap((rule: RuleModel) => {
        this.onErrorSubject$.next(null);
        action?.callback$.next({
          action: action.action,
          rule,
        });
      }),
      this.errorHandler(),
    );
  }

  private deleteRule(action: ActionModel): Observable<any> {
    return this.apiService.deleteRule(action.ruleData._id).pipe(
      tap(() => {
        action?.callback$.next({
          action: ActionType.Delete,
          rule: action.ruleData,
        });
      }),
      this.errorHandler(),
    );
  }

  private updateRule(action: ActionModel): Observable<any> {
    return this.apiService.updateRule(action.ruleData, action.ruleData._id).pipe(
      tap((rule: RuleModel) => {
        this.onErrorSubject$.next(null);
        action?.callback$.next({
          action: ActionType.Edit,
          rule,
        });
      }),
      this.errorHandler(),
    );
  }

  private ruleAction(action: ActionModel): void {
    switch (action.action) {
      case ActionType.Duplicate:
      case ActionType.Add:
        this.createRule(action).subscribe();
        break;
      case ActionType.Delete:
        this.deleteRule(action).subscribe();
        break;
      case ActionType.Edit:
        this.updateRule(action).subscribe();
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
}
