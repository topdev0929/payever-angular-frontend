import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { Patch, applyPatches, produce, produceWithPatches } from 'immer';

import { PebWebsocketAction } from '@pe/builder/actions';
import { PebWebsocketEventType } from '@pe/builder/api';
import {
  PEB_DEFAULT_VIEWPORT,
  PebDefaultLanguageSetting,
  PebDefaultScreens,
  PebEditorViewport,
  PebElementDef,
  PebLanguage,
  PebPage,
  PebScreen,
  PebSnapLine,
  PebTheme,
  PebThemeLanguageSetting,
  isChildPage,
  PebTextStyles,
  PebConnectorContext,
  PebEditorTheme,
  PebMap,
} from '@pe/builder/core';
import { isPlainObject, PebElement } from '@pe/builder/render-utils';

import { PebSetLanguageAction, PebSetScreenAction } from '../options/options.actions';
import { PebOptionsState } from '../options/options.state';


export interface PebThemeModel {
  [id: string]: PebTheme & {
    page?: {
      [id: string]: PebPage & {
        element?: { [id: string]: PebElementDef }
      }
    }
  },
}

export interface PebEditTextModel {
  enabled: boolean;
  element?: PebElement;
  styles?: Partial<PebTextStyles>;
  fixedWidth?: boolean;
  fixedHeight?: boolean;
  maxWidth?: number;
  screen?: PebScreen;
  viewElement?: { id: string, width: number; height: number };
}

export interface PebEditorStateModel {
  theme: { [id: string]: PebEditorTheme },
  activePage?: PebPage,
  activeChildPageId?: string,
  snapLines?: PebSnapLine[],
  viewport?: PebEditorViewport,
  editText: PebEditTextModel,
}

export class PebSetTheme {
  static readonly type = '[PEB/Editor] Set Theme';

  constructor(public theme: PebEditorStateModel) {
  }
}

export class PebUpdateThemeScreens {
  static readonly type = '[PEB/Editor] Set Theme Screens';

  constructor(public screens: PebScreen[]) {
  }
}

export class PebUpdateThemeFavicon {
  static readonly type = '[PEB/Favicon] Update';

  constructor(public favicon: string) {
  }
}

export class PebLeavePage {
  static readonly type = '[PEB/Editor] Leave Page';

  constructor(public page: PebPage) {
  }
}

export class PebSetActivePage {
  static readonly type = '[PEB/Editor] Set Active Page';

  constructor(public pageId: string) {
  }
}

export class PebGetPageElements {
  static readonly type = '[PEB/Editor] Get Page Elements';

  constructor(public page: PebPage) {
  }
}

export class PebSetPageElements {
  static readonly type = '[PEB/Editor] Set Page Elements';

  constructor(public pageId: string, public element: { [id: string]: PebElementDef }) {
  }
}

export class PebUnsetPageElements {
  static readonly type = '[PEB/Editor] Unset Page Elements';

  constructor(public pageId: string) {
  }
}

export class PebApplyPatches {
  static readonly type = '[PEB/Editor] Apply Patches';

  constructor(public patches: Patch[]) {
  }
}

export class PebApplyUndo {
  static readonly type = '[PEB/Editor] Apply Undo';

  constructor(
    public id: string,
    public patches: Patch[],
  ) {
  }
}

export class PebSetThemeLanguages {
  static readonly type = '[PEB/Editor] Set Theme Language Setting';

  constructor(public language: Partial<PebThemeLanguageSetting> & { languages: PebLanguage[] }) {
  }
}

export class PebSetSnapLines {
  static readonly type = '[PEB/Editor] Set Snap Lines';

  constructor(public snapLines: PebSnapLine[]) {
  }
}

export class PebSetViewport {
  static readonly type = '[PEB/Editor] Set Viewport';

  constructor(public viewport: PebEditorViewport) {
  }
}

export class PebResetEditorAction {
  static readonly type = '[PEB/Editor] Reset';
}

export class PebNavigateToPageAction {
  static readonly type = '[PEB/Editor] Navigate To Page';
}

export class PebSetEditTextAction {
  static readonly type = '[Peb/Text] Set Edit Text';

  constructor(public payload: PebEditTextModel) {
  }
}

export class PebPatchEditTextAction {
  static readonly type = '[Peb/Text] Patch Edit Text';

  constructor(public payload: Partial<PebEditTextModel>) {
  }
}

const defaultState: PebEditorStateModel = {
  theme: undefined,
  activePage: undefined,
  viewport: undefined,
  snapLines: [],
  editText: { enabled: false, maxWidth: 0 },
};

