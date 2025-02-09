import { Injectable, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BBox } from 'rbush';
import { animationFrameScheduler, Observable, Subject } from 'rxjs';
import { catchError, filter, map, share, switchMap, takeUntil, throttleTime, withLatestFrom } from 'rxjs/operators';

import { PebSetRenderPatchModeAction } from '@pe/builder/actions';
import { PebEditorPatchMode, PebEditorPoint, PebElementType, PebScreen } from '@pe/builder/core';
import {
  detectSnapLines,
  finalizeWithValue,
  findTotalArea,
  getSnapPoints,
  findElementSection,
  findBBoxesByPoint,
  sortByInnerElements,
  canInsertChild,
  translateBBox,
  relativeBBoxSizes,
  canMoveTo,
  isSyncEnabled,
  findElementRoot,
  pointIsInsideBBox,
} from '@pe/builder/editor-utils';
import { isAnchor, isLeftMouseButtonEvent, isMouseDownEvent, isMouseMoveEvent, PeAnchorType, PebAnchorType, PebEvent, PebEventsService, PebEventType } from '@pe/builder/events';
import { PebElement, isSection, isDocument, isReadonly, isText } from '@pe/builder/render-utils';
import { PebRevertViewPatchAction, PebViewPatchAction } from '@pe/builder/renderer';
import { PebEditorState, PebEditTextModel, PebElementsState, PebMoveAction, PebOptionsState, PebSetSnapLines } from '@pe/builder/state';
import { PebDefRTree } from '@pe/builder/tree';

import { PebControlAnchorType, PebControlColor, PebControlCommon } from './controls';
import { PebControlsService } from './controls.service';
import { PebGridService } from './grid.service';
import { isGridElement, PebSelectionBBox } from './selection';
import { PebSelectionBBoxState } from './selection.state';

