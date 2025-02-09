import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import {
  PebViewElementEventType,
  isOpenOverlayInteraction,
  PebViewStateModel,
  isCloseOverlayInteraction,
  PebRenderElementModel,
  PebIntegrationEventAction,
  isSwapOverlayInteraction,
  isSliderLoadInteraction,
  isSliderChangeInteraction,
  PebRenderContainer,
  PEB_ROOT_SCREEN_KEY,
  PebDefaultScreens,
  PebScreen,
  PebTheme,
  PebViewPage,
  PebLanguage,
  PebDefaultLanguages,
  PEB_DEFAULT_LANG_KEY,
  isAnimationPlayInteraction,
  isAnimationKeyframeInteraction,
  isSliderUnloadInteraction,
  isSliderPlayInteraction,
  isSliderPauseInteraction,
  isSliderPlayToggleInteraction,
  isVideoPlayInteraction,
  isVideoPauseInteraction,
  isVideoTogglePlayInteraction,
  PebViewQueryModel,
  PebMap,
  PebContextTree,
  PebRenderUpdateModel,
  isCookiesAcceptInteraction,
  isCookiesRejectInteraction,
  PebScript,
  PebRootContext,
  PebViewCookiesPermission,
} from '@pe/builder/core';
import { getSortedScreens, isPlainObject } from '@pe/builder/render-utils';
import {
  PebViewOverlayOpenAction,
  PebViewOverlayCloseAction,
  PebViewElementClickedAction,
  PebViewResetContainerAction,
  PebViewElementMouseEnteredAction,
  PebViewElementMouseLeavedAction,
  PebViewOverlaySwapAction,
  PebViewSliderLoadAction,
  PebViewSliderChangeAction,
  PebRenderCreateOrUpdateAction,
  PebRenderPatchStyleAction,
  PebRenderResetAction,
  PebRenderSetRootElementAction,
  PebRenderSetParentAction,
  PebRenderUpdateAction,
  PebViewElementEnteredViewportAction,
  PebViewResetAction,
  PebViewThemeSetAction,
  PebViewPagesSetAction,
  PebViewPageSetAction,
  PebViewPagesPatchAction,
  PebViewScreenSetAction,
  PebViewLanguageSetAction,
  PebViewPageRenderingAction,
  PebViewContainerSetAction,
  PebViewAnimationPlayAction,
  PebViewAnimationKeyframePlayAction,
  PebViewSliderUnloadAction,
  PebViewElementExitedViewportAction,
  PebViewSliderPlayAction,
  PebViewSliderPauseAction,
  PebViewSliderTogglePlayAction,
  PebViewVideoPlayAction,
  PebViewVideoPauseAction,
  PebViewVideoTogglePlayAction,
  PebViewQueryPatchAction,
  PebViewContextSetAction,
  PebViewContextSetRootAction,
  PebViewContextUpdateAction,
  PebViewContextUpdatedAction,
  PebViewCookiesAcceptAction,
  PebViewCookiesRejectAction,
  PebViewScriptsSetAction,
} from '@pe/builder/view-actions';


const defaultState: PebViewStateModel = {
  rootElementId: '',
  elements: {},
  screenKey: PEB_ROOT_SCREEN_KEY,
  pageId: '',
  theme: undefined,
  languageKey: PEB_DEFAULT_LANG_KEY,
  pages: {},
  query: {},
  contexts: {},
  scripts: {},
};

@State<PebViewStateModel>({ name: 'view', defaults: defaultState })
@Injectable()
export class PebViewState {
  @Selector()
  static theme(state: PebViewStateModel): PebTheme | undefined {
    return state.theme;
  }

  @Selector()
  static screen(state: PebViewStateModel): PebScreen {
    return state.theme?.screens[state.screenKey] ?? PebDefaultScreens[PEB_ROOT_SCREEN_KEY];
  }

  @Selector()
  static screens(state: PebViewStateModel): PebScreen[] {
    return getSortedScreens(Object.values(state.theme?.screens ?? PebDefaultScreens));
  }

  @Selector()
  static query(state: PebViewStateModel): PebViewQueryModel {
    return state.query ?? {};
  }

  @Selector()
  static pages(state: PebViewStateModel): { [id: string]: PebViewPage } {
    return state.pages ?? {};
  }

  @Selector()
  static pageId(state: PebViewStateModel): string | undefined {
    return state.pageId;
  }

  @Selector()
  static page(state: PebViewStateModel): PebViewPage | undefined {
    return state.pages[state.pageId];
  }

  @Selector()
  static language(state: PebViewStateModel): PebLanguage | undefined {
    return state.theme?.language?.languages[state.languageKey] ?? PebDefaultLanguages.en;
  }

  @Selector()
  static languages(state: PebViewStateModel): { [key: string]: PebLanguage } {
    return state.theme?.language?.languages ?? PebDefaultLanguages;
  }