@State<PebEditorStateModel>({
  name: 'editorState',
  defaults: defaultState,
})
@Injectable()
export class PebEditorState {

  @Selector()
  static state(state: PebEditorStateModel) {
    return state;
  }

  @Selector()
  static theme(state: PebEditorStateModel): PebEditorTheme {
    const [theme] = Object.values(state.theme);

    return theme;
  }

  @Selector()
  static defaultLanguage(state: PebEditorStateModel) {
    if (!state?.theme) {
      return undefined;
    }
    const [theme] = Object.values(state.theme);

    return theme.language.defaultLanguage;
  }

  @Selector()
  static languages(state: PebEditorStateModel): { [key: string]: PebLanguage } {
    if (!state?.theme) {
      return undefined;
    }
    const [theme] = Object.values(state.theme);

    return theme.language.languages;
  }

  @Selector()
  static screens(state: PebEditorStateModel): PebScreen[] {
    if (!state?.theme) {
      return undefined;
    }
    const [theme] = Object.values(state.theme);

    return theme.sortedScreens;
  }

  @Selector()
  static languageSetting(state: PebEditorStateModel) {
    if (!state?.theme) {
      return undefined;
    }
    const [theme] = Object.values(state.theme);

    return theme.language;
  }

  @Selector()
  static themeId(state: PebEditorStateModel) {
    const [theme] = Object.values(state.theme);

    return theme.id;
  }

  @Selector()
  static activePage(state: PebEditorStateModel) {
    return state.activePage;
  }

  @Selector()
  static activeChildPageId(state: PebEditorStateModel) {
    return state.activeChildPageId;
  }

  @Selector()
  static viewport(state: PebEditorStateModel) {
    return state.viewport ?? PEB_DEFAULT_VIEWPORT;
  }

  @Selector()
  static pages(state: PebEditorStateModel): PebMap<PebPage> {
    const [theme] = Object.values(state.theme);

    return theme.page;
  }

  @Selector()
  static elements(state: PebEditorStateModel): { [id: string]: PebElementDef } {
    const [theme] = Object.values(state.theme);

    return theme.page[state.activePage.id].element;
  }

  @Selector()
  static masterElements(state: PebEditorStateModel): { [id: string]: PebElementDef } | undefined {
    const [theme] = Object.values(state.theme);
    const masterPageId = theme.page[state.activePage.id].master?.page;

    return theme.page[masterPageId]?.element;
  }

  @Selector()
  static publishedVersion(state: PebEditorStateModel) {
    const [theme] = Object.values(state.theme);

    return theme.publishedVersion;
  }

  @Selector()
  static favicon(state: PebEditorStateModel) {
    const [theme] = Object.values(state.theme);

    return theme.favicon;
  }

  @Selector()
  static snapLines(state: PebEditorStateModel) {
    return state.snapLines ?? [];
  }

  @Selector()
  static editText(state: PebEditorStateModel): PebEditTextModel {
    return state.editText;
  }

  @Selector([PebOptionsState.language, PebEditorState.languages, PebEditorState.activePage, PebOptionsState.screen, PebEditorState.theme])
  static connectorContext(
    language: PebLanguage,
    languages: { [key: string]: PebLanguage },
    page: PebPage,
    screen: PebScreen,
    theme: PebTheme,
  ): PebConnectorContext {
    return {
      languageKey: language?.key,
      languages: Object.values(languages ?? {}),
      page,
      screen,
      theme,
    };
  }

  constructor(
    private store: Store,
  ) {
  }

  @Action(PebResetEditorAction)
  reset({ setState }: StateContext<PebEditorStateModel>) {
    setState(defaultState);
  }

  @Action(PebSetTheme)
  setTheme({ setState }: StateContext<PebEditorStateModel>, { theme }: PebSetTheme) {
    const state = produce(theme, (draft) => {
      Object.values(draft.theme).forEach((thm) => {
        thm.sortedScreens = Object.values(thm.screens ?? PebDefaultScreens).sort((a, b) => b.width - a.width);
        thm.language = {
          ...PebDefaultLanguageSetting,
          ...thm.language,
        };
      });

      return draft;
    });

    setState({ ...state, editText: { enabled: false, maxWidth: 0 } });

    this.setActiveScreen(Object.values(state.theme)[0]);
    this.setActiveLanguage(Object.values(state.theme)[0]);
  }

