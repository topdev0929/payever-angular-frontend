import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import produce from 'immer';

import { PebElementDef } from '@pe/builder/core';

import { PebSetClipboardElements } from './clipboard.actions';


export class PebClipboardStateModel {
  elements: PebElementDef[];
}

@State<PebClipboardStateModel>({
  name: 'clipboardState',
  defaults: {
    elements: [],
  },
})
@Injectable({ providedIn: 'any' })
export class PebClipboardState {

  @Selector()
  static elements(state: PebClipboardStateModel): PebElementDef[] {
    return state.elements;
  }

  @Action(PebSetClipboardElements)
  setElements({ patchState }: StateContext<PebClipboardStateModel>, { payload }: PebSetClipboardElements) {
    const elements = produce(payload, draft => draft);

    patchState({ elements });
  }

  constructor(
    private readonly store: Store,
  ) {
  }
}
