import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { PebInspectorState } from './inspector/inspector.state';
import { PebSetSidebarsAction } from './sidebars.actions';


export interface PebSidebarsStateModel {
  left: boolean;
  navigator: boolean;
  inspector: boolean;
  layers: boolean;
  masterPages: boolean;
}


@State<PebSidebarsStateModel>({
  name: 'sidebarsState',
  defaults: {
    left: true,
    navigator: true,
    inspector: true,
    layers: false,
    masterPages: false,
  },
  children: [
    PebInspectorState,
  ],
})
@Injectable({ providedIn: 'any' })
export class PebSidebarsState {

  @Selector()
  static sidebars(state: PebSidebarsStateModel) {
    return state;
  }

  @Action(PebSetSidebarsAction)
  setSidebars({ patchState }: StateContext<PebSidebarsStateModel>, { payload }: PebSetSidebarsAction) {
    patchState(payload);
  }
}
