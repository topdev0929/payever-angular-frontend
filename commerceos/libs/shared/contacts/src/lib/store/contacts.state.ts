import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import produce from 'immer';

import { ContactsAppStateInterface } from '../interface';

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
  AddContacts,
  PopupMode,
  ClearContacts,
  SetStatuses,
  UpdateStatuesItem,
  AddToStatuses,
  DeleteFromStatuses,
} from './contacts.actions';



@State<ContactsAppStateInterface>({
  name: 'appContacts',
  defaults: { folders: [], gridItems: [], contacts: [], contactIndustries: [], trigger: false, statues: [] },
})

@Injectable()
export class ContactsAppState {
  @Selector()
  static statues(state: ContactsAppStateInterface) {
    return state.statues;
  }

  @Selector()
  static folders(state: any) {
    return state.folders;
  }

  @Selector()
  static contacts(state: any) {
    return state.contacts;
  }

  @Selector()
  static contactIndustries(state: any) {
    return state.contactIndustries;
  }

  @Selector()
  static popupMode(state: any) {
    return state.trigger;
  }

  @Selector()
  static gridItems(state: any) {
    return state.gridItems;
  }

  @Action(PopupMode)
  popupMode({ patchState, getState }: StateContext<any>, { trigger }: PopupMode) {
    const state = produce(getState(), (draft) => {
      draft.trigger = trigger;
    });
    patchState(state);
  }

  @Action(SetStatuses)
  setStatuses(
    { patchState, getState }: StateContext<ContactsAppStateInterface>,
    { statuses }: SetStatuses) {
    const state = produce(getState(), (draft) => {
      draft.statues = statuses;
    });
    patchState(state);
  }

  @Action(UpdateStatuesItem)
  updateStatuesItem(
    { patchState, getState }: StateContext<ContactsAppStateInterface>,
    { status }: UpdateStatuesItem) {
    const state = produce(getState(), (draft) => {
      const index = draft.statues.findIndex(i => i.id === status.id);
      if (index !== -1) {
        draft.statues[index] = status;
      }
    });
    patchState(state);
  }

  @Action(AddToStatuses)
  addToStatuses(
    { patchState, getState }: StateContext<ContactsAppStateInterface>,
    { status }: AddToStatuses) {
    const state = produce(getState(), (draft) => {
      draft.statues = [...draft.statues, status];
    });
    patchState(state);
  }

  @Action(DeleteFromStatuses)
  deleteFromStatuses(
    { patchState, getState }: StateContext<ContactsAppStateInterface>,
    { id }: DeleteFromStatuses) {
    const state = produce(getState(), (draft) => {
      draft.statues = draft.statues.filter(i => i.id !== id);
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

  private sortItemsFunc(gridItems: any[], group: boolean, order: string = 'desc') {
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
    // group items in list view only
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
      draft.contactIndustries = [];
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

  @Action(ClearContacts)
  clearContacts({ patchState, getState }: StateContext<any>) {
    const state = produce(getState(), (draft) => {
      draft.contacts = [];
    });
    patchState(state);
  }

  @Action(AddContacts)
  addContacts({ patchState, getState }: StateContext<any>, { items }: AddContacts) {
    const state = produce(getState(), (draft) => {
      draft.contacts = [...items];
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
    );
  }
}
