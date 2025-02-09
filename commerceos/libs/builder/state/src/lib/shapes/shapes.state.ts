import { Injectable } from '@angular/core';
import { Action, Selector, SelectorOptions, State, StateContext } from '@ngxs/store';

import { PebShape, PebShapeAlbum } from '@pe/builder/core';

import { PebResetShapesAction, PebSelectShapeAlbumAction, PebSetShapeAlbumsAction, PebSetShapesAction } from './shapes.actions';


export interface PebShapesStateModel {
  shapes: PebShape[];
  albums: PebShapeAlbum[];
  selectedShapeAlbum: string,
}

const defaultShapesState = {
  shapes: [],
  albums: [],
  selectedShapeAlbum: null,
};

@State<PebShapesStateModel>({
  name: 'shapes',
  defaults: defaultShapesState,
})
@Injectable()
@SelectorOptions({
  suppressErrors: false,
  injectContainerState: false,
})
export class PebShapesState{
  @Selector()
  static shapes(state: PebShapesStateModel): PebShape[] {
    return state.shapes;
  }

  @Selector()
  static albums(state: PebShapesStateModel): PebShapeAlbum[] {
    return state.albums;
  }

  @Selector()
  static selectedAlbum(state: PebShapesStateModel): string {
    return state.selectedShapeAlbum;
  }

  @Action(PebSetShapeAlbumsAction)
  setShapeAlbums(ctx: StateContext<PebShapesStateModel>, { payload }: PebSetShapeAlbumsAction) {
    ctx.patchState({ albums: payload });
  }

  @Action(PebSetShapesAction)
  setShapes(ctx: StateContext<PebShapesStateModel>, { payload }: PebSetShapesAction) {
    ctx.patchState({ shapes: payload });
  }

  @Action(PebSelectShapeAlbumAction)
  selectShapeAlbum(ctx: StateContext<PebShapesStateModel>, { id }: PebSelectShapeAlbumAction) {
    ctx.patchState({ selectedShapeAlbum: id });
  }

  @Action(PebResetShapesAction)
  resetShapes(ctx: StateContext<PebShapesStateModel>) {
    ctx.setState(defaultShapesState);
  }
}
