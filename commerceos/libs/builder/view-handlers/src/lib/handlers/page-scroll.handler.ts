import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import {  
  PebContainerType,
  PebElementType,
  PebRenderElementModel,
  PebViewElementEventType,
  isIframe,
  isVideo,
} from '@pe/builder/core';
import { isSection } from '@pe/builder/render-utils';
import {
  PebViewElementInitAction,
  PebViewElementEnteredViewportAction,
  PebViewPageLeavingAction,
  PebViewPageScrollAction,
  PebViewPageScrollReadyAction,
  PebViewElementScrollIntoViewAction,
  PebViewElementExitedViewportAction,
  PebViewSetFocusedSectionAction,
  PebViewElementScrollToTopAction,
} from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewElementService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewPageScrollHandler extends PebViewBaseHandler {
  @Select(PebViewState.elements) elements$!: Observable<{ [id: string]: PebRenderElementModel }>;

  private pageScrollHandlers = new Map<string, () => void>();
  private intersections: { [elementId: string]: IntersectionModel } = {};
  private focusedSectionId: string | undefined = undefined;
  private anchors: { [name: string]: HTMLElement } = {};

  initScrollListeners$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageScrollReadyAction),
    tap((action: PebViewPageScrollReadyAction) => {
      this.startPageScrollListener(action.rootElement, action.containerKey);
    }),
  );

  watchViewPort$ = this.actions$.pipe(
    ofActionDispatched(PebViewElementInitAction),
    withLatestFrom(this.elements$),
    tap(([action, elements]: [PebViewElementInitAction, any]) => {
      const { element, htmlElement } = action;
      element.name && (this.anchors[element.name] = htmlElement);
      this.watchEnterExitViewport(element, htmlElement, Object.values(elements));
    }),
  );

  scrollIntoView$ = this.actions$.pipe(
    ofActionDispatched(PebViewElementScrollIntoViewAction),
    tap((action: PebViewElementScrollIntoViewAction) => {
      if (!action.element.name) {
        return;
      }

      const htmlElement = this.anchors[action.element.name];
      htmlElement && htmlElement.scrollIntoView({ behavior: 'smooth' });
    }),
  );

  scrollToTop$ = this.actions$.pipe(
    ofActionDispatched(PebViewElementScrollToTopAction),
    tap(() => { this.scrollToTop(); }),
  );

  pageLeaving$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageLeavingAction),
    tap((action: PebViewPageLeavingAction) => {
      this.clearAll();
    }),
  );

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly elementService: PebViewElementService,
  ) {
    super();
    this.startObserving(
      this.initScrollListeners$,
      this.watchViewPort$,
      this.scrollIntoView$,
      this.scrollToTop$,
      this.pageLeaving$,
    );
  }

  startPageScrollListener(htmlElement: HTMLElement, containerKey: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const target = containerKey === PebContainerType.Client ? window : htmlElement;
    let handler = this.pageScrollHandlers.get(containerKey);
    handler && target.removeEventListener('scroll', handler);

    handler = () => {
      const { scrollTop, clientHeight, scrollHeight } = htmlElement;

      const height = scrollHeight - clientHeight;
      const top = Math.min(scrollTop, height);

      this.store.dispatch(new PebViewPageScrollAction({ top, height }));
    };

    this.pageScrollHandlers.set(containerKey, handler);
    target.addEventListener('scroll', handler);
    handler();
  }

  watchEnterExitViewport(
    element: PebRenderElementModel,
    htmlElement: HTMLElement,
    elements: PebRenderElementModel[],
  ): void {
    if (!element || element.container?.key === PebContainerType.Editor) {
      return;
    }

    if (!this.shouldWatchViewportIntersection(element, elements)) {
      return;
    }

    let observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      const intersection = this.intersections[element.id];
      if (!intersection) {
        return;
      }

      const isInViewport = entry.isIntersecting;
      const stateChanged = intersection.isInViewport !== isInViewport;
      intersection.isInViewport = isInViewport;
      intersection.intersectionRatio = entry.intersectionRatio;
      intersection.intersectionRectHeight = entry.intersectionRect.height;

      this.selectFocusedSection();

      if (!stateChanged) {
        return;
      }

      const elm = this.elementService.getElementById(element.id);
      if (elm) {
        intersection.isInViewport
          ? this.store.dispatch(new PebViewElementEnteredViewportAction(elm))
          : this.store.dispatch(new PebViewElementExitedViewportAction(elm));
      }
    }, { threshold: [0, 0.1, 0.2, 0.5, 0.7, 0.9, 1] });

    this.intersections[element.id] = {
      elementId: element.id,
      elementType: element.type,
      intersectionRatio: 0,
      intersectionRectHeight: 0,
      observer,
      isInViewport: false,
    };

    observer.observe(htmlElement);
  }

  shouldWatchViewportIntersection(element: PebRenderElementModel, elements: PebRenderElementModel[]): boolean {
    if (isSection(element)) {
      return true;
    }

    if (isVideo(element.fill) && element.fill.autoplay) {
      return true;
    }

    if (isIframe(element.fill)) {
      return true;
    }

    const hasViewportAnimation = Object.values(element.animations ?? {})
      .some((anim: any) => anim.trigger === PebViewElementEventType.ViewportEnter);
    if (hasViewportAnimation) {
      return true;
    }

    const hasViewportTrigger =
      Object.values(element.interactions ?? {}).some(integration =>
        integration.trigger === PebViewElementEventType.ViewportEnter
        || integration.trigger === PebViewElementEventType.ViewportExit
      );
    if (hasViewportTrigger) {
      return true;
    }

    return false;
  }

  private selectFocusedSection() {
    const sections = Object.values(this.intersections).filter(
      item => item.isInViewport && item.elementType === PebElementType.Section
    );
    sections.sort((a, b) => b.intersectionRectHeight - a.intersectionRectHeight);

    const focusedSectionId = sections[0]?.elementId;

    if (this.focusedSectionId === focusedSectionId) {
      return;
    }

    this.focusedSectionId = focusedSectionId;
    this.store.dispatch(new PebViewSetFocusedSectionAction(focusedSectionId));
  }

  private clearAll() {
    if (this.intersections) {
      Object.values(this.intersections).forEach(item => item.observer.disconnect());      
    }
    this.intersections = {};
  }

  private scrollToTop(): void {
    window && window.scroll(0, 0);
  }
}

interface IntersectionModel {
  elementId: string;
  elementType: PebElementType | undefined;
  observer: IntersectionObserver;
  intersectionRatio: number;
  intersectionRectHeight: number;
  isInViewport: boolean;
}