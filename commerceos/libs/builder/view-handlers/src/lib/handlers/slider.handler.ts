import { Injectable } from '@angular/core';
import { Actions, Select, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, take, tap, throttleTime } from 'rxjs/operators';

import { PebContainerType, PebScreen } from '@pe/builder/core';
import {
  PebViewSliderLoadAction,
  PebViewSliderChangeAction,
  PebViewPageRenderingAction,
  PebViewSliderUnloadAction,
  PebViewSliderPlayAction,
  PebViewSliderPauseAction,
  PebViewSliderTogglePlayAction,
  PebViewPageLeavingAction,
} from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebPartialContentService } from '../contracts';
import { PebViewSliderService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewSliderHandler extends PebViewBaseHandler {
  @Select(PebViewState.screen) private readonly screen$!: Observable<PebScreen>;

  pageRendering$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageRenderingAction),
    tap((action: PebViewPageRenderingAction) => {
      this.slidesService.clearAll();
    }),
  );

  loadSlides$ = this.actions$.pipe(
    ofActionDispatched(PebViewSliderLoadAction),
    tap((action: PebViewSliderLoadAction) => {
      if (action.triggerElement.container?.key === PebContainerType.Editor) {
        return;
      }
      const { interaction, triggerElement } = action;

      const placeholderElementId = interaction.placeholder?.elementId
        ? interaction.placeholder?.elementId
        : triggerElement.id;

      this.partialContentService.loadContent$(action.interaction.content).pipe(
        tap((element) => {
          element && this.slidesService.loadSlides(placeholderElementId, element.id, interaction);
        }),
        take(1),
      ).subscribe();
    })
  );

  unloadSlides$ = this.actions$.pipe(
    ofActionDispatched(PebViewSliderUnloadAction),
    tap((action: PebViewSliderUnloadAction) => {
      if (action.triggerElement.container?.key === PebContainerType.Editor) {
        return;
      }
      const { interaction, triggerElement } = action;

      const placeholderElementId = interaction.placeholder?.elementId
        ? interaction.placeholder?.elementId
        : triggerElement.id;

      this.slidesService.unloadSlides(placeholderElementId);
    }),
  );

  slideChange$ = this.actions$.pipe(
    ofActionDispatched(PebViewSliderChangeAction),
    tap((action: PebViewSliderChangeAction) => {
      this.slidesService.changeSlide(action.interaction);
    }),
  );

  playSlider$ = this.actions$.pipe(
    ofActionDispatched(PebViewSliderPlayAction),
    tap((action: PebViewSliderPlayAction) => {
      this.slidesService.playSlider(action.interaction);
    }),
  );

  pauseSlider$ = this.actions$.pipe(
    ofActionDispatched(PebViewSliderPauseAction),
    tap((action: PebViewSliderPauseAction) => {
      this.slidesService.pauseSlider(action.interaction);
    }),
  );

  togglePlaySlider$ = this.actions$.pipe(
    ofActionDispatched(PebViewSliderTogglePlayAction),
    tap((action: PebViewSliderTogglePlayAction) => {
      this.slidesService.togglePlaySlider(action.interaction);
    }),
  );

  screenChanged$ = this.screen$.pipe(
    throttleTime(0),
    distinctUntilChanged((a, b) => a.key === b.key),
    filter(screen => !!screen),
    tap((screen) => {
      this.slidesService.reloadAll();
    }),
  );

  pageLeaving$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageLeavingAction),
    tap((action: PebViewPageLeavingAction) => {
      this.slidesService.clearAll();
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly slidesService: PebViewSliderService,
    private readonly partialContentService: PebPartialContentService,
  ) {
    super();
    this.startObserving(
      this.pageRendering$,
      this.loadSlides$,
      this.unloadSlides$,
      this.slideChange$,
      this.playSlider$,
      this.pauseSlider$,
      this.togglePlaySlider$,
      this.screenChanged$,
    );
  }
}
