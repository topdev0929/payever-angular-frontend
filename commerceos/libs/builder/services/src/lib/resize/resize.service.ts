import { Injectable, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BBox } from 'rbush';
import { animationFrameScheduler, BehaviorSubject, merge, Observable, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, filter, map, switchMap, takeUntil, tap, throttleTime, withLatestFrom } from 'rxjs/operators';

import { PebSetRenderPatchModeAction } from '@pe/builder/actions';
import { PebControlsService, PebSetSelectionBBoxAction } from '@pe/builder/controls';
import { isGridLayout, isInlineBlockPosition, isPinnedPosition, PebEditorPatchMode, PebLanguage, PebScreen, PebSnapTransform } from '@pe/builder/core';
import {
  detectSnapLines,
  finalizeWithValue,
  findTotalArea,
  getSnapPoints,
  getScale,
  resizeElement,
  PebResizeDirection,
  getConstrainedBBox,
  paddingBBox,
  isSideDirection,
  findElementSection,
  isFreeMove,
  isSyncEnabled,
  elementInnerSpace,
} from '@pe/builder/editor-utils';
import { isAnchor, isLeftMouseButtonEvent, isMouseDownEvent, PebAnchorType, PebEvent, PebEventsService, PebEventType } from '@pe/builder/events';
import {
  PebElement,
  isSection,
  isDocument,
  isVector,
  isReadonly,
  isText,
} from '@pe/builder/render-utils';
import { PebViewPatchAction } from '@pe/builder/renderer';
import { PebEditorState, PebEditTextModel, PebElementsState, PebOptionsState, PebResizeAction, PebSetSnapLines } from '@pe/builder/state';
import { PebDefRTree } from '@pe/builder/tree';

import { resizeDirection } from './resize';

const resizeAnchors = [
  PebAnchorType.N,
  PebAnchorType.NW,
  PebAnchorType.W,
  PebAnchorType.SW,
  PebAnchorType.S,
  PebAnchorType.SE,
  PebAnchorType.E,
  PebAnchorType.NE,
  PebAnchorType.EW,
  PebAnchorType.NS,
];

