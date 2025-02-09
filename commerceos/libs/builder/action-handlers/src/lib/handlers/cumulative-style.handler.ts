import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { catchError, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import {
  PebElementDef,
  PebElementDefData,
  PebElementDefUpdate,
  PebElementStyles,
  PebElementType,
  PebScreen,
  PebValueByScreen,
} from '@pe/builder/core';
import { getSyncedElementUpdatesForScreens } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import {
  PebElementsState,
  PebEditorState,
  PebClipboardState,
  PebOptionsState,
  PebSyncAction,
  PebUpdateElementDefAction,
  PebClearStylesAction,
} from '@pe/builder/state';


@Injectable()
export class PebCumulativeStyleActionHandler implements OnDestroy {

  @Select(PebElementsState.selected) selected$!: Observable<PebElement[]>;
  @Select(PebEditorState.elements) elementDefs$!: Observable<{ [id: string]: PebElementDef }>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebEditorState.screens) screens$!: Observable<PebScreen[]>;
  @Select(PebClipboardState.elements) copiedElements$!: Observable<PebElementDef[]>;

  private reflectStylesOnScreens$ = this.actions$.pipe(
    ofActionDispatched(PebSyncAction),
    withLatestFrom(this.elementDefs$, this.screen$, this.screens$),
    tap(([action, elementDefs, screen, screens]: [PebSyncAction, { [id: string]: PebElementDef }, PebScreen, PebScreen[]]) => {
      const updates = getSyncedElementUpdatesForScreens(
        action.elements,
        elementDefs,
        screen,
        screens,
        action.updates,
      );

      this.store.dispatch(new PebUpdateElementDefAction(updates));
    }),
  )

  private clearStyles$ = this.actions$.pipe(
    ofActionDispatched(PebClearStylesAction),
    withLatestFrom(this.selected$),
    tap(([, selected]) => this.clearStyles(selected)),
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
  ) {
    merge(this.reflectStylesOnScreens$, this.clearStyles$,).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  private clearStyles(selected: PebElement[]) {
    const screen = this.store.selectSnapshot(PebOptionsState.screen);
    const language = this.store.selectSnapshot(PebOptionsState.language);
    const payload: PebElementDefUpdate[] = [];

    for (const element of selected) {
      const styles: PebValueByScreen<Partial<PebElementStyles>> = {};
      const data: PebValueByScreen<Partial<PebElementDefData>> = {};
      const excludedStyles = this.getExcludedStyles(element);

      styles[screen.key] = Object.keys(element.styles).reduce((acc, key) => {
        acc[key] = excludedStyles.includes(key as keyof PebElementStyles) ? element.styles[key] : undefined;

        return acc;
      }, {});

      data.text = element.text ? {
        [screen.key]: {
          [language.key]: { ops: element.text.ops.map(op => ({ ...op, attributes: undefined })) },
        },
      } : undefined;

      payload.push({ id: element.id, styles, data });
    }

    this.store.dispatch([new PebUpdateElementDefAction(payload)]);
  }

  private getExcludedStyles(element: PebElement) {
    const excludedStyles: (keyof PebElementStyles)[] = ['dimension', 'position'];

    if (element.meta?.borderRadiusDisabled && element.styles.borderRadius) {
      excludedStyles.push('borderRadius');
    }

    if (element.styles.layout) {
      excludedStyles.push('layout');
    }

    if (element.type === PebElementType.Grid) {
      excludedStyles.push('gridTemplateColumns');
      excludedStyles.push('gridTemplateRows');
    }

    return excludedStyles;
  }
}
