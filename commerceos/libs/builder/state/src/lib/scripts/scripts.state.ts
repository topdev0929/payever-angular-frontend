import { Injectable } from '@angular/core';
import { Action, createSelector, Selector, SelectorOptions, State, StateContext, Store } from '@ngxs/store';
import produce, { produceWithPatches } from 'immer';

import { PebWebsocketAction } from '@pe/builder/actions';
import { PebWebsocketEventType } from '@pe/builder/api';
import { PebScript } from '@pe/builder/core';

import { PebEditorState } from '../editor';

import { PebDeleteScriptsAction, PebResetScriptsAction, PebSetScriptsAction, PebUpdateScriptsAction } from './scripts.actions';


export interface PebScriptsStateModel {
  scripts: { [key: string]: PebScript };
}

const defaultState = {
  scripts: {},
};

@State<PebScriptsStateModel>({
  name: 'scripts',
  defaults: defaultState,
})
@Injectable()
@SelectorOptions({
  suppressErrors: false,
  injectContainerState: false,
})
export class PebScriptsState {

  @Selector()
  static scripts(state: PebScriptsStateModel) {
    return state.scripts;
  }

  static scriptList({ includeDeleted } = { includeDeleted: false }) {
    return createSelector(
      [PebScriptsState.scripts],
      scripts => Object.keys(scripts).map(id => scripts[id]).filter(script => includeDeleted || !script.deleted)
    );
  }

  @Action(PebResetScriptsAction)
  resetScripts(ctx: StateContext<PebScriptsStateModel>) {
    ctx.setState(defaultState);
  }

  @Action(PebSetScriptsAction)
  setScripts(ctx: StateContext<PebScriptsStateModel>, { payload }: PebSetScriptsAction) {
    const scripts = produce({}, draft => payload.forEach(script => draft[script.id] = { delete: false, ...script }));

    ctx.setState({ scripts });
  }

  @Action(PebUpdateScriptsAction)
  updateScripts(ctx: StateContext<PebScriptsStateModel>, { payload }: PebUpdateScriptsAction) {
    this.patchState(ctx, Array.isArray(payload) ? payload : [payload]);
  }

  @Action(PebDeleteScriptsAction)
  deleteScripts(ctx: StateContext<PebScriptsStateModel>, { payload }: PebDeleteScriptsAction) {
    this.patchState(ctx, (Array.isArray(payload) ? payload : [payload]).map(id => ({ id, deleted: true })));
  }

  constructor(
    private readonly store: Store,
  ) {
  }

  patchState(ctx: StateContext<PebScriptsStateModel>, updates: Partial<PebScript>[]) {
    const { scripts } = ctx.getState();
    const versionNumber = this.store.selectSnapshot(PebEditorState.publishedVersion) + 1;
    const themeId = this.store.selectSnapshot(PebEditorState.theme).id;

    const [res, patches, inversePatches] = produceWithPatches({ theme: { [themeId]: { script: ctx.getState().scripts } } }, (draft) => {
      const script = draft.theme[themeId].script;
      updates.forEach((update) => {
        script[update.id] = { ...scripts[update.id], ...update, versionNumber };
      });
    });

    ctx.setState({ scripts: res.theme[themeId].script });
    ctx.dispatch(new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }));
  }
}
