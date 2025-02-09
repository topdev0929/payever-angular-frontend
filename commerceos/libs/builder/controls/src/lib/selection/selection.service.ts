import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BBox } from 'rbush';
import { animationFrameScheduler, Observable } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { isGridLayout, PebElementType } from '@pe/builder/core';
import { findTotalArea } from '@pe/builder/editor-utils';
import { isAnchor, PebEvent, PebMouseEventButton, PebEventsService, PebEventType, isMiddleMouseButtonEvent, isDragoverEvent, isMouseDownEvent, isMouseUpEvent, isDropEvent } from '@pe/builder/events';
import { PebElement } from '@pe/builder/render-utils';
import { PebEditorState, PebEditTextModel, PebElementsState, PebSelectAction } from '@pe/builder/state';
import { PebDefRTree } from '@pe/builder/tree';
import { PeDestroyService } from '@pe/common';

import { PebControlsService } from './controls.service';
import { findGroupedElements, isContextGrid, isGridElement, PebSelectionError } from './selection';
import { PebSetSelectionBBoxAction } from './selection.actions';

@Injectable({ providedIn: 'any' })
export class PebSelectionService {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebElementsState.openGroup) openGroup$!: Observable<string>;
  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  constructor(
    private readonly tree: PebDefRTree,
    private readonly eventsService: PebEventsService,
    private readonly controlsService: PebControlsService,
    private readonly store: Store,
    private readonly destroy$: PeDestroyService,
  ) {

    this.selectedElements$.pipe(
      filter(element => !!element),
      withLatestFrom(this.selectedElements$),
      tap(([selectedElement]) => {
      const area = findTotalArea(selectedElement);
      this.store.dispatch(
        new PebSetSelectionBBoxAction({
          left: area.minX,
          top: area.minY,
          right: area.maxX,
          bottom: area.maxY,
        }));
      }),
    ).subscribe();
  }

  mousedown$ = this.eventsService.events$.pipe(
    filter(ev => isMouseDownEvent(ev) && !isAnchor(ev.target) && !isMiddleMouseButtonEvent(ev) || isDragoverEvent(ev) ),
    filter(ev => ev.type === PebEventType.mousedown && !isAnchor(ev.target) && ev.button === PebMouseEventButton.Left),
    withLatestFrom(this.selectedElements$, this.openGroup$, this.editText$),
    tap(([ev, selected, openGroup, editText]) => {
      let target = ev.target as PebElement;

      /** Prevent selection change if element already selected and no shift/meta key pressed */
      const isSelected = selected.some(elm => elm.id === target.id);
      if (!isSelected || ev.shiftKey || ev.metaKey) {
        const elements = this.updateSelection(ev, target, selected, openGroup);
        const controls = this.controlsService.createDefaultControlsSet(elements, openGroup);
        this.controlsService.renderControls(controls);
      } else {
        /**
         * Need to update controls if target is inside context grid,
         * because selected element still is the same, but mousedown event can be in other cells
         */
        let elm = target;
        while (elm.parent && !isGridElement(elm)) {
          elm = elm.parent;
        }

        if (isContextGrid(elm)) {
          const controls = this.controlsService.createDefaultControlsSet(selected, openGroup);
          this.controlsService.renderControls(controls);
        }
      }
    }),
    takeUntil(this.destroy$),
  );

  mouseup$ = this.eventsService.events$.pipe(
    filter(ev =>isMouseUpEvent(ev) || isDropEvent(ev)),
    takeUntil(this.destroy$),
  );

  mousemove$ = this.mousedown$.pipe(
    switchMap(([mousedown, selected, group]) => this.eventsService.events$.pipe(
      filter((ev) => {
        /**
         * Can start drag selection only on Document or Section elements,
         * or on grid cells, if grid is only one currently selected element.
         */
        const target = mousedown.target as PebElement;
        const isGridCell = target.parent?.type === PebElementType.Grid;
        let allowSelectCells = false;
        if (isGridCell) {
          allowSelectCells = selected.some(elm => elm.id === target.parent?.id);
        }

        return ev.type === PebEventType.mousemove
          && (allowSelectCells || [PebElementType.Document, PebElementType.Section].includes(target.type));
      }),
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      tap((ev) => {
        const bbox = {
          minX: Math.min(mousedown.x, ev.x),
          minY: Math.min(mousedown.y, ev.y),
          maxX: Math.max(mousedown.x, ev.x),
          maxY: Math.max(mousedown.y, ev.y),
        };

        const intersects = this.tree.search(bbox);

        const elements = this.updateSelection(ev, intersects, selected, group);
        const controls = this.controlsService.createDefaultControlsSet(elements, group);

        this.controlsService.renderControls(controls);
      }),
      map(({ x, y }) => ({ x1: mousedown.x, y1: mousedown.y, x2: x, y2: y })),
      takeUntil(this.mouseup$),
    )),
  );

  /**
   * Update elements selection
   * @param ev ShiftKey or MetaKey is pressed
   * @param value Elements to add or remove from selection - mousedown target or elements found in RTree by selection area
   * @param selected Already selected elements
   * @param openGroup Current selected (open on dblclick) group
   */
  updateSelection(ev: PebEvent, value: PebElement | PebElement[], selected: PebElement[], openGroup?: string) {
    let elements = Array.isArray(value) ? value : [value];

    if (elements.length === 1) {
      let parent = elements[0].parent;
      while (
        parent
        && isGridLayout(parent.styles.layout)
        && !selected.some(elm => parent?.id === elm.id || parent.id === elm.parent?.id)
      ) {
        elements = [parent];
        parent = parent.parent;
      }
    }

    /**
     * At least Document element should be always selected.
     * When no other elements selected, UI in editor show properties for a Document element.
     * As Document element dimensions are defined from -Infinity to Infinity it's always
     * should be present in mouse event target if no others elements at mouse position found
     * or by search in elements RTree.
     */
    if (elements.length === 0) {
      throw new PebSelectionError(`Elements array can't be empty`);
    }

    /**
     * If elements to select contains only Document element:
     * if no shift or meta key pressed - select Document element and return,
     * otherwise remove it from elements array.
     */
    if (elements.length === 1 && elements[0].type === PebElementType.Document) {
      if (!ev.shiftKey && !ev.metaKey) {
        this.store.dispatch(new PebSelectAction(elements[0]));
        this.controlsService.renderControls([]);

        return elements;
      }

      elements = [];
    }

    /**
     * By mousedown selection Grid can't be selected directly,
     * instead in elements will be cells shapes or nested elements.
     * If some Grid elements present, they only can be found in RTree by drag selection
     * In this case need to remove all grid cells and nested cells elements.
     */
    const grids = new Map<string, PebElement>();
    elements.forEach((elm) => {
      if (!isGridElement(elm)) {
        let parent = elm.parent;
        while (parent && !isGridElement(parent)) {
          parent = parent.parent;
        }
      }

      if (isGridElement(elm) && !grids.has(elm.id)) {
        grids.set(elm.id, elm);
      }
    });

    if (grids.size) {
      const nestedElements = (elm: PebElement, acc: PebElement[] = []) => {
        for (const child of elm.children) {
          acc.push(child);

          nestedElements(child, acc);
        }

        return acc;
      };

      const children = [...grids.values()].reduce<PebElement[]>((acc, elm) => acc.concat(nestedElements(elm)), []);
      elements = elements.filter(elm => !children.some(({ id }) => id === elm.id));
    }

    /** Check if element is inside grid */
    if (elements.length === 1) {

      let grid = elements[0];
      let cell = elements[0];
      while (!isGridElement(grid) && grid.parent) {
        cell = grid;
        grid = grid.parent;
      }

      if (isGridElement(grid)) {
        const isGridSelected = selected.some(elm => elm.id === grid.id);
        const isCellSelected = selected.some(elm => elm.id === cell.id);

        const isAnySelected = selected.some((elm) => {
          let parent = elm.parent;
          while (parent && parent.id !== grid.id) {          
            parent = parent.parent;
          }

          return parent?.id === grid.id;
        });

        if (!isGridSelected && !isCellSelected && !isAnySelected) {
          elements = [grid];
        } else if (!isCellSelected && !isAnySelected) {
          elements = [cell];
        } else if (!isAnySelected) {
          elements = [grid];
        }
      }
    }

    /** Filter Document and Section elements */
    if (elements.every(elm => [PebElementType.Document, PebElementType.Section].includes(elm.type))) {
      elements = elements.filter(elm => elm.type === PebElementType.Section);
      /** Need to modify section sidebar forms to handle multiple selected sections, for now take only first */
      elements.splice(1);
    } else if (elements.length > 1) {
      elements = elements.filter(elm => ![PebElementType.Document, PebElementType.Section].includes(elm.type));
    }

    /** If any group is open, only elements having this group id can be selected */
    if (openGroup) {
      elements = elements.filter(elm => elm.data.groupId.includes(openGroup));
    }

    /** Find all grouped elements, keep each group items separately to render group controls */
    const groups = findGroupedElements(elements, openGroup);

    /** Add items for all groups found into elements */
    if (groups.size) {
      const groupedItems = [...groups.values()].reduce((acc, val) => acc.concat(val), []);
      elements = [...new Set<PebElement>([...elements, ...groupedItems])];
    }

    /**
     * If shift or meta key pressed, selection is diff of new elements and already selected,
     * except document and section elements, they can't be selected together with other elements
     */
    if ((ev.shiftKey || ev.metaKey) && ![PebElementType.Document, PebElementType.Section].includes(elements[0]?.type)) {
      const toAdd = elements.filter(elm => !selected.find(e => e.id === elm.id));
      const toKeep = selected.filter(elm => !elements.find(e => elm.id === e.id));
      elements = toAdd.concat(toKeep);
    }

    if (elements.length === 0) {
      /** Make sure document is selected if there are no other elements to select */
      let doc = selected[0];
      while (doc && doc.type !== PebElementType.Document) {
        doc = doc.parent;
      }

      elements.push(doc);
    } else {
      /** Otherwise if some elements to select make sure document is removed from selection */
      const index = elements.findIndex(e => e.type === PebElementType.Document);
      if (index !== -1 && elements.length > 1) {
        elements.splice(index, 1);
      }
    }

    this.store.dispatch(new PebSelectAction(elements));

    return elements;
  }
}

export const getBBox = (elm: PebElement): BBox => {
  const { minX, minY, maxX, maxY } = elm;

  return { minX, minY, maxX, maxY };
};
