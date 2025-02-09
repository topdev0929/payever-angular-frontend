import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { enablePatches, produceWithPatches } from 'immer';

import { PebGroupAction, PebUngroupAction, PebWebsocketAction } from '@pe/builder/actions';
import { PebWebsocketEventType } from '@pe/builder/api';
import {
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebLanguageEnum,
  PebTheme,
  PEB_ROOT_SCREEN_KEY,
} from '@pe/builder/core';
import { applyDefUpdates, bboxDimension } from '@pe/builder/editor-utils';
import { lastMigrationVersion } from '@pe/builder/migrations';
import {
  deserializeLinkedList,
  PebElement,
  PebLinkedList,
  serializeLinkedList,
  isPlainObject,
} from '@pe/builder/render-utils';

import { PebApplyPatches, PebEditorState, PebPatchEditTextAction } from '../editor';
import { PebOptionsState, PebOptionsStateModel } from '../options/options.state';
import { PebPagesState } from '../pages/pages.state';

import {
  PebArrangeElementsAction,
  PebDeleteAction,
  PebUpdateAction,
  PebUpdateElementDefAction,
  PebResetElementsAction,
} from './elements.actions';
import {
  PebCloseGroupAction,
  PebDeselectAllAction,
  PebOpenGroupAction,
  PebSelectAction,
  PebSetAllELementsAction,
  PebSetBBoxELementsAction,
  PebSetDocumentAction,
} from './selection.actions';

enablePatches();

export interface PebElementsStateModel {
  selectedElementIds: string[];
  visibleElements: PebElement[];
  allElements: PebElement[];
  document: PebElement | undefined;
  group?: string;
}

const defaultState = {
  selectedElementIds: [],
  group: undefined,
  elements: [],
  visibleElements: [],
  allElements: [],
  document: undefined,
};

@State<PebElementsStateModel>({ name: 'elements', defaults: defaultState })
@Injectable()
export class PebElementsState {

  @Selector([PebEditorState.elements])
  static defs(elements: { [id: string]: PebElementDef }): { [id: string]: PebElementDef } {
    return elements;
  }

  @Selector([PebEditorState.elements])
  static elementsByName(elements: { [name: string]: PebElementDef } = {}): Map<string, PebElementDef> {
    return new Map(Object.values(elements).filter(elm => !elm.deleted && elm.name).map(elm => [elm.name.toLowerCase(), elm]));
  }

  @Selector()
  static document(state: PebElementsStateModel): PebElement | undefined {
    return state.document;
  }

  @Selector()
  static visibleElements(state: PebElementsStateModel): PebElement[] {
    return state.visibleElements;
  }

  @Selector()
  static allElements(state: PebElementsStateModel): PebElement[] {
    return state.allElements;
  }

  @Selector()
  static selectedElementIds(state: PebElementsStateModel): string[] {
    return state.selectedElementIds;
  }

  @Selector([PebElementsState.selectedElementIds, PebElementsState.visibleElements])
  static selectedElements(selectedIds: string[], elements: PebElement[]): PebElement[] {
    return elements.filter(elm => selectedIds.includes(elm.id));
  }

  @Selector([PebElementsState.selectedElements, PebElementsState.visibleElements])
  static selected(selected: PebElement[], models: PebElement[]): PebElement[] {
    const elements = selected?.filter(elm => !!elm).reduce((acc, elm) => {
      const element = models.find(e => e.id === elm.id);
      if (element) {
        acc.push(element);
      }

      return acc;
    }, [] as PebElement[]);

    if (elements.length === 0 && models.length > 0) {
      const doc = models.find(elm => elm.type === PebElementType.Document);
      if (doc) {
        elements.push(doc);
      }
    }

    return elements;
  }

  @Selector()
  static openGroup(state: PebElementsStateModel): string {
    return state.group;
  }

  @Action(PebSetDocumentAction)
  setElements({ patchState }: StateContext<PebElementsStateModel>, { document }: PebSetDocumentAction) {
    patchState({ document });
  }

  @Action(PebSetBBoxELementsAction)
  setBBoxElements({ patchState }: StateContext<PebElementsStateModel>, { elements }: PebSetBBoxELementsAction) {
    patchState({ visibleElements: elements });
  }

