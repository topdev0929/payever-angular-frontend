import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, merge, Observable } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  startWith,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import { PebElementType } from '@pe/builder/core';
import { isAnchor, PebEventsService, PebEventType } from '@pe/builder/events';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState } from '@pe/builder/state';
import { PebDefRTree } from '@pe/builder/tree';


@Component({
  selector: 'peb-hover',
  template: `
    <svg
      class="container"
      overflow="visible"
      [attr.viewBox]="'0 0 ' + this.width + ' ' + this.height"
      xmlns:svg="http://www.w3.org/2000/svg"
    >
      <svg:rect
        vector-effect="non-scaling-stroke"
        fill="none"
        stroke="#0371e2"
        *ngIf="hovered$ | async as elm"
        [attr.x]="elm.minX"
        [attr.y]="elm.minY"
        [attr.width]="elm.maxX - elm.minX"
        [attr.height]="elm.maxY - elm.minY"
        [attr.stroke-width]="elm.strokeWidth"
      />
    </svg>
  `,
  styles: [`
    :host {
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
      user-select: none;
      -webkit-user-select: none;
    }

    .container {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebHoverComponent {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  @Input() width = 0;
  @Input() height = 0;

  private readonly enabled$ = this.eventsService.events$.pipe(
    filter(ev => [PebEventType.mousedown, PebEventType.mouseup].includes(ev.type)),
    map(({ type }) => type !== PebEventType.mousedown),
    startWith(true),
  );

  mousemove$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mousemove && !isAnchor(ev.target)),
    withLatestFrom(this.selectedElements$, this.enabled$),
    map(([ev, selected, enabled]) => {
      if (!enabled) {
        return null;
      }

      const target = ev.target as PebElement;

      if (target.parent?.type === PebElementType.Grid) {
        const isGridSelected = selected.some(elm => target.parent.id === elm.id);

        if (isGridSelected) {
          return { ...target, strokeWidth: 1 };
        }

        return { ...target.parent, strokeWidth: 1 };
      }

      if (target.parent?.parent?.type === PebElementType.Grid) {
        const isGridSelected = selected.some(elm => target.parent.parent.id === elm.id);
        const isCellSelected = selected.some(elm => target.parent.id === elm.id);

        if (isGridSelected && isCellSelected) {
          return { ...target, strokeWidth: 1 };
        }

        if (isGridSelected) {
          return { ...target.parent, strokeWidth: 1 };
        }

        return { ...target.parent.parent, strokeWidth: 1 };
      }

      const strokeWidth = target.type === PebElementType.Section ? 2 : 1;

      return target.type === PebElementType.Document
        ? null
        : { ...target, strokeWidth };
    }),
    distinctUntilChanged(),
  );

  hovered$ = merge(
    this.eventsService.events$.pipe(
      filter(ev => ev.type === PebEventType.mouseleave),
      mapTo(null),
    ),
    this.selectedElements$.pipe(mapTo(null)),
    this.mousemove$,
  ).pipe(
    throttleTime(0, animationFrameScheduler, { trailing: true }),
  );

  constructor(
    private readonly tree: PebDefRTree,
    private readonly eventsService: PebEventsService,
  ) {
  }
}
