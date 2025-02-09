import { Injectable } from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { Observable, animationFrameScheduler, merge } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import {
  PebEditorViewport,
  PebScreen,
  PEB_EDITOR_MAX_ZOOM,
  PEB_EDITOR_MIN_ZOOM,
} from '@pe/builder/core';
import {
  calculateViewPort,
  getBBoxPointer,
  calculateMountScroll,
  moveContentCenter,
  scaleViewport,
  bboxDimension,
  bboxCenter,
  calculateViewPortByArea,
  screenBBox,
} from '@pe/builder/editor-utils';
import {
  CursorType,
  PebEventsService,
  isMouseDownEvent,
  isMiddleMouseButtonEvent,
  isMouseMoveEvent,
  isMouseUpEvent,
} from '@pe/builder/events';
import { isDocument, PebElement } from '@pe/builder/render-utils';
import {
  PebEditorState,
  PebElementsState,
  PebOptionsState,
  PebSetOptionsAction,
  PebSetScaleAction,
  PebSetViewport,
} from '@pe/builder/state';
import { PebDefRTree } from '@pe/builder/tree';
import { PeDestroyService } from '@pe/common';

const WHEEL_SCALE_RATIO = 0.0025;
const WHEEL_THROTTLE_TIME = 5;
const IFRAME_UPDATE_DEBOUNCE_TIME = 500;

