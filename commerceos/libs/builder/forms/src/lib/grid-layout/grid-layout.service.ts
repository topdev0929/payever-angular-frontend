import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';

import { isContextGrid, isGridElement } from '@pe/builder/controls';
import {
  PebAPIDataSourceParams,
  PebElementDef,
  PebElementDefUpdate,
  PebElementType,
  PebScreen,
} from '@pe/builder/core';
import { PebElementUpdates, bboxDimension, splitGrid } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import {
  PebDeleteAction,
  PebEditorState,
  PebElementsState,
  PebSelectAction,
  PebUpdateAction,
  PebUpdateElementDefAction,
} from '@pe/builder/state';
import { PebViewIntegrationClearCacheAction } from '@pe/builder/view-actions';

import { addColumns, addRows, removeColumns, removeRows } from './grid-layout';

@Injectable({ providedIn: 'any' })
export class PebGridLayoutService {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  elements$ = this.selectedElements$.pipe(
    map(elements => elements.filter(elm => elm.type === PebElementType.Grid)),
  );

  layout$ = this.elements$.pipe(
    map((elements) => {
      const { cols, rows } = elements.reduce((acc, elm) => {
        const { gridTemplateColumns = [], gridTemplateRows = [] } = elm.styles;
        acc.cols.push(gridTemplateColumns.length);
        acc.rows.push(gridTemplateRows.length);

        return acc;
      }, { cols: [], rows: [] });

      return { cols: Math.min(...cols), rows: Math.min(...rows) };
    }),
  );

  constructor(
    private readonly store: Store,
  ) {
  }

  updateLayout(value: { cols: number; rows: number }): void {
    const { cols, rows } = value;
    const selected = this.store.selectSnapshot<PebElement[]>(PebElementsState.selected);
    const screens = this.store.selectSnapshot<PebScreen[]>(PebEditorState.screens);
    const elements = selected.filter(elm => elm.type === PebElementType.Grid);
    const defs = this.store.selectSnapshot<{ [key: string]: PebElementDef }>(PebEditorState.elements);

    const elementDefUpdates: PebElementDefUpdate[] = [];
    const elementUpdates: PebElementUpdates = [];
    const removedElements: PebElement[] = [];

    elements.forEach((elm) => {
      if (isGridElement(elm)) {
        const { width, height } = bboxDimension(elm);
        const gridTemplateColumns = splitGrid(elm.styles.gridTemplateColumns, cols, width);
        const gridTemplateRows = splitGrid(elm.styles.gridTemplateRows, rows, height);

        const colsNum = gridTemplateColumns.length - elm.styles.gridTemplateColumns.length;
        const rowsNum = gridTemplateRows.length - elm.styles.gridTemplateRows.length;

        if (!isContextGrid(elm)) {
          if (colsNum > 0) {
            const { newElements, updates } = addColumns(Math.abs(colsNum), elm, defs, screens);
            elementDefUpdates.push(...newElements);
            elementUpdates.push(...updates);
          } else if (colsNum < 0) {
            removedElements.push(...removeColumns(Math.abs(colsNum), elm));
          }

          if (rowsNum > 0) {
            const { newElements, updates } = addRows(Math.abs(rowsNum), elm, defs, screens);
            elementDefUpdates.push(...newElements);
            elementUpdates.push(...updates);
          } else if (rowsNum < 0) {
            removedElements.push(...removeRows(Math.abs(rowsNum), elm));
          }
        }

        const styles: any = {};
        if (colsNum !== 0) {
          styles.gridTemplateColumns = gridTemplateColumns;
        }

        if (rowsNum !== 0) {
          styles.gridTemplateRows = gridTemplateRows;
        }

        if (Object.keys(styles).length > 0) {
          elementUpdates.push({ id: elm.id, styles });
        }

        const dataParams: PebAPIDataSourceParams = { pagination: { limit: rows * cols, page: 1 } };
        elementUpdates.push({ id: elm.id, integration: { dataParams } });
        this.store.dispatch(new PebViewIntegrationClearCacheAction());
      }
    });

    if (removedElements.length) {
      this.store.dispatch(new PebDeleteAction(removedElements)).pipe(
        tap(() => this.store.dispatch(new PebSelectAction(elements))),
        take(1),
      ).subscribe();
    }

    if (elementDefUpdates.length) {
      this.store.dispatch(new PebUpdateElementDefAction(elementDefUpdates));
    }

    if (elementUpdates.length) {
      this.store.dispatch(new PebUpdateAction(elementUpdates));
    }
  }
}


