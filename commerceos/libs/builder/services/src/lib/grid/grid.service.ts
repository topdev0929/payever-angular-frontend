import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebControlsService } from '@pe/builder/controls';
import { PebElementType } from '@pe/builder/core';
import { finalizeWithValue } from '@pe/builder/editor-utils';
import { isAnchor, PebAnchorType, PebEventsService, PebEventType } from '@pe/builder/events';
import { PebElement } from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import { PebElementsState, PebUpdateAction } from '@pe/builder/state';


@Injectable({ providedIn: 'any' })
export class PebGridService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  mousedown$ = this.eventsService.events$.pipe(
    filter((ev) => {
      const target = ev.target;

      return ev.type === PebEventType.mousedown
        && isAnchor(target)
        && [PebAnchorType.ColResize, PebAnchorType.RowResize].includes(target.type);
    }),
  );

  mouseup$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mouseup),
  );

  resize$ = this.selectedElements$.pipe(
    map((elements) => {
      const elementsWithGrid = elements.reduce((acc, element) => {
        acc.set(element.id, element);

        let parent = element;
        while (parent && parent.type !== PebElementType.Grid) {
          parent = parent.parent;
        }
        if (parent) {
          acc.set(parent.id, parent);
        }

        return acc;
      }, new Map<string, PebElement>());

      return [...elementsWithGrid.values()];
    }),
    filter(elements => elements.some(e => e.type === PebElementType.Grid)),
    map((elements) => {
      const grid = elements.find(e => e.type === PebElementType.Grid);
      const { gridTemplateColumns, gridTemplateRows } = grid.styles;

      return { elements, cols: [...gridTemplateColumns], rows: [...gridTemplateRows] };
    }),
    switchMap(({ elements, cols, rows }) => this.mousedown$.pipe(
      switchMap(mousedown => this.eventsService.events$.pipe(
        filter((ev) => {
          const target = mousedown.target;
          if (isAnchor(target)) {
            const isLastColumn = target.type === PebAnchorType.ColResize && target.index === cols.length - 1;
            const isLastRow = target.type === PebAnchorType.RowResize && target.index === rows.length - 1;

            if (isLastColumn || isLastRow) {
              return false;
            }
          }

          return ev.type === PebEventType.mousemove;
        }),
        map((ev) => {
          const target = mousedown.target;
          const grid = elements.find(e => e.type === PebElementType.Grid);

          if (isAnchor(target)) {
            const index = target.index;

            if (target.type === PebAnchorType.ColResize) {
              const min = 10 - cols[index];
              const max = cols[index + 1] - 10;
              const deltaX = Math.min(Math.max(min, ev.x - mousedown.x), max);

              const gridTemplateColumns = [...cols];
              gridTemplateColumns[index] = cols[index] + deltaX;
              gridTemplateColumns[index + 1] = cols[index + 1] - deltaX;

              return { grid, cols: gridTemplateColumns, rows };
            }

            if (target.type === PebAnchorType.RowResize) {
              const min = 10 - rows[index];
              const max = rows[index + 1] - 10;
              const deltaY = Math.min(Math.max(min, ev.y - mousedown.y), max);

              const gridTemplateRows = [...rows];
              gridTemplateRows[index] = rows[index] + deltaY;
              gridTemplateRows[index + 1] = rows[index + 1] - deltaY;

              return { grid, cols, rows: gridTemplateRows };
            }
          }
        }),
        tap(({ grid, cols, rows }) => {
          this.store.dispatch(new PebViewPatchAction([{
            id: grid.id,
            style: {
              gridTemplateColumns: cols.map(v => `${v}px`).join(' '),
              gridTemplateRows: rows.map(v => `${v}px`).join(' '),
            },
          }]));

          const selected = elements.map((e) => {
            if (e.id === grid.id) {
              e.styles = {
                ...e.styles,
                gridTemplateColumns: cols,
                gridTemplateRows: rows,
              };
            }

            return e;
          });

          const controls = this.controlsService.createDefaultControlsSet(selected);
          this.controlsService.renderControls(controls);
        }),
        finalizeWithValue(({ grid, cols, rows }) => {
          this.store.dispatch(new PebUpdateAction([{
            id: grid.id,
            styles: {
              gridTemplateColumns: cols,
              gridTemplateRows: rows,
            },
          }]));
        }),
        takeUntil(this.mouseup$),
      )),
    )),
  );

  constructor(
    private readonly eventsService: PebEventsService,
    private readonly controlsService: PebControlsService,
    private readonly store: Store,
  ) {
  }
}