@Injectable({ providedIn: 'any' })
export class PebMoveService implements OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebSelectionBBoxState.boundingBox) selection$!: Observable<PebSelectionBBox>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly tree: PebDefRTree,
    private readonly controlsService: PebControlsService,
    private readonly eventsService: PebEventsService,
    private readonly gridService: PebGridService,
  ) {
    this.move$.pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  mouseup$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mouseup),
  );

  mousemove$ = this.eventsService.events$.pipe(
    filter(ev => isMouseMoveEvent(ev)),
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    share(),
  );

  move$ = this.selectedElements$.pipe(
    withLatestFrom(this.screen$),
    switchMap(([selected, screen]) => this.eventsService.events$.pipe(
      withLatestFrom(this.editText$),
      filter(([ev, editText]) => !editText.enabled && isMouseDownEvent(ev) && isLeftMouseButtonEvent(ev)),
      filter(([ev]) => this.isMovable(ev.target, selected, screen) && !ev.metaKey && !ev.shiftKey),
      map(([ev]) => {
        const elementsMap: Map<string, PebElement> = selected.reduce((acc, element) => {

          /** Skip nested elements */
          let parent = element;
          while (parent && !selected.some(e => e.id === parent.parent?.id)) {
            parent = parent.parent;
          }

          if (!parent) {
            acc.set(element.id, element);
          }

          return acc;
        }, new Map<string, PebElement>());

        if (isAnchor(ev.target)) {
          const grid = this.gridService.getGridByAnchor(ev.target);
          const recursive = (element) => {
            elementsMap.delete(element.id);
            [...element.children].forEach(child => recursive(child));
          };
          [...grid.children].forEach(child => recursive(child));
          elementsMap.set(grid.id, grid);
        }

        const initialMouse = { x: ev.x, y: ev.y };
        const selection = findTotalArea([...elementsMap.values()]);
        const movingBBox = { ...selection };
        const initialBBox = { ...selection };

        const elementsToSkip = new Set<string>();
        elementsMap.forEach((element) => {
          elementsToSkip.add(element.id);
          this.collectChildren(element, elementsToSkip);
        });

        const section = findElementSection(selected[0]);
        const snapPoints = getSnapPoints(section, selected);
        const elements = [...elementsMap.values()];

        return { elements, initialBBox, movingBBox, initialMouse, snapPoints, elementsToSkip };
      }),
      switchMap(({ elements, initialBBox, movingBBox, initialMouse, snapPoints, elementsToSkip }) => this.mousemove$.pipe(
        map((event) => {
          const dx = event.x - initialMouse.x;
          const dy = event.y - initialMouse.y;

          movingBBox.minX = initialBBox.minX + dx;
          movingBBox.minY = initialBBox.minY + dy;
          movingBBox.maxX = initialBBox.maxX + dx;
          movingBBox.maxY = initialBBox.maxY + dy;

          return event;
        }),
        map((event) => {
          const { snapLines, transform } = detectSnapLines(
            movingBBox,
            snapPoints,
            { move: { left: true, right: true, bottom: true, top: true, center: true } },
          );
          transform && (movingBBox = translateBBox(movingBBox, transform.moveX, transform.moveY));

          this.store.dispatch(new PebSetSnapLines(snapLines));

          return event;
        }),
        map((event) => {
          this.store.dispatch(new PebSetRenderPatchModeAction(PebEditorPatchMode.Move));

          const dropPoint = this.getMovingDropPoint(elements, event);
          const dx = movingBBox.minX - initialBBox.minX;
          const dy = movingBBox.minY - initialBBox.minY;

          elements.forEach((element) => {
            const { left, top } = isDocument(element.parent)
              ? { left: element.minX, top: element.minY } :
              relativeBBoxSizes(element.parent, element);

            this.store.dispatch(new PebViewPatchAction([{
              id: element.id,
              style: {
                left: `${left + dx}px`,
                top: `${top + dy}px`,
                position: 'absolute',
                zIndex: '99999',
              },
            }]));
          });

          const { container, bbox } = this.findContainer(elements, elementsToSkip, movingBBox, dropPoint);

          this.renderMovingControls(elements, container, bbox, movingBBox);

          return { container, event, dropPoint, dx, dy };
        }),
        takeUntil(this.mouseup$),
        finalizeWithValue(({ container, dropPoint, dx, dy }) => {
          this.store.dispatch(new PebSetRenderPatchModeAction(undefined));
          this.store.dispatch(new PebSetSnapLines([]));

          container
            ? this.store.dispatch(new PebMoveAction(elements, container, { moveX: dx, moveY: dy }, dropPoint))
            : this.store.dispatch(new PebRevertViewPatchAction(elements));
        }),
      )),
    )),
    share(),
  );

  private getMovingDropPoint(elements: PebElement[], event: PebEvent): PebEditorPoint {
    const dropPoint = { x: event.x, y: event.y };
    const isGrid = elements.length === 1 && isGridElement(elements[0]);

    if (isGrid) {
      const scale = this.store.selectSnapshot(PebOptionsState.scale);
      const ruler = this.controlsService.gridRuler;

      dropPoint.x += ruler / scale;
      dropPoint.y += ruler / scale;
    }

    return dropPoint;
  }

  private findContainer(elements: PebElement[], elementsToSkip: Set<string>, movingBBox: BBox, dropPoint: PebEditorPoint)
    : { container?: PebElement, bbox?: BBox } {
    const intersects = findBBoxesByPoint(this.tree, dropPoint, elementsToSkip);
    const sorted = sortByInnerElements(intersects);

    let found = sorted.map((container) => {
      const canInsert = canInsertChild(elements[0], container, movingBBox, dropPoint);
      const canMove = canInsert.allowed ? canMoveTo(elements, movingBBox, container) : { allowed: false };
      const allowed = canInsert.allowed && canMove.allowed;

      return allowed ? { container, bbox: canInsert.bbox } : {};
    }).find(res => res.container);

    if (!found?.container) {
      const document = findElementRoot(elements[0]);
      const sections = [...document.children].filter(isSection);
      const totalArea = findTotalArea(sections);
      const isOutPage = !pointIsInsideBBox(dropPoint, totalArea);

      isOutPage && (found = { container: document, bbox: totalArea });
    }

    return found ?? {};
  }

  private isMovable(target: PebElement | PeAnchorType, selected: PebElement[], screen: PebScreen) {
    if (isAnchor(target)) {
      return target.type === PebAnchorType.Move;
    }

    if (selected.some(elm => isSyncEnabled(elm, screen.key))) {
      return false;
    }

    if (selected.some(isReadonly)) {
      return false;
    }

    return ![PebElementType.Document, PebElementType.Section].includes(target.type)
      && selected.some(elm => elm.id === target.id)
      && !isGridElement(target.parent)
      && !(target as any)?.editorEnabled;
  }

  private collectChildren = (elm: PebElement, children: Set<string>) => {
    [...elm.children].forEach((child) => {
      children.add(child.id);
      this.collectChildren(child, children);
    });

    return children;
  };

  private renderMovingControls(
    elements: PebElement[],
    container: PebElement,
    containerBBox: BBox,
    movingBBox: BBox,
  ) {
    const controls: PebControlCommon[] = [];
    const textAnchor = elements.length === 1 && isText(elements[0]);
    const containerColor = container ? PebControlColor.Default : PebControlColor.Invalid;

    controls.push({
      elements,
      anchorType: textAnchor ? PebControlAnchorType.Text : PebControlAnchorType.Default,
      color: isDocument(container) ? PebControlColor.OutPage : containerColor,
      ...movingBBox,
    });

    /** Highlight container */
    if (containerBBox) {
      controls.push({
        elements,
        anchorType: PebControlAnchorType.None,
        color: PebControlColor.Default,
        ...containerBBox,
      });
    }

    /** Highlight grid if is under cursor */
    if (isGridElement(container?.parent)) {
      const gridColor = '#999999';
      controls.push(this.controlsService.createGridControl(container.parent, PebControlColor.Default, gridColor));
    }

    this.controlsService.renderControls(controls);
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

}
