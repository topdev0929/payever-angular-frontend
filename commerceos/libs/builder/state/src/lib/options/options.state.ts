import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { PebDefaultLanguages, PebDefaultScreens, PebLanguage, PebScreen, PebScreenEnum } from '@pe/builder/core';

import {
  PebSetLanguageAction,
  PebSetOptionsAction,
  PebSetScreenAction,
} from './options.actions';

export class PebOptionsStateModel {
  screen: PebScreen;
  scale: number;
  scaleToFit: boolean;
  scrollLeft: number;
  scrollTop: number;
  language: PebLanguage;
}

@State<PebOptionsStateModel>({
  name: 'optionsState',
  defaults: {
    screen: PebDefaultScreens[PebScreenEnum.Desktop],
    scale: 1,
    scrollLeft: 0,
    scrollTop: 0,
    scaleToFit: false,
    language: PebDefaultLanguages.en,
  },
})
@Injectable({ providedIn: 'any' })
export class PebOptionsState {

  @Selector()
  static language(state: PebOptionsStateModel): PebLanguage {
    return state.language;
  }

  @Selector()
  static options(state: PebOptionsStateModel): PebOptionsStateModel {
    return state;
  }

  @Selector()
  static scale(state: PebOptionsStateModel): number {
    return state.scale;
  }

  @Selector()
  static scaleToFit(state: PebOptionsStateModel): boolean {
    return state.scaleToFit;
  }

  @Selector()
  static screen(state: PebOptionsStateModel): PebScreen {
    return state.screen;
  }

  @Action(PebSetOptionsAction)
  setOptions({ patchState }: StateContext<PebOptionsStateModel>, { payload }: PebSetOptionsAction) {
    patchState(payload);
  }

  @Action(PebSetLanguageAction)
  setLanguage({ patchState }: StateContext<PebOptionsStateModel>, { payload }: PebSetLanguageAction) {
    patchState({ language: payload });
  }

  @Action(PebSetScreenAction)
  setScreen({ patchState }: StateContext<PebOptionsStateModel>, { payload }: PebSetScreenAction) {
    patchState({ screen: payload });
  }
}