  @Selector()
  static languageKey(state: PebViewStateModel): string {
    return state.languageKey ?? 'en';
  }

  @Selector()
  static rootElement(state: PebViewStateModel): PebRenderElementModel {
    return state.elements[state.rootElementId];
  }

  @Selector()
  static container(state: PebViewStateModel): PebRenderContainer | undefined {
    return state.container;
  }

  @Selector()
  static elements(state: PebViewStateModel): PebMap<PebRenderElementModel> {
    return state.elements ?? {};
  }

  @Selector()
  static rootContext(state: PebViewStateModel): PebRootContext | undefined {
    return state.rootContext;
  }

  @Selector()
  static contexts(state: PebViewStateModel): PebMap<PebContextTree> {
    return state.contexts ?? {};
  }

  @Selector()
  static rootElementId(state: PebViewStateModel): string {
    return state.rootElementId;
  }

  @Selector()
  static scripts(state: PebViewStateModel): PebMap<PebScript> {
    return state.scripts ?? {};
  }

  @Action(PebViewPageRenderingAction)
  pageRendering(state: StateContext<PebViewStateModel>, action: PebViewPageRenderingAction) {
    const elements = produce(action.elements, () => { });
    state.patchState({ elements });

    this.emitElementInitActions(elements, state.getState().query.cookiesPermission);
  }

  @Action(PebViewElementClickedAction)
  click(state: StateContext<PebViewStateModel>, action: PebViewElementClickedAction) {
    this.handleInteractionEvents(PebViewElementEventType.Click, action.element);
    this.handleIntegrationEvents(PebViewElementEventType.Click, action.element);
  }

  @Action(PebViewElementMouseEnteredAction)
  mouseEntered(state: StateContext<PebViewStateModel>, action: PebViewElementMouseEnteredAction) {
    this.handleInteractionEvents(PebViewElementEventType.MouseEnter, action.element);
  }

  @Action(PebViewElementMouseLeavedAction)
  mouseLeaved(state: StateContext<PebViewStateModel>, action: PebViewElementMouseLeavedAction) {
    this.handleInteractionEvents(PebViewElementEventType.MouseLeave, action.element);
  }

  @Action(PebViewElementEnteredViewportAction)
  enteredViewport(state: StateContext<PebViewStateModel>, action: PebViewElementEnteredViewportAction) {
    this.handleInteractionEvents(PebViewElementEventType.ViewportEnter, action.element);
    if (!action.element.state?.inViewport) {
      this.store.dispatch(new PebRenderUpdateAction([{ id: action.element.id, state: { inViewport: true } }]));
    }
  }

  @Action(PebViewElementExitedViewportAction)
  exitedViewport(state: StateContext<PebViewStateModel>, action: PebViewElementExitedViewportAction) {
    this.handleInteractionEvents(PebViewElementEventType.ViewportExit, action.element);
    if (action.element.state?.inViewport) {
      this.store.dispatch(new PebRenderUpdateAction([{ id: action.element.id, state: { inViewport: false } }]));
    }
  }

  @Action(PebViewContainerSetAction)
  setContainer(state: StateContext<PebViewStateModel>, action: PebViewContainerSetAction) {
    state.patchState({ container: action.container });
  }

  @Action(PebViewThemeSetAction)
  setTheme(state: StateContext<PebViewStateModel>, action: PebViewThemeSetAction) {
    const theme = produce(action.theme, (draft) => { });
    const languageKey = action.theme.language.defaultLanguage?.key ?? defaultState.languageKey;

    state.patchState({ theme, languageKey });
  }

  @Action(PebViewScreenSetAction)
  setScreen(state: StateContext<PebViewStateModel>, action: PebViewScreenSetAction) {
    if (state.getState().screenKey === action.screenKey) {
      return;
    }

    state.patchState({ screenKey: action.screenKey });
  }

  @Action(PebViewLanguageSetAction)
  setLanguage(state: StateContext<PebViewStateModel>, action: PebViewLanguageSetAction) {
    if (state.getState().languageKey === action.languageKey) {
      return;
    }

    state.patchState({ languageKey: action.languageKey ?? defaultState.languageKey });
  }

  @Action(PebViewPagesSetAction)
  setPages(state: StateContext<PebViewStateModel>, action: PebViewPagesSetAction) {
    const pages = produce({}, (draft: { [id: string]: PebViewPage }) => {
      action.pages.forEach(page => draft[page.id] = page);
    });

    state.patchState({ pages });
  }

