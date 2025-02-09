import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import produce from 'immer';

import {
  InitLoadFolders,
  AddItem,
  EditItem,
  OpenFolder,
  DeleteItems,
  ClearStore,
  SortStore,
  GroupStore,
  AddItems,
  AddFolder,
  AddStudioMedia,
  PopupMode,
  ClearStudioMedia,
} from './folders.actions';



@State<any>({
  name: 'appStudioMedia',
  defaults: { folders: [], gridItems: [], studioMedia: [], studioMediaItem: null, trigger: false },
})

@Injectable()
export class StudioAppState {

  @Selector()
  static folders(state: any) {
    return state.folders;
  }

  @Selector()
  static studioMedia(state: any) {
    return state.studioMedia;
  }

  @Selector()
  static popupMode(state: any) {
    return state.trigger;
  }

  @Selector()
  static gridItems(state: any) {
    return state.gridItems;
  }

  @Selector()
  static studioMediaItem(state: any) {
    return state.studioMediaItem;
  }

  @Action(PopupMode)
  popupMode({ patchState, getState }: StateContext<any>, { trigger }: PopupMode) {
    const state = produce(getState(), (draft) => {
      draft.trigger = trigger;
    });
    patchState(state);
  }

  @Action(InitLoadFolders)
  loadAlbums({ patchState, getState }: StateContext<any>, { data, group }: any) {
    const state = produce(getState(), (draft) => {
      draft.folders = data.tree;
    });
    patchState(state);
  }

  @Action(OpenFolder)
  openFolder({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = items;
    });
    patchState(state);

  }

  @Action(GroupStore)
  GroupItems({ patchState, getState }: StateContext<any>, { order, group }: GroupStore) {

    const state = produce(getState(), (draft) => {
      draft.gridItems = [...draft.gridItems];
    });
    patchState(state);
  }

  sortItemsFunc(gridItems: any[], group: boolean, order: string = 'desc'){
    const sortWithGrouping = (a: any, b: any) => {
      return !!a.data?.isFolder < !!b.data?.isFolder ? 1 : -1;
    }
    const sortWithOutGrouping = (a: any, b: any) => {
      if (order === 'asc') {
        return a.title < b.title ? 1 : -1;
      } else {
        return a.title > b.title ? 1 : -1;
      }
    }

    if (group) {
      gridItems = gridItems.sort(sortWithGrouping);
    } else {
      gridItems = gridItems.sort(sortWithOutGrouping);
    }

    return gridItems;
  }

  @Action(SortStore)
  SortItems({ patchState, getState }: StateContext<any>, { group }: SortStore) {

    const state = produce(getState(), (draft) => {
      draft.gridItems = this.sortItemsFunc(draft.gridItems, group);
    });
    patchState(state);
  }

  @Action(DeleteItems)
  deleteItems({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = draft.gridItems.filter(i => !items.includes(i.id));
    });
    patchState(state);

  }

  @Action(ClearStore)
  clearStore({ patchState, getState }: StateContext<any>, { items }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [];
      draft.folders = [];
    });
    patchState(state);

  }

  @Action(AddItem)
  addItem({ patchState, getState }: StateContext<any>, { item }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [...draft.gridItems, item];
    });
    patchState(state);
  }

  @Action(AddFolder)
  addFolder({ patchState, getState }: StateContext<any>, { item }: any) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [item, ...draft.gridItems];
    });
    patchState(state);
  }

  @Action(AddItems)
  addItems({ patchState, getState }: StateContext<any>, { items }: AddItems) {
    const state = produce(getState(), (draft) => {
      draft.gridItems = [...draft.gridItems, ...items];
    });
    patchState(state);
  }

  @Action(ClearStudioMedia)
  clearStudioMedia({ patchState, getState }: StateContext<any>) {
    const state = produce(getState(), (draft) => {
      draft.studioMediaItem = null;
    });
    patchState(state);
  }

  @Action(AddStudioMedia)
  addStudioMedia({ patchState, getState }: StateContext<any>, { items }: AddStudioMedia) {
    if (Array.isArray(items) && items.length === 0) {
      return;
    }

    const state = produce(getState(), (draft) => {
      draft.studioMediaItem = items;
    });

    patchState(state);
  }

  @Action(EditItem)
  EditItem({ setState }: StateContext<any>, { item }: any) {
    setState(
      produce((draft) => {
        const index = draft.gridItems.findIndex(i => i.id === item.id);
        if (index !== -1) {
          draft.gridItems[index] = item;
        }
      })
    );}
}
