import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { PebIntegrationApiCachedDataAddAction, PebIntegrationApiCachedDataClearAllAction, PebMap } from '@pe/builder/core';

import { PebIntegrationStateModel } from '../interfaces';

const defaultState: PebIntegrationStateModel = {
  apiCachedData: {},
};

@State<PebIntegrationStateModel>({ name: 'integration', defaults: defaultState })
@Injectable()
export class PebIntegrationState {
  @Selector()
  static apiCachedData(state: PebIntegrationStateModel): PebMap<any> {
    return state.apiCachedData ?? {};
  }

  @Action(PebIntegrationApiCachedDataAddAction)
  addCachedData(state: StateContext<PebIntegrationStateModel>, action: PebIntegrationApiCachedDataAddAction) {
    if (!action.data) {
      return;
    }

    const apiCachedData = state.getState().apiCachedData;
    Object.entries(action.data).forEach(([key, val]: [string, any]) => apiCachedData[key] = val);
    state.patchState({ apiCachedData });
  }

  @Action(PebIntegrationApiCachedDataClearAllAction)
  clearCachedData(state: StateContext<PebIntegrationStateModel>) {
    state.patchState({ apiCachedData: {} });
  }

}