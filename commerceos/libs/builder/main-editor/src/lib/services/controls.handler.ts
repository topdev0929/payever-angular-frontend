import { Injectable } from '@angular/core';
import { Actions, ofActionDispatched, Select } from '@ngxs/store';
import { Observable, merge } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebControlsService } from '@pe/builder/controls';
import { isInlineBlockPosition, PebScreen } from '@pe/builder/core';
import { elementBBox, isAutoHeightText } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import {
  PebEditorState,
  PebEditTextModel,
  PebElementsState,
  PebOptionsState,
  PebPatchBBoxELementsAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';


@Injectable()
export class PebControlsHandler {
  @Select(PebOptionsState.scale) currentScale$!: Observable<number>;
  @Select(PebElementsState.selected) selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  private handleScreenChange$ = this.screen$.pipe(
    filter(screen => !!screen),
    distinctUntilChanged((scr1, scr2) => scr1.key === scr2.key),
    tap(() => {
      this.controlsService.renderControls([]);
    }),
  );

  handleSelectedElement$ = this.selectedElements$.pipe(
    tap((selected) => {
      const controls = this.controlsService.createDefaultControlsSet(selected);
      this.controlsService.renderControls(controls);
    }),
  );

  handleBBoxPatches$ = this.actions$.pipe(
    ofActionDispatched(PebPatchBBoxELementsAction),
    tap((action: PebPatchBBoxELementsAction) => {

      const updateControls = this.controlsService.getControls().map((control) => {
        const update = control.elements && action.elements.find(elm => elm.id === control.elements[0].id);

        if (update && (isInlineBlockPosition(update.styles.position) || isAutoHeightText(update))) {
          return { ...control, ...elementBBox(update) };
        }

        return control;
      });

      this.controlsService.renderControls(updateControls);
    })
  );

  private renderTextEditorControls$ = this.editText$.pipe(
    tap((editText) => {
      if (editText.enabled && editText.element) {
        const controls = [this.controlsService.getTextEditorControl(editText.element)];
        this.controlsService.renderControls(controls);
      }
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly destroy$: PeDestroyService,
    private readonly controlsService: PebControlsService,
  ) {
    merge(
      this.handleSelectedElement$,
      this.renderTextEditorControls$,
      this.handleScreenChange$,
      this.handleBBoxPatches$,
    ).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }
}