  @Action(PebViewPagesPatchAction)
  patchPages(state: StateContext<PebViewStateModel>, action: PebViewPagesPatchAction) {
    const pages = produce(state.getState().pages, (draft: { [id: string]: PebViewPage }) => {
      action.updates.forEach((update) => {
        const entry: any = draft[update.id];

        if (!entry) {
          draft[update.id] = update as PebViewPage;

          return;
        }

        Object.entries(update).forEach(([key, val]) => entry[key] = val);
      });
    });

    state.patchState({ pages });
  }

  @Action(PebViewPageSetAction)
  setPage(state: StateContext<PebViewStateModel>, action: PebViewPageSetAction) {
    state.patchState({ pageId: action.pageId ?? '' });
  }

  @Action(PebViewResetAction)
  reset(state: StateContext<PebViewStateModel>, action: PebViewResetContainerAction) {
    state.patchState({ elements: {}, rootElementId: '' });
  }

  @Action(PebRenderSetRootElementAction)
  setRootElement(state: StateContext<PebViewStateModel>, action: PebRenderSetRootElementAction) {
    state.patchState({ rootElementId: action.rootELementId });
  }

  @Action(PebRenderPatchStyleAction)
  patchStyle(state: StateContext<PebViewStateModel>, action: PebRenderPatchStyleAction) {
    this.update(
      state,
      { updates: [{ id: action.id, style: action.style }] });
  }

  @Action(PebRenderCreateOrUpdateAction)
  createOrUpdate(state: StateContext<PebViewStateModel>, action: PebRenderCreateOrUpdateAction) {
    this.update(state, { updates: action.elements });
  }

  @Action(PebRenderSetParentAction)
  setParent(state: StateContext<PebViewStateModel>, action: PebRenderSetParentAction) {
    this.update(
      state,
      { updates: [{ id: action.elementId, parent: { id: action.parentId } }] },
    );
  }

  @Action(PebRenderUpdateAction)
  update(state: StateContext<PebViewStateModel>, action: PebRenderUpdateAction) {
    let existingElements = state.getState().elements;
    const nonExistingElements = action.updates
      .filter(update => update && !existingElements[update.id]) as PebRenderElementModel[];

    if (nonExistingElements.length) {
      const elements = produce(existingElements, (draft) => {
        nonExistingElements.forEach((elm) => {
          elm && !draft[elm.id] && (draft[elm.id] = elm as any);
        });
      });
      state.patchState({ elements });
    }

    let elements = produce(state.getState().elements, (draft) => {
      action.updates.forEach((update) => {
        const id = update?.id ?? '';
        if (!update || !update.id || !draft[id]) {
          return;
        }

        let updateVersion = draft[id].updateVersion ?? 0;
        this.updateRecursive(draft[id], update);
        draft[id].updateVersion = updateVersion + 1;
        if (update.parent?.id) {
          const parent = draft[update.parent.id];
          draft[id].parent.type = parent.type;
        }
      });
    });

    elements = produce(elements, draft => this.handleChildrenUpdates(existingElements, draft, action.updates));

    state.patchState({ elements });
  }

  @Action(PebViewQueryPatchAction)
  patchQuery(state: StateContext<PebViewStateModel>, action: PebViewQueryPatchAction) {
    const update = action.update;

    const query = produce(state.getState().query ?? {}, (draft: any) => {
      Object.entries(update).forEach(([key, val]) => draft[key] = val);
    });

    state.patchState({ query });
  }

  @Action(PebRenderResetAction)
  clearAll(state: StateContext<PebViewStateModel>) {
    state.patchState(defaultState);
  }

  @Action(PebViewContextSetRootAction)
  setRootContext(state: StateContext<PebViewStateModel>, action: PebViewContextSetRootAction) {
    state.patchState({ rootContext: action.root });
  }

  @Action(PebViewContextSetAction)
  setContext(state: StateContext<PebViewStateModel>, action: PebViewContextSetAction) {
    state.patchState({ contexts: action.contexts });
  }

  @Action(PebViewContextUpdateAction)
  updateContext(state: StateContext<PebViewStateModel>, action: PebViewContextUpdateAction) {
    const contexts = state.getState().contexts;
    const updates: PebMap<PebContextTree> = action.updates ?? {};
    Object.entries(action.updates).forEach(([id, context]) => contexts[id] = context);
    state.patchState({ contexts });
    this.store.dispatch(new PebViewContextUpdatedAction(updates));
  }

  @Action(PebViewScriptsSetAction)
  setScripts(state: StateContext<PebViewStateModel>, action: PebViewScriptsSetAction) {
    state.patchState({ scripts: action.scripts });
  }

  constructor(private readonly store: Store) {
  }

  private updateRecursive(receiver: WritableDraft<any>, updates: any) {
    if (!updates) {
      return;
    }

    for (let key in updates) {
      const val = updates[key];
      if (val === undefined) {
        delete receiver[key];

        continue;
      }

      if (!isPlainObject(val) || key === 'container') {
        receiver[key] = val;

        continue;
      }

      !receiver[key] && (receiver[key] = {});
      this.updateRecursive(receiver[key], val);
    }
  }

