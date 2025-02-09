import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { PebSetInspectorAction } from './inspector.actions';


export enum PebMainTab {
  Format = 'format',
  Animate = 'animate',
  Page = 'page',
}

export enum PebSecondaryTab {
  Section = 'section',

  Style = 'style',
  Text = 'text',
  Image = 'image',
  Video = 'video',
  Arrange = 'arrange',

  Preset = 'preset',
  Color = 'color',
  Gradient = 'gradient',
  Media = 'media',

  General = 'general',
  Advanced = 'advanced',
}

export interface PebInspectorStateModel {
  mainTab: PebMainTab;
  secondaryTab: PebSecondaryTab;
  isDetail: boolean;
}

@State<PebInspectorStateModel>({
  name: 'inspectorState',
  defaults: {
    mainTab: PebMainTab.Format,
    secondaryTab: PebSecondaryTab.Style,
    isDetail: false,
  },
})
@Injectable({ providedIn: 'any' })
export class PebInspectorState {

  @Selector()
  static inspector(state: PebInspectorStateModel) {
    return state;
  }

  @Action(PebSetInspectorAction)
  setSidebarInspector({ getState, patchState }: StateContext<PebInspectorStateModel>, { payload }: PebSetInspectorAction) {
    patchState({ ...getState(), ...payload });
  }

}
