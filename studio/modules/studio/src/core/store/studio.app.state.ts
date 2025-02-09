import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { TreeFilterNode } from '@pe/common';

import { PeAttribute } from '../interfaces/studio-attributes.interface';
import { PeStudioAlbum } from '../interfaces/studio-album.interface';
import { PeStudioWs, StudioApiService, PebStudioWsEvents } from '../services';
import {
  CreateAlbum,
  CreateCategoryAlbum,
  DeleteAlbum,
  EditingUpdateAlbum,
  InitLoadAlbums,
  LoadFolderByParent,
  UpdateAlbum,
} from './albums.actions';
import { CreateUserAttribute, InitLoadAttributes, UpdateUserAttribute } from './attributes.actions';
import {
  ALBUMS,
  mapAlbumToTreeNode,
  mapAttributesToAlbums,
  mapAttributeToCategory,
} from '../../utils/helpers-transform';
import { PeStudioCategory } from '../interfaces/studio-category.interface';
import {
  ActiveUpdateCategory,
  CreateCategory, DeleteActiveCategory,
  EditingUpdateCategory,
  LoadCategories, PatchTreeCategory, SetCategories, SetTreeCategory, Update2TreeCategory,
  UpdateCategory, UpdateDeleteAlbumCategory, UpdateTreeCategory,
} from './categories.actions';

import produce from 'immer';
import * as _ from 'lodash';
import { DataGridItemsService } from '../services/data-grid-items.service';
import { ClearStudio, EditGridItem, UpdateGridItems } from './items.actions';
import { combineLatest, forkJoin } from 'rxjs';
import { MediaService } from '@pe/media';
import { take, tap } from 'rxjs/operators';

export interface StudioAppModel {
  attributes: PeAttribute[];
  albums: PeStudioAlbum[];
  categories: PeStudioCategory[];
  gridItems?: any;
  studioAlbums: any[];
  studioCategories: any[];
}

@State<StudioAppModel>({
  name: 'studio',
  defaults: {albums: [], attributes: [], categories: [], gridItems: {}, studioAlbums: [], studioCategories: []},
})

@Injectable()
export class StudioAppState {

  constructor(
    private studioApiService: StudioApiService,
    private datagridItemService: DataGridItemsService,
    private media: MediaService,
    private studioWs: PeStudioWs) {
  }

  @Selector()
  static categories(state: StudioAppModel): any {
    return state.categories;
  }

  @Selector()
  static studioCategories(state: StudioAppModel): any {
    return state.studioCategories;
  }

  @Selector()
  static attributes(state: StudioAppModel): any {
    return state.attributes;
  }

  @Selector()
  static getItems(state): any {
    return state.gridItems;
  }


  @Action(InitLoadAlbums)
  loadAlbums({patchState, getState}: StateContext<StudioAppModel>): any {
    this.studioWs.getStudioAlbums();
    return combineLatest([this.studioWs.on(PebStudioWsEvents.GetStudioAlbums), this.studioApiService.getSubscriptionBaseFolders()]).pipe(
      take(1),
      tap(([data, studioAlbums]) => {
        const albums = data.data.albums;
        const state = getState();
        albums.forEach(album => {
          if (album.icon) {
            album.icon = this.media.getMediaUrl(album.icon, 'builder');
          }
        });
        this.datagridItemService.userAlbums = albums;
        patchState({...state, albums, studioAlbums});
      }),
    );
  }

  @Action(InitLoadAlbums)
  loadAttributes({patchState, getState}: StateContext<StudioAppModel>, {businessId}: InitLoadAttributes): any {

    return forkJoin([this.studioApiService.getUserAttributes(businessId), this.studioApiService.getSubscriptionAttributes()])
      .pipe(
        tap(([userAttributes, subscriptionAttributes]) => {
          const state = getState();
          patchState({...state, attributes: [...userAttributes, ...subscriptionAttributes]});
        }),
      );
  }

  @Action(LoadCategories)
  loadCategories({setState, getState}: StateContext<StudioAppModel>, {attributes, albums}: LoadCategories): any {
    const state = produce(getState(), draft => {
      draft.categories = mapAttributesToAlbums(attributes, albums, ALBUMS);
      draft.studioCategories.push({
        editing: false,
        listItems: draft.studioAlbums,
        active: false,
        subCategory: [],
        _id: '1',
        business: '',
        name: 'All Media',
        iconUrl: '',
        tree: draft.studioAlbums,
      });
    });
    setState(state);
  }

  @Action(SetCategories)
  setCategories({patchState, getState}: StateContext<StudioAppModel>): any {
    const state = produce(getState(), draft => {
      draft.categories = [...mapAttributesToAlbums(draft.attributes, draft.albums, ALBUMS)];
    });
    patchState(state);
  }