  @Action(PebUpdateThemeScreens)
  updateThemeScreens({ getState, dispatch }: StateContext<PebEditorStateModel>, { screens }: PebUpdateThemeScreens) {
    const state = getState();
    const newVersion = this.store.selectSnapshot(PebEditorState.publishedVersion) + 1;

    const [produced, patches, inversePatches] = produceWithPatches(state, (draft) => {
      const [theme] = Object.values(draft.theme);

      const changeDraftRecursive = (source, receive) => {
        for (const key in source) {
          if (isPlainObject(source[key])) {
            changeDraftRecursive(source[key], receive[key]);
          } else if (source[key] !== receive[key]) {
            source[key] = receive[key];
            draft.theme[theme.id].versionNumber = newVersion;
          }
        }
      };

      if (!theme.screens) {
        theme.screens = {};
      }

      const keys = screens.map(screen => screen.key);
      const deletedKeys = Object.keys(draft.theme[theme.id].screens).filter(key => !keys.includes(key));

      for (const key of deletedKeys) {
        delete draft.theme[theme.id].screens[key];
        draft.theme[theme.id].versionNumber = newVersion;
      }

      for (const screen of screens) {
        if (!theme.screens[screen.key]) {
          draft.theme[theme.id].screens[screen.key] = screen;
          draft.theme[theme.id].versionNumber = newVersion;
        } else {
          changeDraftRecursive(draft.theme[theme.id].screens[screen.key], screen);
        }
      }
    });

    dispatch(new PebSetTheme(produced));
    dispatch(new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }));
  }

  @Action(PebUpdateThemeFavicon)
  updateThemeFavicon({ getState, dispatch }: StateContext<PebEditorStateModel>, { favicon }: PebUpdateThemeFavicon) {
    const state = getState();
    const [theme] = Object.values(state.theme);
    const newVersion = this.store.selectSnapshot(PebEditorState.publishedVersion) + 1;

    const [produced, patches, inversePatches] = produceWithPatches(state, (draft) => {
      draft.theme[theme.id].favicon = favicon;
      draft.theme[theme.id].versionNumber = newVersion;
    });

    dispatch(new PebSetTheme(produced));
    dispatch(new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches, inversePatches }));
  }

  @Action(PebSetActivePage)
  setActivePage({ getState, dispatch, patchState }: StateContext<PebEditorStateModel>, { pageId }: PebSetActivePage) {
    if (!pageId) {
      return;
    }

    const state = getState();
    const [theme] = Object.values(state.theme);
    const page = theme.page[pageId];

    dispatch(new PebLeavePage(state.activePage));

    !Object.keys(page.element).length && this.store.dispatch(new PebGetPageElements(page));

    isChildPage(page) && patchState({ activeChildPageId: page.id });
    patchState({ activePage: page });

    const language = theme.language.languages[page.defaultLanguage] ?? theme.language.defaultLanguage;
    this.store.dispatch(new PebSetLanguageAction(language));
  }

  @Action(PebSetPageElements)
  setPageElements({ getState, setState, patchState }: StateContext<PebEditorStateModel>, { pageId, element: elements }: PebSetPageElements) {
    const state = getState();
    const [theme] = Object.values(state.theme);

    const themeState = produce(state, (draft) => {
      const page = draft.theme[theme.id].page[pageId];
      page.element = elements;
    });

    return setState(themeState);
  }

  @Action(PebUnsetPageElements)
  unsetPageElements({ getState, setState, patchState }: StateContext<PebEditorStateModel>, { pageId }: PebUnsetPageElements) {
    const state = getState();
    const [theme] = Object.values(state.theme);

    const themeState = produce(state, (draft) => {
      const page = draft.theme[theme.id].page[pageId];
      page?.element && (page.element = {});
    });

    setState(themeState);
  }

  @Action(PebApplyPatches)
  applyPatches({ getState, setState }: StateContext<PebEditorStateModel>, { patches }: PebApplyPatches) {
    const state = getState();

    const patched: PebEditorStateModel = applyPatches(state, patches);
    const [theme] = Object.values(patched.theme);
    const newState = produce(patched, (draft) => {
      if (state.activePage) {
        draft.activePage = draft.theme[theme.id].page[state.activePage.id];
      }
    });

    setState(newState);
  }

  @Action(PebApplyUndo)
  applyUndo(ctx: StateContext<PebEditorStateModel>, { id, patches }: PebApplyUndo) {
    let nextPage = ctx.getState().activePage.id;
    const pageInserted = patches.find(p => p.op === 'add' && p.path.length === 4)?.path[3] as string;
    const pageDeleted = patches.find(p => p.op === 'remove' && p.path.length === 4)?.path[3] as string;
    if (pageDeleted) {
      const [theme] = Object.values(ctx.getState().theme);
      nextPage = theme.page[pageDeleted].prev ?? theme.page[pageDeleted].next;
    } else if (pageInserted) {
      nextPage = pageInserted;
    } else {
      const page = patches.find(p => p.path[4] === 'element')?.path[3] as string;
      if (page) {
        nextPage = page;
      }
    }

    const state = ctx.getState();

    let patched: PebEditorStateModel;
    try {
      patched = applyPatches(state, patches);
    } catch (err) {
      console.error(err);
    }

    const [theme] = Object.values(patched.theme);

    /** Update versions for affected elements and pages, set new theme undo id */
    const [newState, themePatches] = produceWithPatches(patched, (draft) => {
      draft.theme[theme.id].undo = id;

      patches.forEach((patch) => {
        const removePagePatch = patch.op === 'remove' && patch.path.length === 4;
        const removeElementPatch = patch.op === 'remove' && patch.path.length === 6;
        if (!removePagePatch && !removeElementPatch && patch.path[2] === 'page') {
          const pageId = patch.path[3];
          draft.theme[theme.id].page[pageId].versionNumber = theme.publishedVersion + 1;
          if (patch.path[4] === 'element') {
            draft.theme[theme.id].page[pageId].element[patch.path[5]].versionNumber = theme.publishedVersion + 1;
          }
        }
      });
    });

    ctx.setState({ ...newState, activePage: newState.theme[theme.id].page[nextPage] });
    ctx.dispatch(new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches: [...patches, ...themePatches] }));
  }

  @Action(PebSetThemeLanguages)
  setThemeLanguages({ setState, getState, dispatch }: StateContext<PebEditorStateModel>, { language }: PebSetThemeLanguages) {
    const state = getState();
    const [theme] = Object.values(state.theme);
    const newVersion = this.store.selectSnapshot(PebEditorState.publishedVersion) + 1;

    const [newState, themePatches] = produceWithPatches(state, (draft) => {
      const themeLanguage = draft.theme[theme.id].language;

      if (!themeLanguage.languages) {
        themeLanguage.languages = language.languages.reduce((acc, language) => {
          acc[language.key] = language;

          return acc;
        }, {});
      } else {
        const themeLanguages = themeLanguage.languages;

        for (const lang of language.languages) {
          const key = lang.key;

          if (!themeLanguages[key]) {
            themeLanguages[key] = lang;
          } else if (themeLanguages[key]) {
            themeLanguages[key].active = lang.active;
          }
        }
      }

      if (language.autoDetect !== undefined && themeLanguage.autoDetect !== language.autoDetect) {
        themeLanguage.autoDetect = language.autoDetect;
      }

      if (
        language.defaultLanguage &&
        themeLanguage.defaultLanguage?.key !== language.defaultLanguage.key
      ) {
        themeLanguage.defaultLanguage = language.defaultLanguage;
      }

      draft.theme[theme.id].versionNumber = newVersion;
    });

    setState(newState);
    dispatch(new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches: [...themePatches] }));
  }

  @Action(PebSetSnapLines)
  setSnapLines({ patchState }: StateContext<PebEditorStateModel>, { snapLines }) {
    patchState({ snapLines });
  }

  @Action(PebSetViewport)
  setViewport({ patchState }: StateContext<PebEditorStateModel>, { viewport }) {
    patchState({ viewport });
  }

  @Action(PebSetEditTextAction)
  setEditText({ patchState }: StateContext<PebEditorStateModel>, { payload }: PebSetEditTextAction) {
    patchState({ editText: payload });
  }

  @Action(PebPatchEditTextAction)
  patchEditText({ getState, patchState }: StateContext<PebEditorStateModel>, { payload }: PebPatchEditTextAction) {
    const update = produce(getState().editText, (draft) => {
      for (let key in payload) {
        draft[key] = payload[key];
      };
    });

    patchState({ editText: update });
  }

  private setActiveScreen(theme: PebTheme) {
    const screenKey = this.store.selectSnapshot<PebScreen>(PebOptionsState.screen)?.key;
    const screens = theme.screens ?? PebDefaultScreens;
    const screen = screens[screenKey] ?? Object.values(theme.screens)[0];

    this.store.dispatch(new PebSetScreenAction(screen));
  }

  private setActiveLanguage(theme: PebTheme) {
    const languageKey = this.store.selectSnapshot<PebLanguage>(PebOptionsState.language)?.key;
    let language = theme.language.languages?.[languageKey] ?? Object.values(theme.language.languages ?? {})[0];

    this.store.dispatch(new PebSetLanguageAction(language));
  }
}
