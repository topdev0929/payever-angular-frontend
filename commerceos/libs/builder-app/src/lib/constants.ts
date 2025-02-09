import { PebResetUndoAction } from '@pe/builder/actions';
import { PebIntegrationApiCachedDataClearAllAction } from '@pe/builder/core';
import { PebIntegrationState } from '@pe/builder/integrations';
import {
  PebOptionsState,
  PebPagesState,
  PebElementsState,
  PebUndoState,
  PebScriptsState,
  PebShapesState,
  PebClipboardState,
  PebEditorState,
  PebResetEditorAction,
  PebResetElementsAction,
  PebResetScriptsAction,
  PebResetShapesAction,
  PebResetPageAction,
} from '@pe/builder/state';
import { PebRenderResetAction, PebViewResetAction } from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

export const BUILDER_STATES = [
  PebOptionsState,
  PebEditorState,
  PebPagesState,
  PebElementsState,
  PebUndoState,
  PebScriptsState,
  PebShapesState,
  PebClipboardState,
  PebViewState,
  PebIntegrationState,
];

export const BUILDER_STATES_RESET_ACTIONS = [
  PebResetElementsAction,
  PebResetEditorAction,
  PebResetScriptsAction,
  PebResetUndoAction,
  PebResetShapesAction,
  PebResetPageAction,
  PebViewResetAction,
  PebRenderResetAction,
  PebIntegrationApiCachedDataClearAllAction,
];