  @Action(CreateCategory)
  createCategory({setState, getState}: StateContext<StudioAppModel>, {
    businessId,
    attribute,
  }: CreateCategory): any {
    const state = produce(getState(), draft => {
      const category = mapAttributeToCategory(attribute, businessId);
      draft.categories.push(category);
    });
    setState(state);
  }

  @Action(EditingUpdateCategory)
  setEditingCategory({patchState, getState}: StateContext<StudioAppModel>, {
    category,
  }: EditingUpdateCategory): any {
    const state = produce(getState(), draft => {
      const index = draft.categories.findIndex(cat => cat._id === category._id);
      draft.categories[index].editing = category.editing;
    });
    patchState(state);
  }

  @Action(LoadFolderByParent)
  loadAlbumsByParent({patchState, getState}: StateContext<StudioAppModel>, {tree}: LoadFolderByParent): any {
    const state = produce(getState(), draft => {
      draft.studioAlbums = tree;
    });
    patchState(state);
  }

  @Action(ActiveUpdateCategory)
  setActiveCategory({patchState, getState}: StateContext<StudioAppModel>): any {
    const state = produce(getState(), draft => {
    });
    patchState(state);
  }

  @Action(DeleteActiveCategory)
  deleteActiveCategory({patchState, getState}: StateContext<StudioAppModel>, {
    businessId,
    payload,
  }: DeleteActiveCategory): any {
    return this.studioApiService.deleteAttribute(businessId, payload._id)
      .pipe(
        tap(() => {
          const state = produce(getState(), draft => {
            const index = draft.categories.findIndex(cat => cat._id === payload._id);
            draft.categories.splice(index, 1);
            draft.categories.forEach(category => ({...category, active: false}));
          });
          patchState(state);
        }),
      );
  }

  @Action(SetTreeCategory)
  setTreeCategory({patchState, getState}: StateContext<StudioAppModel>, {
    category,
  }: SetTreeCategory): any {
    const state = produce(getState(), draft => {
      const index = draft.categories.findIndex(cat => cat._id === category._id);
      category.editing = false;
      draft.categories[index] = category;
    });
    patchState(state);
  }

  @Action(PatchTreeCategory)
  patchTreeCategory({patchState, getState}: StateContext<StudioAppModel>, {
    category,
  }: PatchTreeCategory): any {
    const state = produce(getState(), draft => {
      let index;
      if (isCategoryType(category)) {
        index = draft.categories.findIndex(cat => cat._id === category._id);
        draft.categories[index].tree = category.listItems;
      } else if (isRootNode(category)) {
        index = draft.categories.findIndex(cat => cat._id === category.data.userAttributes[0].attribute);
        draft.categories[index].listItems.push(category.children.pop());
        draft.categories[index].tree = draft.categories[index].listItems;
      } else {
        index = draft.categories.findIndex(cat => cat._id === category.categoryId);
        draft.categories[index].tree = category.children;
      }

    });
    patchState(state);
  }

  @Action(Update2TreeCategory)
  update2TreeCategory({patchState, getState}: StateContext<StudioAppModel>, {
    category,
    node,
    payload,
  }: Update2TreeCategory): any {

    const firstState = getState();


    const state = produce(getState(), draft => {

      draft.categories = mapAttributesToAlbums(firstState.attributes, firstState.albums, ALBUMS);
    });
    patchState(state);
  }

  @Action(UpdateTreeCategory)
  updateTreeCategory({patchState, getState}: StateContext<StudioAppModel>, {
    category,
    node,
    payload,
  }: UpdateTreeCategory): any {
    const beforeState = getState();
    const nodeIndex = beforeState.categories[0].tree.findIndex(treeNode => treeNode.id === 'new_id');

    const state = produce(getState(), draft => {
      draft.categories[0].tree.splice(nodeIndex, 1);
      draft.categories[0].tree.push(mapAlbumToTreeNode(payload, category, draft.albums));
      draft.categories[0].editing = false;
    });
    patchState(state);
  }

  @Action(UpdateCategory)
  updateCategory({patchState, getState}: StateContext<StudioAppModel>, {
    attribute,
    businessId,
  }: UpdateCategory): any {
    const state = produce(getState(), draft => {
      const index = draft.categories.findIndex(cat => cat._id === attribute._id);
      draft.categories[index].name = attribute.name;
      draft.categories[index].editing = false;
    });
    patchState(state);
  }

  @Action(UpdateDeleteAlbumCategory)
  updateDeleteAlbumCategory({patchState, getState}: StateContext<StudioAppModel>, {
    category,
    node,
    payload,
  }: UpdateDeleteAlbumCategory): any {
    const state = produce(getState(), draft => {
      const index = draft.categories.findIndex(cat => cat._id === category._id);
      const albumIndex = draft.categories[index].tree.indexOf(payload);
      draft.categories[index].tree.splice(albumIndex, 1);
    });
    patchState(state);
  }

