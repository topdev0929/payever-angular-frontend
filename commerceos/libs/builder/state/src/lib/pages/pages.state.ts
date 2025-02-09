import { Injectable } from '@angular/core';
import { Action, Selector, SelectorOptions, State, StateContext, Store } from '@ngxs/store';
import { produce } from 'immer';
import { Observable } from 'rxjs';

import { PebWebsocketAction } from '@pe/builder/actions';
import { PebWebsocketEventType } from '@pe/builder/api';
import { PebPage } from '@pe/builder/core';
import {
  deserializeLinkedList,
  PebLinkedList,
  serializeLinkedList,
  serializeLinkedListWithPatches,
} from '@pe/builder/render-utils';

import { PebApplyPatches, PebEditorState, PebGetPageElements } from '../editor';

import {
  PebArrangePagesAction,
  PebDeletePageAction,
  PebInsertPageAction,
  PebResetPageAction,
  PebSetPagesAction,
  PebUpdatePagesAction,
  PebUpdatePagesPreview,
} from './pages.actions';


export interface PebPagesStateModel {
  pages: PebPage[];
  activePage: PebPage;
}

const defaultState = {
  pages: [],
  activePage: undefined,
};

@State<PebPagesStateModel>({
  name: 'pages',
  defaults: defaultState,
})
@Injectable()
@SelectorOptions({
  suppressErrors: false,
  injectContainerState: false,
})
export class PebPagesState {

  @Selector([PebEditorState.pages])
  static pages(pages: { [id: string]: PebPage }) {
    return produce([], () => serializeLinkedList(deserializeLinkedList(Object.values(pages))));
  }

  @Selector([PebEditorState.activePage])
  static activePage(page: PebPage) {
    return page;
  }

  @Action(PebResetPageAction)
  reset(ctx: StateContext<PebPagesStateModel>) {
    ctx.setState(defaultState);
  }

  @Action(PebSetPagesAction)
  setPages(ctx: StateContext<PebPagesStateModel>, { pages }: PebSetPagesAction) {
    const state = produce([], () => serializeLinkedList(deserializeLinkedList(pages)));
    ctx.patchState({ pages: state });
  }

  @Action(PebInsertPageAction)
  insertPage(ctx: StateContext<PebPagesStateModel>, { index, page }: PebInsertPageAction): Observable<any> {
    const pages = this.store.selectSnapshot(PebEditorState.pages);
    const list = deserializeLinkedList(Object.values(pages));
    list.insertAt(index, page);

    const [, patches, inversePatches] = this.getPatches(list);

    return ctx.dispatch([
      new PebApplyPatches(patches),
      new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }),
    ]);
  }

  @Action(PebArrangePagesAction)
  arrangePages(ctx: StateContext<PebPagesStateModel>, { previousIndexId, currentIndexId }: PebArrangePagesAction) {
    const pages = Object.values(this.store.selectSnapshot(PebEditorState.pages));
    const list = deserializeLinkedList(pages);
    const sortedPages = [...list];

    const listPreviousIndex = sortedPages.findIndex(p => p.id === previousIndexId);
    const listCurrentIndex = sortedPages.findIndex(p => p.id === currentIndexId);

    const page = list.get(listPreviousIndex).value;
    list.deleteAt(listPreviousIndex);
    list.insertAt(listCurrentIndex, page);

    const [, patches, inversePatches] = this.getPatches(list);

    ctx.dispatch([
      new PebApplyPatches(patches),
      new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }),
    ]);
  }

  @Action(PebUpdatePagesAction)
  updatePage(ctx: StateContext<PebPagesStateModel>, { payload }: PebUpdatePagesAction) {
    const pages = this.store.selectSnapshot(PebEditorState.pages);
    const list = deserializeLinkedList(Object.values(pages));
    const toUpdate = Array.isArray(payload) ? payload : [payload];

    toUpdate.forEach((page) => {
      const index = [...list].findIndex(item => item.id === page.id);
      list.deleteAt(index);
      list.insertAt(index, page);
    });

    const [, patches, inversePatches] = this.getPatches(list);

    ctx.dispatch([
      new PebApplyPatches(patches),
      new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }),
    ]);

    toUpdate.forEach((page) => {
      this.store.dispatch(new PebGetPageElements(page));
    });
  }

  @Action(PebDeletePageAction)
  deletePage(ctx: StateContext<PebPagesStateModel>, { pageId }: PebDeletePageAction) {
    const pages = this.store.selectSnapshot(PebEditorState.pages);
    const list = deserializeLinkedList(Object.values(pages));
    const index = [...list].findIndex(p => p.id === pageId);
    list.deleteAt(index);

    const [, patches, inversePatches] = this.getPatches(list);

    ctx.dispatch([
      new PebApplyPatches(patches),
      new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }),
    ]);
  }

  @Action(PebUpdatePagesPreview)
  updatePreview(ctx: StateContext<PebPagesStateModel>, { page }: PebUpdatePagesPreview) {
    const pages = this.store.selectSnapshot(PebEditorState.pages);
    const list = deserializeLinkedList(Object.values(pages));
    const index = [...list].findIndex(p => p.id === page.id);
    list.deleteAt(index);
    list.insertAt(index, page);

    const [, patches] = this.getPatches(list);

    ctx.dispatch([
      new PebApplyPatches(patches),
      new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches }),
    ]);
  }

  constructor(
    private readonly store: Store,
  ) {
  }

  private getPatches(list: PebLinkedList<PebPage>) {
    const publishedVersion = this.store.selectSnapshot(PebEditorState.publishedVersion);
    const themeId = this.store.selectSnapshot(PebEditorState.themeId);
    const path = ['theme', themeId, 'page'];

    return serializeLinkedListWithPatches(list, publishedVersion + 1, path, false);
  }
}