  private emitElementInitActions(
    elements: PebMap<PebRenderElementModel>,
    cookiesPermission: PebViewCookiesPermission | undefined,
  ) {
    const elementsWithInteraction = Object.values(elements).filter(elm => elm.interactions);
    elementsWithInteraction.forEach(elm => this.handleInteractionEvents(PebViewElementEventType.Init, elm));

    if (!cookiesPermission?.isSet) {
      elementsWithInteraction.forEach(elm => this.handleInteractionEvents(PebViewElementEventType.CookiesInitial, elm));
    }
  }

  private handleInteractionEvents(
    event: PebViewElementEventType,
    element: PebRenderElementModel,
  ) {
    if (!element.interactions) {
      return;
    }

    const interactions = Object.values(element.interactions).filter(i => i.trigger === event);
    Object.values(interactions)
      .forEach((interaction) => {
        if (isOpenOverlayInteraction(interaction)) {
          this.store.dispatch(new PebViewOverlayOpenAction(element, interaction));
        }
        else if (isCloseOverlayInteraction(interaction)) {
          this.store.dispatch(new PebViewOverlayCloseAction());
        }
        else if (isSwapOverlayInteraction(interaction)) {
          this.store.dispatch(new PebViewOverlaySwapAction(element, interaction));
        }
        else if (isSliderLoadInteraction(interaction)) {
          this.store.dispatch(new PebViewSliderLoadAction(element, interaction));
        }
        else if (isSliderPlayInteraction(interaction)) {
          this.store.dispatch(new PebViewSliderPlayAction(element, interaction));
        }
        else if (isSliderPauseInteraction(interaction)) {
          this.store.dispatch(new PebViewSliderPauseAction(element, interaction));
        }
        else if (isSliderPlayToggleInteraction(interaction)) {
          this.store.dispatch(new PebViewSliderTogglePlayAction(element, interaction));
        }
        else if (isSliderUnloadInteraction(interaction)) {
          this.store.dispatch(new PebViewSliderUnloadAction(element, interaction));
        }
        else if (isSliderChangeInteraction(interaction)) {
          this.store.dispatch(new PebViewSliderChangeAction(element, interaction));
        }
        else if (isVideoPlayInteraction(interaction)) {
          this.store.dispatch(new PebViewVideoPlayAction(element, interaction));
        }
        else if (isVideoTogglePlayInteraction(interaction)) {
          const elementId = interaction.videoELementId || element.id;
          this.store.dispatch(new PebViewVideoTogglePlayAction(elementId));
        }
        else if (isVideoPauseInteraction(interaction)) {
          this.store.dispatch(new PebViewVideoPauseAction(element, interaction));
        }
        else if (isAnimationPlayInteraction(interaction)) {
          const elementId = interaction.placeholder.elementId || element.id;
          this.store.dispatch(new PebViewAnimationPlayAction(elementId));
        }
        else if (isAnimationKeyframeInteraction(interaction)) {
          const elementId = interaction.placeholder.elementId || element.id;
          this.store.dispatch(new PebViewAnimationKeyframePlayAction(
            elementId,
            interaction.keyframeChange,
          ));
        }
        else if (isCookiesAcceptInteraction(interaction)) {
          this.store.dispatch(new PebViewCookiesAcceptAction(element));
        }
        else if (isCookiesRejectInteraction(interaction)) {
          this.store.dispatch(new PebViewCookiesRejectAction(element));
        }
      });
  }

  private handleIntegrationEvents(event: PebViewElementEventType, element: PebRenderElementModel) {
    const action = element.integration?.actions?.[event];
    if (!action) {
      return;
    }

    const context = this.store.selectSnapshot(PebViewState.contexts)[element.id];
    this.store.dispatch(new PebIntegrationEventAction(action.method, { action, context }));
  }

  private handleChildrenUpdates(
    currentElements: PebMap<PebRenderElementModel>,
    updatedElements: WritableDraft<PebMap<PebRenderElementModel>>,
    updates: (PebRenderUpdateModel | undefined)[],
  ) {
    const toUpdateParentIds = new Set<string>();
    updates.forEach((update) => {
      if (!update?.id) {
        return;
      }

      const currentElement = currentElements[update.id];
      const currentParentId = currentElement?.parent?.id;
      const newParentId = update.parent?.id;

      if (currentParentId !== newParentId) {
        toUpdateParentIds.add(currentParentId);
        toUpdateParentIds.add(newParentId);
      }
    });

    const elements = Object.values(updatedElements);
    toUpdateParentIds.forEach((id) => {
      const parent = updatedElements[id];
      parent && (parent.children = elements.filter(elm => elm.parent?.id === id));
    });
  }
}
