import { Injectable } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';

import { PebScreen } from '@pe/builder/core';
import { isAnchor, PeAnchorType, PebAnchorType, PebEventsService, PebEventType } from '@pe/builder/events';
import { PebElement } from '@pe/builder/render-utils';
import { PebOptionsState, PebElementsState } from '@pe/builder/state';

import { PebControlsService } from '../controls.service';
import { PebSelectionBBox } from '../selection';
import { PebSelectionBBoxState } from '../selection.state';

@Injectable()
export class PebRadiusMoveService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;

  mousedown$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mousedown && isAnchor(ev.target)),
  );

  mouseup$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mouseup),
  );

  mousemove$ = this.mousedown$.pipe(
    switchMap(mousedown => this.eventsService.events$.pipe(
      filter(ev => ev.type === PebEventType.mousemove),
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      withLatestFrom(this.selection$, this.selectedElements$, this.screen$),
      map(([event, selection, elements, screen])=> {
        const childrenIds = [];
        elements.forEach((elm) => {
          [...elm.children].forEach(child => childrenIds.push(child.id));
        });

        return {
          event,
          elements: elements.filter(elm => !childrenIds.includes(elm.id)),
          screen,
          selection,
        };
      }),
      filter(() => {
        const target = mousedown.target as PeAnchorType;
        const anchorType = target.type;

        return anchorType === PebAnchorType.Radius;
      }),
      map(({ event, selection, elements, screen }) => {
        const target = mousedown.target as PeAnchorType;
        const anchorType = target.type;

        const halfWidth = selection.width / 2;
        const startX = selection.left;
        const greenX = event.x;
        const deltaX = greenX - startX;
        const percent = deltaX / (halfWidth / 100);
        const currentPercent = this.getCurrentPercent(percent);
        const minDimension = Math.min(selection.width, selection.height) / 2;
        const percentPixels = Math.round(currentPercent * (minDimension / 100));

        const element = elements[0];
        element.styles.borderRadius = percentPixels;

        const controls = this.controlsService.createDefaultControlsSet(elements);
        this.controlsService.renderControls(controls);

        return { anchorType, elements, screen };
      }),
      takeUntil(this.mouseup$),
    )),
  );

  constructor(
    private readonly eventsService: PebEventsService,
    private readonly controlsService: PebControlsService,
  ) {
    this.mousemove$.subscribe();
  }

  private getCurrentPercent(percent: number): number {
    if (percent < 0) {
      return 0;
    }
    if (percent > 100) {
      return 100;
    }

    return percent;
  }
}

