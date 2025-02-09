import { Injectable, OnDestroy } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { merge, Observable, Subject } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { PebControlsService } from '@pe/builder/controls';
import { editorMappedStyles, getScale, resizeElement } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import {
  PebElementsState,
  PebUpdateAction,
  PebSelectAction,
  PebSyncAction,
  PebResizeAction,
} from '@pe/builder/state';


@Injectable()
export class PebResizeActionHandler implements OnDestroy {

  @Select(PebElementsState.selected) private readonly selected$!: Observable<PebElement[]>;

  private resize$ = this.actions$.pipe(
    ofActionDispatched(PebResizeAction),
    tap((action: PebResizeAction) => {

      const { elements, initialBBox, finalBBox } = action;
      const elementUpdates = [];

      const batchRes = elements.map((elm) => {
        const scale = getScale(elm, initialBBox, finalBBox);
        const res = resizeElement(elm, scale, { scalePercentSizes: true });

        if (res) {
          elementUpdates.push(...res.elementUpdates);
        }

        return res ?? { resizedElement: elm };
      });

      if (elementUpdates) {
        this.store.dispatch(new PebUpdateAction(elementUpdates)).pipe(
          tap(() => {
            const resizedElements = batchRes.map(item => item.resizedElement);
            this.store.dispatch(new PebSyncAction(resizedElements, { position: true, dimension: true, textStyles: true }));
          }),
        ).subscribe();
      }
    }),
  );


  private destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly controlsService: PebControlsService,

  ) {
    merge(this.resize$).pipe(
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

  private revertPosition(elements: PebElement[], selected: PebElement[]): void {
    const payload = [];
    elements.forEach((element) => {
      payload.push({
        id: element.id,
        style: editorMappedStyles(element),
      });
    });

    this.store.dispatch(new PebViewPatchAction(payload));

    const controls = this.controlsService.createDefaultControlsSet(elements);
    this.controlsService.renderControls(controls);

    this.store.dispatch(new PebSelectAction(selected));
  }
}
