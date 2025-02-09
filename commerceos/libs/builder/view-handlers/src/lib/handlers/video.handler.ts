import { Injectable } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import {
  PebRenderElementModel,
  PebVideoPlayStatus,
  isVideo,
} from '@pe/builder/core';
import {
  PebViewVideoStopAllAction,
  PebViewVideoPlayAction, 
  PebViewVideoPauseAction,
  PebRenderUpdateAction,
  PebViewVideoTogglePlayAction,
  PebViewElementEnteredViewportAction,
} from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewElementService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';

@Injectable()
export class PebViewVideoHandler extends PebViewBaseHandler {
  playVideo$ = this.actions$.pipe(
    ofActionDispatched(PebViewVideoPlayAction),
    tap((action: PebViewVideoPlayAction) => {
      const setTime = action.videoInteraction.reset ? 0 : undefined;
      const elementId = action.videoInteraction.videoELementId ?? action.triggerElement?.id;
      this.playVideo(elementId, setTime);
    }),
  );

  pauseVideo$ = this.actions$.pipe(
    ofActionDispatched(PebViewVideoPauseAction),
    tap((action: PebViewVideoPauseAction) => {
      const setTime = action.videoInteraction.reset ? 0 : undefined;
      const elementId = action.videoInteraction.videoELementId ?? action.triggerElement?.id;
      this.pauseVideo(elementId, setTime);
    }),
  );

  togglePlayVideo$ = this.actions$.pipe(
    ofActionDispatched(PebViewVideoTogglePlayAction),
    tap((action: PebViewVideoTogglePlayAction) => {
      const element = this.elementService.getElementById(action.elementId);
      element?.state?.video?.playStatus !== PebVideoPlayStatus.Playing
        ? this.playVideo(action.elementId)
        : this.pauseVideo(action.elementId);
    }),
  );

  stopVideoAll$ = this.actions$.pipe(
    ofActionDispatched(PebViewVideoStopAllAction),
    tap((action) => {
      const elements = this.store.selectSnapshot(PebViewState.elements);
      this.stopVideoAll(elements, action.rootElementId);
    }),
  );

  autoPlayWhenEnterViewport$ = this.actions$.pipe(
    ofActionDispatched(PebViewElementEnteredViewportAction),
    tap((action: PebViewElementEnteredViewportAction) => {      
      const element = action.element;

      if (isVideo(element.fill) && element.fill.autoplay && !element.state?.video?.playStatus) {
        this.playVideo(element.id);
      }
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly elementService: PebViewElementService,
    private readonly store: Store,
  ) {
    super();
    this.startObserving(
      this.playVideo$,
      this.togglePlayVideo$,
      this.pauseVideo$,
      this.stopVideoAll$,
      this.autoPlayWhenEnterViewport$,
    );
  }

  stopVideoAll(elements: { [id: string]: PebRenderElementModel }, rootElementId: string) {
    if (rootElementId) {
      const rootElement = elements[rootElementId];
      this.pauseVideo(rootElement.id);

      rootElement.children.forEach(elm => this.stopVideoAll(elements, elm.id));
    }
    else {
      Object.values(elements).forEach(elm => this.pauseVideo(elm.id));
    }
  }

  playVideo(elementId: string, setTime?: number | undefined) {
    this.store.dispatch(new PebRenderUpdateAction([
      { id: elementId, state: { video: { playStatus: PebVideoPlayStatus.Playing, setTime } } },
    ]));
  }

  pauseVideo(elementId: string, setTime?: number | undefined) {
    this.store.dispatch(new PebRenderUpdateAction([
      { id: elementId, state: { video: { playStatus: PebVideoPlayStatus.Paused, setTime } } },
    ]));
  }
}
