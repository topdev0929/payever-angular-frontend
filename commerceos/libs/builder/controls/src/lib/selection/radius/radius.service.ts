import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, combineLatest, Observable, Subject } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';

import { PebElementType } from '@pe/builder/core';
import { bboxDimension } from '@pe/builder/editor-utils';
import { anchorRect, CursorType, PebAnchorType } from '@pe/builder/events';
import { PebElement } from '@pe/builder/render-utils';
import { PebOptionsState, PebElementsState } from '@pe/builder/state';

import { PebControlColor, PebControlCommon } from '../controls';

import { PebRadiusAnchorsService } from './radius-anchors.service';


@Injectable({ providedIn: 'any' })
export class PebRadiusService {

  @Select(PebOptionsState.scale) scale$!: Observable<number>;
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  controls$ = new Subject<PebControlCommon[]>();
  controlsData$: Observable<any> = combineLatest([
    this.controls$,
    this.scale$,
    this.selectedElements$.pipe(
    ),
  ]).pipe(
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    map(([controls, scale, selectedElements]) => {

      const [controlElement] = controls;
      const [element] = selectedElements;
      const isShape = element && element.type === PebElementType.Shape && element.parent.type !== PebElementType.Grid;
      const isNotRound = element && !element.meta?.borderRadiusDisabled;

      if (!isShape || !isNotRound || !controlElement || selectedElements.length !== 1) { return null; }

      const { minX = 0, minY = 0 } = controlElement;

      const dim = bboxDimension(element);
      const widthElement = +dim.width;
      const heightElement = +dim.height;
      const borderRadius = +element.styles.borderRadius || 0;

      const startPosition = minX;
      const stopPosition = minX + widthElement / 2;
      const maxRadius = Math.min(widthElement, heightElement) / 2;
      const distance = stopPosition - startPosition;
      const percent = borderRadius / maxRadius * 100;
      const shift = distance * (percent / 100);
      const currentPosition = startPosition + shift;
      const newX = currentPosition > stopPosition ? stopPosition : currentPosition;

      const anchor = {
        type: PebAnchorType.Radius,
        ...anchorRect(newX, minY, scale, 4),
        cursor: CursorType.ColResize,
      };

      this.radiusAnchorService.clear();
      this.radiusAnchorService.load([anchor]);

      const width = anchor.maxX - anchor.minX;
      const height = anchor.maxY - anchor.minY;

      return {
        width,
        height,
        x: anchor.minX + width / 2,
        y: anchor.minY + height / 2,
        color: PebControlColor.Debug,
      };

    }),
  );

  constructor(
    private readonly radiusAnchorService: PebRadiusAnchorsService,
  ) {
  }

  renderRadius(items: PebControlCommon[]) {
    this.controls$.next(items);
  }
}
