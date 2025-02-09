import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, ReplaySubject, Subject } from "rxjs";
import { startWith, switchMap, takeUntil, tap } from "rxjs/operators";

import { EnvService } from "@pe/common";
import {
  GridSkeletonColumnType,
  GridTitleImageStyle,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView,
} from "@pe/grid";

import { Field } from "../public-api";

import { FieldsGQLService } from "./fields-gql.service";

const hiddenFields = [
  'imageUrl',
  'firstName',
  'lastName',
];

const defaultFields = {
  'email': 'contacts-app.contact_editor.email',
  'mobilePhone': 'contacts-app.contact_editor.mobile_phone',
  'homepage': 'contacts-app.contact_editor.homepage',
  'address': 'contacts-app.contact_editor.address',
};

@Injectable()
export class ListColumnsService implements OnDestroy {
  public view: PeGridView

  private displayColumnsListSubject$ = new BehaviorSubject<PeGridTableDisplayedColumns[]>([]);
  public displayColumnsList$ = this.displayColumnsListSubject$.asObservable();

  private fields$ = new Subject<Field[]>();
  private destroyed$: ReplaySubject<boolean> = new ReplaySubject()

  public triggerFetchFields$ = new Subject<void>();

  constructor(
    private fieldsGQLService: FieldsGQLService,
    private envService: EnvService,
  ) {
    this.triggerFetchFields$.pipe(
      startWith([]),
      switchMap(() => this.fieldsGQLService.getAllFields()),
      tap(fields => this.fields$.next(fields)),
      takeUntil(this.destroyed$),
    ).subscribe();


    this.fields$.pipe(
      tap((fields) => {        
        this.displayColumnsListSubject$.next([
          {
            name: 'name',
            title: 'grid.table_displayed_columns.name',
            cellComponent: PeGridTableTitleCellComponent,
            data: {
              titleImageStyle: GridTitleImageStyle.Circle,
            },
            skeletonColumnType: GridSkeletonColumnType.ThumbnailCircleWithName,
            selected$: this.makeBehaviorSubjectWithStorage('name', true, this.view),
            disabled: true,
            minCellWidth: '200px',
          },
          {
            name: 'statusName',
            title: 'contacts-app.actions.status.title',
            selected$: this.makeBehaviorSubjectWithStorage('statusName', true, this.view),
            minCellWidth: '150px',
          },
          ...fields
            .filter(field => !hiddenFields.includes(field.name))
            .map((field): PeGridTableDisplayedColumns => ({
              name: field.name,
              title: defaultFields[field.name] || field.name,
              selected$: this.makeBehaviorSubjectWithStorage(field.name, defaultFields[field.name], this.view),
            })),
          {
            name: 'action',
            title: '',
            cellComponent: PeGridTableActionCellComponent,
            skeletonColumnType: GridSkeletonColumnType.Rectangle,
            disabled: true,
          },
        ]);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private makeBehaviorSubjectWithStorage(
    baseKey: string,
    isDefault: boolean,
    view: PeGridView
  ): BehaviorSubject<boolean> {
    const key = `pe.contacts.${this.envService.businessId}.${view}.customFields.columns.${baseKey}`;
    let result = new BehaviorSubject<boolean>(isDefault);
    try {
      if (sessionStorage?.getItem(key)) {
        result = new BehaviorSubject(sessionStorage.getItem(key) === 'true');
      }
    } catch (e) { }
    result.subscribe((value) => {
      try {
        sessionStorage?.setItem(key, value ? 'true' : 'false');
      } catch (e) { }
    });

    return result;
  }

}
