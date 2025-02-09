import { Injectable } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { take, tap } from 'rxjs/operators';

import {  
  PebViewElementClickedAction,
  PebViewElementMouseLeavedAction,
  PebViewOverlayCloseAction,
  PebViewOverlayOpenAction,
  PebViewOverlaySwapAction,
  PebViewPageLeavingAction,
} from '@pe/builder/view-actions';

import { PebPartialContentService } from '../contracts';
import { PebViewOverlayService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';

@Injectable()
export class PebViewOverlayHandler extends PebViewBaseHandler {
  openOverlay$ = this.actions$.pipe(
    ofActionDispatched(PebViewOverlayOpenAction),
    tap((action: PebViewOverlayOpenAction) => {      
      this.partialContentService.loadContent$(action.interaction.content).pipe(
        tap(() => this.overlayService.openOverlay(action.triggerElement, action.interaction)),
        take(1),
      ).subscribe();      
    }),
  );

  swapOverlay$ = this.actions$.pipe(
    ofActionDispatched(PebViewOverlaySwapAction),
    tap((action: PebViewOverlaySwapAction) => {
      this.partialContentService.loadContent$(action.interaction.content).pipe(
        tap(() => this.overlayService.swapOverlay(action.triggerElement, action.interaction)),
        take(1),
      ).subscribe();
    }),
  );

  closeOverlay$ = this.actions$.pipe(
    ofActionDispatched(PebViewOverlayCloseAction),
    tap((action: PebViewOverlayCloseAction) => {      
      this.overlayService.closeTopOverlay();
    }),
  );

  pageLeaving$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageLeavingAction),
    tap((action: PebViewPageLeavingAction) => {
      this.overlayService.closeAll();
    }),
  );

  mouseLeaved$ = this.actions$.pipe(
    ofActionDispatched(PebViewElementMouseLeavedAction),
    tap((action: PebViewElementMouseLeavedAction) => {
      this.overlayService.mouseLeaved(action.element);
    }),
  );

  elementClicked$ = this.actions$.pipe(
    ofActionDispatched(PebViewElementClickedAction),
    tap((action: PebViewElementClickedAction) => {
      this.overlayService.elementClicked(action.element);
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly overlayService: PebViewOverlayService,
    private readonly partialContentService: PebPartialContentService,
  ) {
    super();
    this.startObserving(
      this.openOverlay$,
      this.swapOverlay$,
      this.closeOverlay$,
      this.pageLeaving$,      
      this.mouseLeaved$,
      this.elementClicked$
    );
  }
}
