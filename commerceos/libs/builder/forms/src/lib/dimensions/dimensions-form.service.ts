import { Injectable } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebSelectionBBox, PebSelectionBBoxState } from '@pe/builder/controls';
import { isAutoSize, PebDimension, PebScreen } from '@pe/builder/core';
import {
  PebElementUpdates,
  PebResizeResult,
  PebScale,
  bboxDimension,
  calculatePebSizeToPixel,
  convertedSize,
  containerMaxSpace,
  isAutoHeightText,
  isSyncEnabled,
  normalizeScaleSize,
  resizeElement,
} from '@pe/builder/editor-utils';
import { PebElement, getPebSize, getPebSizeOrAuto, isText } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import {
  PebEditTextModel,
  PebEditorState,
  PebElementsState,
  PebOptionsState,
  PebPatchEditTextAction,
  PebSyncAction,
  PebUpdateAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

const PEB_DIMENSION_PRECESSION = 0.001;

@Injectable({ providedIn: 'any' })
export class PebDimensionsFormService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  resizingView$ = new BehaviorSubject({ width: 0, height: 0 });

  dimensions$ = this.selectedElements$.pipe(
    filter(elements => elements?.length === 1)
  ).pipe(
    map(([element]) => {
      return {
        width: element.styles?.dimension?.width ?? getPebSize('auto'),
        height: isAutoHeightText(element)
          ? getPebSize('auto')
          : getPebSizeOrAuto(element.styles?.dimension?.height),
        minWidth: element.styles?.dimension?.minWidth ?? getPebSize('auto'),
        minHeight: element.styles?.dimension?.minHeight ?? getPebSize('auto'),
        constrainProportions: element.data.constrainProportions,
      };
    }),
  );

  canEditHeight$ = this.selectedElements$.pipe(
    map(([element]) => !isText(element)),
  );

  syncEnabled$: Observable<boolean> = this.selectedElements$.pipe(
    withLatestFrom(this.screen$),
    map(([[element], screen]) => isSyncEnabled(element, screen?.key)),
  );

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly destroy$: PeDestroyService,
  ) {
    this.editText$.pipe(
      tap(({ viewElement }) => this.resizingView$.next(viewElement)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  updateDimension(dimension: Partial<PebDimension>) {
    const selected = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = selected.map(elm => ({ id: elm.id, styles: { dimension } }));

    this.updateElements(payload, selected);
  }

  apply(
    dimension: PebDimension | undefined,
    constrainProportions: boolean | undefined,
  ): boolean {
    const selected = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const payload = [];

    if (constrainProportions !== undefined) {
      selected.forEach(elm => payload.push({ id: elm.id, data: { constrainProportions } }));
    }

    if (dimension !== undefined) {
      const resizesPatches = selected.map(elm => this.applyResize(elm, dimension));
      const hasInvalidResize = resizesPatches.filter(res => !res).length > 0;

      if (hasInvalidResize) {
        return false;
      }

      resizesPatches.forEach(res => payload.push(...res));
    }

    this.updateElements(payload, selected);

    return true;
  }

  private updateElements(payload: any[], selected: PebElement[]) {
    this.store.dispatch(new PebUpdateAction(payload)).pipe(
      tap(() => this.store.dispatch(new PebSyncAction(selected, { position: true, dimension: true })))
    ).subscribe();
  }

  private applyResize(element: PebElement, mixDimension: PebDimension): PebElementUpdates | undefined {
    if (!element.parent) {
      return undefined;
    }

    const dimension = {
      width: getPebSize(mixDimension.width),
      height: getPebSize(mixDimension.height),
    };

    const containerBBox = containerMaxSpace(element);
    const parentDim = bboxDimension(containerBBox);
    const elmDim = bboxDimension(element);

    const current = {
      size: bboxDimension(element),
      unitW: getPebSize(element.styles.dimension.width).unit,
      unitH: getPebSize(element.styles.dimension.height).unit,
    };

    if (!current.size.width || !current.size.height) {
      return undefined;
    }

    const width = convertedSize(
      element.styles.dimension.width,
      dimension.width,
      parentDim.width,
      elmDim.width,
    );

    const height = convertedSize(
      element.styles.dimension.height,
      dimension.height,
      parentDim.height,
      elmDim.height,
    );

    const [, widthPx] = calculatePebSizeToPixel([
      element.styles.position.left,
      width,
      element.styles.position.right,
    ], parentDim.width);

    const [, heightPx] = calculatePebSizeToPixel([
      element.styles.position.top,
      height,
      element.styles.position.bottom,
    ], parentDim.height);

    const scale: PebScale = {
      scaleX: isAutoSize(dimension.width) ? 1 : widthPx / current.size.width,
      scaleY: isAutoSize(dimension.height) ? 1 : heightPx / current.size.height,
      moveX: 0,
      moveY: 0,
    };

    scale.scaleX = normalizeScaleSize(scale.scaleX);
    scale.scaleY = normalizeScaleSize(scale.scaleY);

    if (
      Math.abs(scale.scaleX - 1) < PEB_DIMENSION_PRECESSION &&
      Math.abs(scale.scaleY - 1) < PEB_DIMENSION_PRECESSION
    ) {
      return [{ id: element.id, styles: { dimension: { width, height } } }];
    }

    if (element.data.constrainProportions) {
      scale.scaleX === 1
        ? scale.scaleX = scale.scaleY
        : scale.scaleY = scale.scaleX;
    }

    const res = resizeElement(element, scale, { scalePercentSizes: true });

    if (isText(element)) {
      this.updateTextDimension(res, element);

      return [];
    }

    return res.elementUpdates;
  }

  private updateTextDimension(res: PebResizeResult, element: PebElement) {
    this.store.dispatch(new PebViewPatchAction(res.viewUpdates)).pipe(
      switchMap(() => this.actions$.pipe(
        ofActionDispatched(PebPatchEditTextAction),
        filter(({ payload }: PebPatchEditTextAction) => payload.viewElement?.id === element.id),
        first(),
        tap(({ payload }: PebPatchEditTextAction) => {
          res.elementUpdates.push({
            id: element.id,
            styles: { dimension: { height: getPebSize(payload.viewElement.height) } },
          });

          this.updateElements(res.elementUpdates, [element]);
        })
      ))
    ).subscribe();
  }
}
