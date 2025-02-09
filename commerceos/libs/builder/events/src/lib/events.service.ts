import { Injectable, OnDestroy } from '@angular/core';
import { Select } from '@ngxs/store';
import { animationFrameScheduler, BehaviorSubject, from, fromEvent, merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom,
} from 'rxjs/operators';

import { PebEditorViewport } from '@pe/builder/core';
import { getParents, getBBoxPointer } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebEditorState, PebOptionsState } from '@pe/builder/state';
import { PebDefRTree } from '@pe/builder/tree';

import { CursorType, isAnchor } from './anchors';
import { PebAnchorsService } from './anchors.service';
import { PebEvent, pebEvents, PebEventType, PebMouseEventButton } from './events';


@Injectable()
export class PebEventsService implements OnDestroy {

  @Select(PebOptionsState.scale) private scale$!: Observable<number>;
  @Select(PebEditorState.viewport) viewport$!: Observable<PebEditorViewport>;

  readonly cursor$ = new BehaviorSubject(CursorType.Default);
  readonly contentElement$ = new ReplaySubject<HTMLIFrameElement>(1);

  private readonly dispatch$ = new ReplaySubject<PointerEvent | MouseEvent>(1);
  private readonly destroy$ = new Subject<void>();
  private isCursorLocked = false;

  scroll$: Observable<{ scrollLeft: number, scrollTop: number }> = this.contentElement$.pipe(
    switchMap(iframe => iframe?.contentDocument ?
      fromEvent(iframe.contentDocument.body, 'scroll', { passive: false })
      : of({ target: { scrollLeft: 0, scrollTop: 0 } })),
    throttleTime(0, animationFrameScheduler, { trailing: true }),
    map(({ target }: any) => ({ scrollLeft: target.scrollLeft, scrollTop: target.scrollTop })),
    startWith({ scrollLeft: 0, scrollTop: 0 }),
  );

  events$: Observable<PebEvent> = this.dispatch$.pipe(
    withLatestFrom(this.viewport$, this.scale$, this.scroll$),
    map(([event, viewport, scale, scroll]) => {
      const { x, y } = getBBoxPointer(viewport, scroll, event);
      const { shiftKey, metaKey } = event;
      const type = event.type as keyof typeof pebEvents;
      const bbox = { minX: x, minY: y, maxX: x, maxY: y };
      let [target] = this.anchorService.search(bbox);

      if (!target) {
        const elements = new Map<PebElement, number>(this.tree.search(bbox).map(elm => [elm, getParents(elm).length]));

        if (elements.size) {
          target = [...elements.entries()]
            .sort((a, b) => (b[0].styles.zIndex ?? 0) - (a[0].styles.zIndex ?? 0))
            .sort((a, b) => b[1] - a[1])[0][0] as any;
        }
      }

      return { x, y, shiftKey, metaKey, target, type: pebEvents[type], button: event.button, originalEvent: event };
    }),
    filter(ev => !!ev.target),
    distinctUntilChanged((a, b) => a.type === b.type && a.x === b.x && a.y === b.y),
    tap((ev) => {
      !this.isCursorLocked && this.setCursor(isAnchor(ev.target) ? ev.target.cursor ?? CursorType.Default : CursorType.Default);
    }),
    shareReplay(1),
  );

  mouseWheel$: Observable<WheelEvent> = this.contentElement$.pipe(
    switchMap(iframe => iframe?.contentDocument ?
      fromEvent(iframe.contentDocument.body, 'wheel', { passive: false }) as Observable<WheelEvent>
      : of(undefined)),
    filter((event): event is WheelEvent => !!event),
  );

  keydown$: Observable<KeyboardEvent> = this.contentElement$.pipe(
    filter((iframe): iframe is any => !!iframe?.contentWindow),
    switchMap(iframe => merge(
      fromEvent<KeyboardEvent>(iframe.contentWindow, 'keydown'),
    )),
  );

  constructor(
    private readonly tree: PebDefRTree,
    private readonly anchorService: PebAnchorsService,
  ) {
  }

  setContentElement(iframe: HTMLIFrameElement) {
    this.contentElement$.next(iframe);
    const contentWindow = iframe.contentWindow;

    if (contentWindow) {
      from(Object.keys(pebEvents)).pipe(
        mergeMap((event) => {
          if (event !== PebEventType.mouseleave) {
            return fromEvent<PointerEvent>(contentWindow, event, { passive: false });
          }

          return fromEvent<MouseEvent>(iframe, event, { passive: false });
        }),
        tap((event) => {
          event.button === PebMouseEventButton.Middle && event.preventDefault();
          event.type === PebEventType.dragover && event.preventDefault();
          event.type === PebEventType.drop && event.preventDefault();

          this.dispatch$.next(event);
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  setCursor(cursor: CursorType) {
    cursor !== this.cursor$.value && this.cursor$.next(cursor);
  }

  lockCursor(cursor: CursorType) {
    this.isCursorLocked = true;
    this.setCursor(cursor);
  }

  unlockCursor() {
    this.isCursorLocked = false;
    this.setCursor(CursorType.Default);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