@Injectable()
export class PebViewportHandler {
  @Select(PebOptionsState.scale) currentScale$!: Observable<number>;
  @Select(PebElementsState.visibleElements) private readonly elements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebOptionsState.scale) scale$!: Observable<number>;
  @Select(PebEditorState.viewport) viewport$!: Observable<PebEditorViewport>;

  private iframe: HTMLIFrameElement = undefined;

  private initialViewport$ = this.screen$.pipe(
    withLatestFrom(this.scale$, this.viewport$),
    filter(() => !!this.iframe?.contentDocument),
    tap(([screen, scale, viewport]) => {
      const { clientHeight, clientWidth } = this.iframe.contentDocument.body;

      const area = screenBBox(screen);
      let newViewport = calculateViewPortByArea(area, area, scale, { width: clientWidth, height: clientHeight });

      if (viewport?.width) {
        this.store.dispatch(new PebSetViewport({ ...viewport, page: newViewport.page }));
      } else {
        this.mountInitialScroll(newViewport);
        this.store.dispatch(new PebSetViewport(newViewport));
      }
    }),
  );

  private mountViewport$ = this.elements$.pipe(
    withLatestFrom(this.scale$, this.viewport$,),
    filter(([elements]) => elements?.length && !!this.iframe?.contentDocument),
    map(([elements, scale, viewport]) => {
      const { clientHeight, clientWidth } = this.iframe.contentDocument.body;
      const document = elements.find(isDocument);
      const rootElements = elements.filter(elm => elm.parent?.id === document.id);

      let newViewport = calculateViewPort(rootElements, scale, { width: clientWidth, height: clientHeight });
      newViewport = moveContentCenter(newViewport);

      const dimChanged = newViewport.width !== viewport.width || newViewport.height !== viewport.height;

      if (viewport.width === 0) {
        this.mountInitialScroll(newViewport);
        this.persistScroll();
      } else if (dimChanged) {
        this.mountScroll(viewport, newViewport);
        this.persistScroll();
      } else {
        const { scrollLeft, scrollTop } = this.store.selectSnapshot(PebOptionsState);
        this.setScroll({ scrollLeft, scrollTop });
      }

      this.store.dispatch(new PebSetViewport(newViewport));

    }),
    takeUntil(this.destroy$),
  )

  private pan$ = this.eventsService.events$.pipe(
    filter(ev => isMouseDownEvent(ev) && isMiddleMouseButtonEvent(ev)),
    tap(() => {
      this.eventsService.lockCursor(CursorType.Grabbing);
    }),
    map(ev => ({
      screenX: ev.originalEvent.screenX,
      screenY: ev.originalEvent.screenY,
      ...this.getScroll(),
    })),
    switchMap(initial => this.mousemove$.pipe(
      tap((ev) => {
        const scrollLeft = initial.scrollLeft + initial.screenX - ev.originalEvent.screenX;
        const scrollTop = initial.scrollTop + initial.screenY - ev.originalEvent.screenY;
        this.iframe.contentDocument.body.scrollLeft = scrollLeft;
        this.iframe.contentDocument.body.scrollTop = scrollTop;

        this.persistScroll();
      }),
      takeUntil(this.mouseup$),
      finalize(() => {
        this.eventsService.unlockCursor();
      }),
    )),
    takeUntil(this.destroy$),
  );

  private scroll$ = this.eventsService.mouseWheel$.pipe(
    filter(event => !event.metaKey && !event.ctrlKey),
    debounceTime(IFRAME_UPDATE_DEBOUNCE_TIME),
    tap(() => this.persistScroll()),
  );

  private zoom$ = this.eventsService.mouseWheel$.pipe(
    filter(event => (event.metaKey || event.ctrlKey) && !event.shiftKey),
    tap(event => event.preventDefault()),
    throttleTime(WHEEL_THROTTLE_TIME),
    withLatestFrom(this.viewport$, this.scale$),
    tap(([event, viewport]) => {
      event.preventDefault();

      let scale = viewport.scale - viewport.scale * event.deltaY * WHEEL_SCALE_RATIO;
      scale = Math.max(PEB_EDITOR_MIN_ZOOM, Math.min(PEB_EDITOR_MAX_ZOOM, scale));
      const scaledViewport = scaleViewport(viewport, scale);

      this.store.dispatch(new PebSetViewport(scaledViewport));
      this.store.dispatch(new PebSetOptionsAction({ scale, scaleToFit: false }));

      this.mountScroll(viewport, scaledViewport, event);
      this.persistScroll();
    }),
    takeUntil(this.destroy$),
  );

  private setScale$ = this.actions$.pipe(
    ofActionDispatched(PebSetScaleAction),
    withLatestFrom(this.viewport$),
    tap(([action, viewport]: [PebSetScaleAction, PebEditorViewport]) => {
      let { scaleToFit = false, scale = 1 } = action.payload;

      if (scaleToFit) {
        const dim = bboxDimension(viewport.totalArea);

        scale = Math.min(
          viewport.containerWidth / dim.width,
          viewport.containerHeight / dim.height,
        );
      }

      scale = Math.max(PEB_EDITOR_MIN_ZOOM, Math.min(PEB_EDITOR_MAX_ZOOM, scale));
      const newViewport = moveContentCenter(scaleViewport(viewport, scale));

      this.store.dispatch(new PebSetOptionsAction({ scale, scaleToFit }));
      this.store.dispatch(new PebSetViewport(newViewport));

      this.mountScrollCenter(newViewport);
      this.persistScroll();
    }),
    takeUntil(this.destroy$),
  );

  private mousemove$ = this.eventsService.events$.pipe(
    filter(ev => isMouseMoveEvent(ev)),
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    takeUntil(this.destroy$),
  );

  private mouseup$ = this.eventsService.events$.pipe(
    filter(isMouseUpEvent),
    takeUntil(this.destroy$),
  );


  constructor(
    private readonly eventsService: PebEventsService,
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly destroy$: PeDestroyService,
    private readonly rTree: PebDefRTree,
  ) {
    this.eventsService.contentElement$.pipe(
      filter(elm => !!elm?.contentDocument),
      debounceTime(IFRAME_UPDATE_DEBOUNCE_TIME),
      switchMap((iframe) => {
        this.iframe = iframe;

        return merge(
          this.initialViewport$,
          this.mountViewport$,
          this.pan$,
          this.scroll$,
          this.zoom$,
          this.setScale$,
        );
      }),
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  private mountScroll(
    oldViewport: PebEditorViewport,
    newViewport: PebEditorViewport,
    clientPoint: { clientX: number, clientY: number } = { clientX: 0, clientY: 0 },
  ) {
    const bboxPoint = getBBoxPointer(oldViewport, this.getScroll(), clientPoint);
    const scroll = calculateMountScroll(newViewport, bboxPoint, clientPoint);
    this.setScroll(scroll);
  }

  private mountScrollCenter(newViewport: PebEditorViewport) {
    const clientPoint = { clientX: newViewport.containerWidth / 2, clientY: 0 };
    const bboxPoint = { x: bboxCenter(newViewport.totalArea).x, y: 0 };
    const scroll = calculateMountScroll(newViewport, bboxPoint, clientPoint);
    this.setScroll(scroll);
  }

  private mountInitialScroll(viewport: PebEditorViewport) {
    const scroll = calculateMountScroll(viewport, { x: 0, y: 0 }, { clientX: 25, clientY: 25 });
    this.setScroll(scroll);
  }

  private setScroll(scroll: { scrollLeft: number, scrollTop: number }) {
    const body = this.iframe.contentDocument.body;

    const bodyObserver = new ResizeObserver(() => {
      if (scroll.scrollLeft < body.scrollWidth && scroll.scrollTop < body.scrollHeight) {
        body.scrollLeft = scroll.scrollLeft;
        body.scrollTop = scroll.scrollTop;
        this.persistScroll();

        bodyObserver.unobserve(body);
      }
    });
    bodyObserver.observe(body);
  }

  private getScroll(): { scrollLeft: number, scrollTop: number } {
    const { scrollLeft, scrollTop } = this.iframe.contentDocument.body;

    return { scrollLeft, scrollTop };
  }

  private persistScroll() {
    const scrollLeft = this.iframe.contentDocument.body.scrollLeft;
    const scrollTop = this.iframe.contentDocument.body.scrollTop;

    this.store.dispatch(new PebSetOptionsAction({ scrollLeft, scrollTop }));
  }
}