  @Action(CreateUserAttribute)
  createUserAttribute({setState, getState, dispatch}: StateContext<StudioAppModel>, {
    businessId,
    payload,
  }: CreateUserAttribute): any {
    return this.studioApiService.createUserAttribute(businessId, payload)
      .pipe(
        tap((data: PeAttribute) => {
          const state = produce(getState(), draft => {
            draft.attributes.push(data);
          });
          setState(state);
          dispatch(new CreateCategory(businessId, data));
        }),
      );
  }

  @Action(UpdateUserAttribute)
  updateUserAttribute({setState, getState, dispatch}: StateContext<StudioAppModel>, {
    businessId,
    payload,
    id,
  }: UpdateUserAttribute): any {
    return this.studioApiService.updateAttribute(businessId, payload, id)
      .pipe(
        tap((data: PeAttribute) => {
          const state = produce(getState(), draft => {
            draft.attributes.push(data);
          });
          setState(state);
          dispatch(new UpdateCategory(businessId, data));
        }),
      );
  }

  @Action(CreateCategoryAlbum)
  async createCategoryAlbum({patchState, getState, dispatch}: StateContext<StudioAppModel>, {
    businessId,
    payload,
    node,
    category,
  }: CreateCategoryAlbum): Promise<any> {
    const album = await this.studioApiService.createAlbum(businessId, payload).toPromise();
    const state = produce(getState(), draft => {
      draft.albums.push(album);
    });
    patchState(state);
    await dispatch(new UpdateTreeCategory(category, node, album)).toPromise();
  }

  @Action(CreateAlbum)
  async createAlbum({patchState, getState, dispatch}: StateContext<StudioAppModel>, {
    item,
  }: CreateAlbum): Promise<any> {
    const state = produce(getState(), draft => {
      draft.albums = [...draft.albums, item];
    });


    patchState(state);
  }

  @Action(UpdateAlbum)
  updateAlbum({patchState, getState, dispatch}: StateContext<StudioAppModel>, {

    node,
  }: UpdateAlbum): void {

    const state = produce(getState(), draft => {
      const index = draft.albums.findIndex(album => album._id === node._id);
      draft.albums[index] = node;

    });
    patchState(state);
  }

  @Action(DeleteAlbum)
  deleteAlbum({patchState, getState, dispatch}: StateContext<StudioAppModel>, {
    businessId,
    albumId,
    node,
  }: DeleteAlbum): void {
    const state = produce(getState(), draft => {
      const index = draft.albums.findIndex(albumDelete => albumDelete._id === node.id);
      draft.albums.splice(index, 1);
      draft.categories = mapAttributesToAlbums(null, draft.albums, 'albums');
    });
    this.datagridItemService.userAlbums = state.albums;

    patchState(state);
  }

  @Action(EditingUpdateAlbum)
  editingUpdateAlbum({patchState, getState, dispatch}: StateContext<StudioAppModel>, {
    node,
  }: EditingUpdateAlbum): void {
    const state = getState();
    const folderIndex = state.categories[0].tree.findIndex(treeNode => treeNode.id === node[0].id);
    const upDateState = produce(getState(), draft => {
      draft.categories[0].tree[folderIndex].editing = true;
    });
    patchState(upDateState);

  }

  @Action(UpdateGridItems)
  updateItems({patchState, getState}: StateContext<StudioAppModel>, {items}: UpdateGridItems): void {
    const upDateState = produce(getState(), draft => {
      draft.gridItems = items;
    });
    patchState(upDateState);
  }

  @Action(EditGridItem)
  editItem({patchState, getState}: StateContext<StudioAppModel>, {newItem}: EditGridItem): void {
    const upDateState = produce(getState(), draft => {
      draft.gridItems.forEach(item => {
        if (item.id === newItem._id) {
          item.image = newItem.url;
          item.data.attributes = newItem.attributes;
          item.data.userAttributes = newItem.userAttributes;
          item.name = newItem.name;
          item.title = newItem.name;
          item.type = newItem.mediaType;
        }
      });
    });
    patchState(upDateState);
  }

  @Action(ClearStudio)
  async clearStudio({patchState}: StateContext<StudioAppModel>): Promise<any> {

    patchState({albums: [], attributes: [], categories: [], gridItems: {}, studioAlbums: [], studioCategories: []});
    this.studioWs.ngOnDestroy();
  }

}


export const isCategoryType = (data: any): data is PeStudioCategory => {
  return data.hasOwnProperty('tree');
};
export const isRootNode = (data: any): data is TreeFilterNode => {
  return !_.isEmpty(data.data.userAttributes);
};