@Injectable({ providedIn: 'any' })
export class PebResizeService implements OnDestroy {
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebOptionsState.language) language!: Observable<PebLanguage>;
  @Select(PebEditorState.editText) editText$!: Observable<PebEditTextModel>;

  resizingView$ = new BehaviorSubject({ width: 0, height: 0 });

  private readonly destroy$ = new Subject<void>();

  private readonly elements$ = this.selectedElements$.pipe(
    map(elements => elements.map(elm => ({ ...elm }))),
  );

  private readonly start$ = this.eventsService.events$.pipe(
    withLatestFrom(this.editText$),
    filter(([ev, editText]) =>
      !editText.enabled
      && isMouseDownEvent(ev)
      && isLeftMouseButtonEvent(ev)
      && isAnchor(ev.target)
      && resizeAnchors.includes(ev.target.type)
    ),
    map(([ev]) => ev),
  );

  private readonly stop$ = this.eventsService.events$.pipe(
    filter(ev => ev.type === PebEventType.mouseup),
  );

  readonly resize$: Observable<any> = this.start$.pipe(
    withLatestFrom(this.elements$, this.screen$, this.language),
    filter(([ev, elements, screen, language]) => this.canResize(elements, screen)),
    map(([ev, elements, screen, language]) => {
      const initialBBox = findTotalArea(elements);
      const initialMouse = { x: ev.x, y: ev.y };
      const elementsToSkip = new Set<string>();
      const section = findElementSection(elements[0]);

      this.resizingView$.next(undefined);

      const addSkipRecursive = (elm: PebElement) => {
        elementsToSkip.add(elm.id);
        if (!isSection(elm) && elm.children?.length) {
          [...elm.children].forEach(e => addSkipRecursive(e));
        }
      };
      elements.forEach(elm => addSkipRecursive(elm));

      this.store.dispatch(new PebSetRenderPatchModeAction(PebEditorPatchMode.Resize));

      return {
        direction: resizeDirection(ev),
        elements,
        screen,
        initialBBox,
        initialMouse,
        language,
        section,
        elementsToSkip,
      };
    }),
    switchMap(({ direction, elements, screen, initialBBox, initialMouse, language, section, elementsToSkip }) => this.eventsService.events$.pipe(
      filter(ev => ev.type === PebEventType.mousemove),
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      distinctUntilChanged((a, b) => a.x === b.x && a.y === b.y),
      map((ev) => {
        const dx = ev.x - initialMouse.x;
        const dy = ev.y - initialMouse.y;

        const movingBBox = {
          minX: initialBBox.minX + (direction.w ? dx : 0),
          maxX: initialBBox.maxX + (direction.e ? dx : 0),
          minY: initialBBox.minY + (direction.n ? dy : 0),
          maxY: initialBBox.maxY + (direction.s ? dy : 0),
        };

        return { ev, movingBBox };
      }),
      map(({ ev, movingBBox }) => {
        const snapPoints = getSnapPoints(section, elements);
        const lineOptions = { resize: { top: direction.n, right: direction.e, bottom: direction.s, left: direction.w } };
        const { snapLines, transform } = detectSnapLines(movingBBox, snapPoints, lineOptions);

        const baseAxis = this.getBaseAxis(direction, transform);

        transform && (movingBBox = {
          minX: movingBBox.minX + transform.moveX,
          maxX: movingBBox.maxX + transform.moveX + transform.resizeX,
          minY: movingBBox.minY + transform.moveY,
          maxY: movingBBox.maxY + transform.moveY + transform.resizeY,
        });

        const applyConstrain = this.isApplyConstrain(ev, elements, direction);
        applyConstrain && (movingBBox = getConstrainedBBox(initialBBox, movingBBox, direction, baseAxis));

        if (this.isAutoHeight(elements, direction) && this.resizingView$.value) {
          movingBBox.maxY = movingBBox.minY + this.resizingView$.value.height;
        }

        const hasCollision = !this.isAutoHeight(elements, direction) && this.getCollisions(movingBBox, elementsToSkip).length;
        this.store.dispatch(new PebSetSnapLines(hasCollision ? [] : snapLines));
        const freeMove = elements.every(isFreeMove);


        if (isSection(elements[0])) {
          movingBBox = this.getLimitedBBoxForSection(elements[0], movingBBox, direction);
        } else if (freeMove) {
          movingBBox = movingBBox;
        } else {
          movingBBox = this.getLimitedBBoxForElement(movingBBox, direction, elementsToSkip);
        }

        applyConstrain && (movingBBox = getConstrainedBBox(initialBBox, movingBBox, direction));

        return { ev, movingBBox, baseAxis, snapLines };
      }),
      map(({ ev, movingBBox }) => {
        const viewUpdates = [];
        const resizedElements: PebElement[] = [];

        elements.forEach((elm) => {
          const scale = getScale(elm, initialBBox, movingBBox);
          const res = resizeElement(elm, scale, { scalePercentSizes: true });
          res && viewUpdates.push(...res.viewUpdates) && resizedElements.push(res.resizedElement);
        });
        this.store.dispatch(new PebViewPatchAction(viewUpdates));

        this.renderResizeControls(resizedElements);

        return { elements: resizedElements, initialBBox, movingBBox };
      }),
      takeUntil(this.stop$),
      finalizeWithValue(({ initialBBox, movingBBox }) => {
        this.commitResize(elements, initialBBox, movingBBox);
      }),
    )),
  );

  constructor(
    private readonly eventsService: PebEventsService,
    private readonly store: Store,
    private readonly tree: PebDefRTree,
    private readonly controlsService: PebControlsService,
  ) {
    merge(this.resize$).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err.message);

        return caught;
      })
    ).subscribe();

    this.editText$.pipe(
      tap(({ viewElement }) => this.resizingView$.next(viewElement)),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private commitResize(elements: PebElement[], initialBBox: BBox, movingBBox: BBox) {
    this.store.dispatch([
      new PebSetRenderPatchModeAction(undefined),
      new PebSetSnapLines([]),
      new PebResizeAction(elements, initialBBox, movingBBox),
    ]);
  }

  private renderResizeControls(elements: PebElement[]) {
    const area = findTotalArea(elements);

    this.store.dispatch(new PebSetSelectionBBoxAction({
      left: area.minX,
      top: area.minY,
      right: area.maxX,
      bottom: area.maxY,
    }));

    if (elements.every(elm => isInlineBlockPosition(elm.styles.position))) {
      this.controlsService.renderControls([]);

      return;
    }

    const controls = this.controlsService.createDefaultControlsSet(elements);
    this.controlsService.renderControls(controls);
  }

  private canResize(elements: PebElement[], screen: PebScreen): boolean {
    if (elements.some(isReadonly)) {
      return false;
    }

    return elements.every(elm => !isSyncEnabled(elm, screen.key));
  }

  private getBaseAxis(direction, transform: PebSnapTransform): 'x' | 'y' {
    if (transform?.resizeY) {
      return 'y';
    }
    if (transform?.resizeX || (direction.w || direction.e)) {
      return 'x';
    }

    return 'y';
  }

  private getLimitedBBoxForSection(section: PebElement, movingBBox: BBox, direction: PebResizeDirection): BBox {
    if (isGridLayout(section.styles.layout)) {
      return movingBBox;
    }
    let bbox = { ...movingBBox };
    const children = [...section.children];
    bbox.minY = section.minY;
    bbox.maxY = Math.max(movingBBox.maxY, ...children.map(elm => elm.maxY));

    return bbox;
  }

  private getLimitedBBoxForElement(movingBBox: BBox, direction: PebResizeDirection, elementsToSkip: Set<string>): BBox {
    let bbox = { ...movingBBox };

    if (bbox.minX >= bbox.maxX) {
      bbox.minX = direction.w ? movingBBox.maxX : movingBBox.minX;
      bbox.maxX = direction.e ? movingBBox.minX : movingBBox.maxX;
    }

    if (bbox.minY > bbox.maxY) {
      bbox.minY = direction.n ? movingBBox.maxY : movingBBox.minY;
      bbox.maxY = direction.s ? movingBBox.minY : movingBBox.maxY;
    }

    this.getCollisions(movingBBox, elementsToSkip).forEach((elm) => {
      const x1 = bbox.minX;
      const x2 = bbox.maxX;
      const y1 = bbox.minY;
      const y2 = bbox.maxY;

      const crossedMinX = x1 < elm.minX && x2 > elm.minX;
      const crossedMaxX = x1 < elm.maxX && x2 > elm.maxX;
      const crossedMinY = y1 < elm.minY && y2 > elm.minY;
      const crossedMaxY = y1 < elm.maxY && y2 > elm.maxY;

      direction.e && crossedMinX && (bbox.maxX = Math.min(x2, elm.minX));
      direction.e && crossedMaxX && !crossedMinX && (bbox.maxX = Math.min(x2, elm.maxX));
      direction.w && crossedMinX && !crossedMaxX && (bbox.minX = Math.max(x1, elm.minX));
      direction.w && crossedMaxX && (bbox.minX = Math.max(x1, elm.maxX));

      if (this.getCollisions(bbox, elementsToSkip).length) {
        direction.n && crossedMinY && !crossedMaxY && (bbox.minY = Math.max(y1, elm.minY));
        direction.n && crossedMaxY && (bbox.minY = Math.max(y1, elm.maxY));

        direction.s && crossedMinY && (bbox.maxY = Math.min(y2, elm.minY));
        direction.s && crossedMaxY && !crossedMinY && direction.s && (bbox.maxY = Math.min(y2, elm.maxY));
      }
    });

    return bbox;
  }

  private getCollisions(bbox: BBox, elementsToSkip: Set<string>): PebElement[] {
    return this.tree.search({
      minX: bbox.minX + 1,
      maxX: bbox.maxX - 1,
      minY: bbox.minY + 1,
      maxY: bbox.maxY - 1,
    }).filter((elm) => {
      if (isPinnedPosition(elm.styles?.position)) {
        return false;
      }

      const paddingBBox = elementInnerSpace(elm);
      const isInside = bbox.minX >= paddingBBox.minX
        && bbox.maxX <= paddingBBox.maxX
        && bbox.minY >= paddingBBox.minY
        && bbox.maxY <= paddingBBox.maxY;

      return !isInside && !elementsToSkip.has(elm.id) && !isDocument(elm);
    }).map(elm => ({ ...elm, ...paddingBBox(elm, elm.styles.padding) }));
  }

  private isApplyConstrain(ev: PebEvent, elements: PebElement[], direction: PebResizeDirection): boolean {
    if (this.isAutoHeight(elements, direction)) {
      return false;
    }

    if (elements.some(elm => isVector(elm))) {
      return true;
    }

    if (ev.shiftKey) {
      return true;
    }

    if (elements.every(elm => elm.data?.constrainProportions)) {
      return true;
    }

    if (elements.length > 1 && !isSideDirection(direction)) {
      return true;
    }

    return false;
  }

  private isAutoHeight(elements: PebElement[], direction: PebResizeDirection): boolean {
    if (elements.length === 1 && isText(elements[0]) && (direction.w || direction.e)) {
      return true;
    }

    return false;
  }
}
