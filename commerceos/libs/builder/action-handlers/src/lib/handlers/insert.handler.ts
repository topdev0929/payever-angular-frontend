import { Injectable, OnDestroy } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable, Subject, merge } from 'rxjs';
import { catchError, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebEditorViewport, PebElementDef, PebScreen } from '@pe/builder/core';
import { elementModels, findElementSection, findInsertTarget, getSyncedElementUpdatesForScreens, insertElements } from '@pe/builder/editor-utils';
import { PebElement, isDocument } from '@pe/builder/render-utils';
import {
  PebClipboardState,
  PebEditorState,
  PebElementsState,
  PebInsertAction,
  PebOptionsState,
  PebOptionsStateModel,
  PebSelectAction,
  PebUpdateElementDefAction,
} from '@pe/builder/state';
import { PebDefRTree } from '@pe/builder/tree';


@Injectable()
export class PebInsertActionHandler implements OnDestroy {

  @Select(PebElementsState.selected) selected$!: Observable<PebElement[]>;
  @Select(PebEditorState.elements) elements$!: Observable<{ [id: string]: PebElementDef }>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebEditorState.screens) screens$!: Observable<PebScreen[]>;
  @Select(PebClipboardState.elements) copiedElements$!: Observable<PebElementDef[]>;
  @Select(PebEditorState.viewport) viewport$!: Observable<PebEditorViewport>;
  @Select(PebOptionsState.options) options$!: Observable<PebOptionsStateModel>;

  private insert$ = this.actions$.pipe(
    ofActionDispatched(PebInsertAction),
    withLatestFrom(this.selected$, this.elements$, this.screen$, this.screens$, this.viewport$, this.options$),
    switchMap(([action, selected, defs, screen, screens, viewport, option]) => {
      /*
      - If multiple elements selected, paste into common parent.
      - If selected element type not Section or Shape paste into its parent.
      - If selected is shape and there no empty space available insert into parent.
      - Increase section height to fit if there is no empty space available.
      - TODO: If multiple cells selected, paste into every cell (keynote.app).
      */
      const { elements, options } = action as PebInsertAction;

      let target = Array.isArray(selected) ? selected[0] : selected;
      if (!target || isDocument(target)) {
        target = findInsertTarget(target, this.tree, option, viewport);
      }

      const { updates, insertedElements, roots } = insertElements(elements, target, screen, screens);

      return this.store.dispatch(new PebUpdateElementDefAction(updates)).pipe(
        tap(() => {
          if (options.selectInserted) {
            this.store.dispatch(new PebSelectAction(roots.map(elm => elm.id)));
          }

          if (options.sync) {
            this.handleCumulativeStyles(insertedElements, screen, screens);
          }
        }),
      );
    }),
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly tree: PebDefRTree,
    private readonly store: Store,
    private readonly actions$: Actions,
  ) {
    merge(this.insert$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  private handleCumulativeStyles(
    insertedElements: PebElementDef[],
    screen: PebScreen,
    screens: PebScreen[],
  ) {
    const elementDefs = { ...this.store.selectSnapshot(PebEditorState.elements) };
    insertedElements.forEach(elm => elementDefs[elm.id] = elm);
    const models = elementModels(elementDefs, screen, undefined, screens).elements;
    const roots = insertedElements.filter(elm => !elm.parent?.id || !insertedElements.some(e => e.id === elm.parent.id));
    const rootElements = roots.map(elm => models.find(e => elm.id === e.id)).filter(elm => !!elm);

    const syncUpdates = getSyncedElementUpdatesForScreens(
      rootElements,
      elementDefs,
      screen,
      screens,
      { position: true, dimension: true, textStyles: true },
    );

    const section = findElementSection(rootElements[0]);
    if (section && section.id !== rootElements[0].id) {
      syncUpdates.push(...getSyncedElementUpdatesForScreens(
        [section],
        elementDefs,
        screen,
        screens,
        { dimension: true },
      ));
    }

    this.store.dispatch(new PebUpdateElementDefAction(syncUpdates));
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