  @Action(PebSetAllELementsAction)
  setAllElements({ patchState }: StateContext<PebElementsStateModel>, { elements }: PebSetAllELementsAction) {
    patchState({ allElements: elements });
  }

  @Action(PebResetElementsAction)
  reset({ setState }: StateContext<PebElementsStateModel>) {
    setState(defaultState);
  }

  @Action(PebSelectAction)
  select({ patchState }: StateContext<PebElementsStateModel>, { payload }: PebSelectAction) {
    const items = Array.isArray(payload) ? payload : [payload];
    const ids = items.map(item => typeof item === 'string' ? item : item.id);

    patchState({ selectedElementIds: ids });
  }

  @Action(PebDeselectAllAction)
  deselect({ patchState }: StateContext<PebElementsStateModel>) {
    patchState({ selectedElementIds: [] });
  }

  @Action(PebOpenGroupAction)
  selectGroup({ patchState }: StateContext<PebElementsStateModel>, { payload }: PebOpenGroupAction) {
    patchState({ group: payload });
  }

  @Action(PebCloseGroupAction)
  deselectGroup({ getState, patchState }: StateContext<PebElementsStateModel>) {
    const { selectedElementIds: selectedIds } = getState();
    patchState({ selectedElementIds: selectedIds });
  }

  @Action(PebArrangeElementsAction)
  arrangeElements(state: StateContext<PebElementsStateModel>, payload: PebArrangeElementsAction) {
    const elements = this.store.selectSnapshot(PebEditorState.elements);
    const elms = Array.isArray(payload.elements) ? payload.elements : [payload.elements];
    const parent = elms[0].parent;
    const parentChildren = [...parent.children].filter(elm => !elm.master?.isMaster);
    let index = parentChildren.indexOf(elms[0]) + payload.delta;

    if (index < 0 || index > parentChildren.length - 1) {
      return;
    }

    if (elms.every(elm => elm.parent.id === parent.id)) {
      const defs = [];
      for (const item of parentChildren) {
        defs.push(elements[item.id]);
      }
      const list = new PebLinkedList<PebElementDef>();
      defs.forEach(def => list.add(def));

      elms.forEach((elm) => {
        const elmIndex = parentChildren.indexOf(elm);
        const node = list.deleteAt(elmIndex);
        list.insertAt(index, { ...node.value, data: { ...node.value.data, version: lastMigrationVersion } });
        index += 1;
      });

      const updated = serializeLinkedList(list);
      const [, patches, inversePatches] = this.patchState((draft) => {
        updated.forEach((def) => {
          draft[def.id].data.version = def.data.version;
          draft[def.id].prev = def.prev;
          draft[def.id].next = def.next;
        });
      });

      /**
       * After apply undo/redo need to restore selection,
       * but when elements just rearranged (e.g. sections moved up/down)
       * can't determine which element was moved in the linked list because they are simply swapped.
       * In this case just add same parent to selected elements patches as a flag to know it was selected.
       */
      const selected = this.store.selectSnapshot(PebElementsState.selected);
      const themeId = this.store.selectSnapshot(PebEditorState.themeId);
      const page = this.store.selectSnapshot(PebPagesState.activePage);
      selected.forEach((elm) => {
        const patch = {
          op: 'replace' as const,
          path: ['theme', themeId, 'page', page.id, 'element', elm.id, 'parent'],
          value: { id: elm.parent.id, type: elm.parent.type },
        };
        patches.push(patch);
        inversePatches.push(patch);
      });

      this.store.dispatch([
        new PebApplyPatches(patches),
        new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }),
      ]);
    }
  }

  @Action(PebUpdateAction)
  update({ getState, patchState, setState }: StateContext<PebElementsStateModel>, { payload }: PebUpdateAction) {
    const { screen, language } = this.store.selectSnapshot<PebOptionsStateModel>(PebOptionsState);
    const theme = this.store.selectSnapshot<PebTheme>(PebEditorState.theme);

    const models = this.store.selectSnapshot(PebElementsState.allElements);
    const publishedVersion = this.store.selectSnapshot(PebEditorState.publishedVersion);
    const [, patches, inversePatches] = this.patchState((draft) => {
      (payload as any).forEach((elm) => {
        if (!draft[elm.id]) {
          return;
        }

        let id = elm.id;
        let element = models.find(e => e.id === elm.id);
        if (element.original?.id) {
          id = element.original?.id;
          element = models.find(e => e.id === id);
        }

        const update = { ...elm };
        delete update.id;

        if (!id) {
          draft[elm.id] = elm;

          return;
        } else if (Object.keys(update).length === 0) {
          delete draft[id];

          return;
        }

        const recursive = (receiver: any, source: any) => {
          for (const key in source) {
            if (!['prev', 'next', 'parent'].includes(key) && source[key] === null) {
              delete receiver[key];
            } else if (key === 'styles') {
              if (!receiver.styles[screen.key]) {
                receiver.styles[screen.key] = {};
              }
              recursive(receiver.styles[screen.key], source.styles);
            } else if (key === 'text' && receiver.data) {
              /*
              Rules for set language:
              1- if editor language is undefined then only update generic
              2- if editor language is selected update locale language and if editor lang === default lang then update generic too.
              3- if generic language not presented then update
              */

              !receiver.data.text && (receiver.data.text = {});
              let screenTextData = receiver.data.text[PEB_ROOT_SCREEN_KEY] ?? (receiver.data.text[PEB_ROOT_SCREEN_KEY] = {});
              const defaultLanguageKey = theme.language.defaultLanguage?.key;

              const updateGeneric = !language?.key || language.key === defaultLanguageKey || !screenTextData[PebLanguageEnum.Generic];
              const updateLocale = !!language?.key;

              !screenTextData[PebLanguageEnum.Generic] && (screenTextData[PebLanguageEnum.Generic] = {});

              if (updateGeneric) {
                screenTextData[PebLanguageEnum.Generic] = screenTextData[PebLanguageEnum.Generic] ?? {};
                recursive(screenTextData[PebLanguageEnum.Generic], source.text);
              }

              if (updateLocale) {
                screenTextData[language.key] = screenTextData[language.key] ?? {};
                recursive(screenTextData[language.key], source.text);
              }
            } else if (['parent', 'screen', 'language'].includes(key)) {
              /** need check which elements allow to have others as children */
              const parent = source[key]?.original ?? source[key];
              if (parent) {
                const { id, type } = parent;
                if (receiver[key]?.id !== id) {
                  receiver[key] = { id, type };
                }
              }
              else {
                receiver[key] = undefined;
              }

            } else if (isPlainObject(source[key])) {
              if (!receiver[key]) {
                receiver[key] = source[key];
              } else {
                recursive(receiver[key], source[key]);
              }
            } else if (['prev', 'next'].includes(key) && source === update) {
              if (source[key]) {
                receiver[key] = models.find(e => e.id === source[key])?.original?.id ?? source[key];
              } else {
                receiver[key] = source[key];
              }
            } else if (!(['id', 'type'].includes(key) && source === update)) {
              receiver[key] = source[key];
            } else {
              console.warn(`Can't change element ${key}`);
            }
          }
        };

        recursive(draft[id], update);

        draft[id].versionNumber = publishedVersion + 1;
        draft[id].changeLog = { version: (draft[id].changeLog?.version ?? 0) + 1 };
        draft[id].styles[screen.key].absoluteBound = bboxDimension(element);

        if (draft[id].data) {
          draft[id].data.version = lastMigrationVersion;
        } else {
          draft[id].data = { version: lastMigrationVersion };
        }
      });
    });

    return this.store.dispatch([
      new PebApplyPatches(patches),
      new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }),
      new PebPatchEditTextAction({ enabled: false }),
    ]);
  }

  @Action(PebUpdateElementDefAction)
  updateElementDefs(context: StateContext<PebElementsStateModel>, { updates }: PebUpdateElementDefAction) {
    const [, patches, inversePatches] = this.patchState((draft) => {
      applyDefUpdates(draft, updates);
    });

    return this.store.dispatch([
      new PebApplyPatches(patches),
      new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }),
    ]);
  }

  @Action(PebDeleteAction)
  delete({ getState, patchState, setState }: StateContext<PebElementsStateModel>, { payload }: PebDeleteAction) {
    const publishedVersion = this.store.selectSnapshot(PebEditorState.publishedVersion);

    const payloadMap = new Map<string, PebElement>(payload.map(elm => [elm.id, elm]));

    const [, patches, inversePatches] = this.patchState((draft) => {
      const newChildren = new Map<string, PebLinkedList<PebElement>>();

      payload.forEach((elm) => {
        if (!payloadMap.has(elm.parent.id)) {
          const list = newChildren.get(elm.parent.id) ?? deserializeLinkedList(serializeLinkedList(elm.parent.children));
          const index = list.getIndex(elm);
          list.deleteAt(index);
          newChildren.set(elm.parent.id, list);
        }

        if (draft[elm.id]) {
          draft[elm.id].deleted = true;
          draft[elm.id].versionNumber = publishedVersion + 1;
        }
      });

      newChildren.forEach((list) => {
        const update = serializeLinkedList(list).filter((node: any) => !node.original);

        update.forEach((item) => {
          if (draft[item.id]) {
            draft[item.id].prev = item.prev;
            draft[item.id].next = item.next;
            draft[item.id].versionNumber = publishedVersion + 1;
          }
        });
      });
    });

    patchState({ selectedElementIds: [] });
    this.store.dispatch([
      new PebApplyPatches(patches),
      new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }),
    ]);
  }

  @Action(PebGroupAction)
  group({ getState }: StateContext<PebElementsStateModel>) {
    const { group } = getState();
    const selected = this.store.selectSnapshot(PebElementsState.selectedElements);

    const groupId = pebGenerateId();
    const payload = selected.reduce((acc, elm) => [
      ...acc,
      ...this.groupRecursive(groupId, elm, group),
    ], []);

    this.store.dispatch(new PebUpdateAction(payload));
  }

  @Action(PebUngroupAction)
  ungroup({ getState }: StateContext<PebElementsStateModel>) {
    const { group } = getState();
    const selected = this.store.selectSnapshot(PebElementsState.selectedElements);

    const payload = selected.reduce((acc, elm) => [
      ...acc,
      ...this.groupRecursive(elm, group),
    ], []);

    this.store.dispatch(new PebUpdateAction(payload));
  }

  constructor(private readonly store: Store) {
  }

  private groupRecursive(elm: PebElement, openGroup: string, payload?: Partial<PebElement>[]): Partial<PebElement>[];
  private groupRecursive(id: string, elm: PebElement, openGroup: string, payload?: Partial<PebElement>[]): Partial<PebElement>[];
  private groupRecursive(...args) {
    let newGroupId: string;
    let element: PebElement;
    let openGroup: string;
    let payload: Partial<PebElement>[] = [];
    if (typeof args[0] === 'string') {
      [newGroupId, element, openGroup, payload = []] = args;
    } else {
      [element, openGroup, payload = []] = args;
    }

    const groupId = element.data?.groupId ? [...element.data?.groupId] : [];
    const index = groupId.indexOf(openGroup) ?? -1;
    if (newGroupId) {
      if (index !== -1) {
        groupId.splice(index, 0, newGroupId);
      } else {
        groupId.push(newGroupId);
      }
    } else if (index !== -1) {
        groupId.splice(index, 1);
    } else {
      groupId.pop();
    }

    payload = payload.concat([...element.children].reduce((acc, elm) => {
      return [
        ...acc,
        ...newGroupId
          ? this.groupRecursive(newGroupId, elm, openGroup, payload)
          : this.groupRecursive(elm, openGroup, payload),
      ];
    }, []));

    payload.push({
      id: element.id,
      data: {
        groupId: groupId.length ? groupId : null,
      },
    });

    return payload;
  }

  private patchState(callback: (draft) => void, pageId?: string) {
    const publishedVersion = this.store.selectSnapshot(PebEditorState.publishedVersion);
    const theme = this.store.selectSnapshot(PebEditorState.theme);
    const state = this.store.selectSnapshot(PebEditorState.state);

    pageId = pageId ?? this.store.selectSnapshot(PebPagesState.activePage).id;

    return produceWithPatches({ theme: state.theme }, (draft) => {
      draft.theme[theme.id].page[pageId].versionNumber = publishedVersion + 1;

      callback(draft.theme[theme.id].page[pageId].element);
    });
  }
}
