import {
  isGridLayout,
  PebElementDef,
  PebElementDefUpdate,
  PebElementStyles,
  PebScreen,
  PEB_ROOT_SCREEN_KEY,
  PebEditorScale,
  PebTextStyles,
  PebSyncUpdateOption,
  PebPadding,
  PEB_DEFAULT_FONT_SIZE,
} from '@pe/builder/core';
import { PebElement, isGridElement, isSection, getCascadeStylesByWidth } from '@pe/builder/render-utils';

import { elementModels } from '../dto';

import { bboxDimension } from './bbox.utils';
import { elementIsVisible } from './element.utils';
import { containerMaxSpace } from './position.utils';
import { scaleSize } from './size.utils';
import { extractElementTextStyles } from './text.utils';


export function getSyncedElementUpdatesForScreens(
  elements: PebElement[],
  elementDefs: { [id: string]: PebElementDef },
  originScreen: PebScreen,
  screens: PebScreen[],
  options: PebSyncUpdateOption
): PebElementDefUpdate[] {
  const updates: PebElementDefUpdate[] = [];

  elements.forEach((element) => {
    const syncScreens = screens.filter(scr => scr.width < screen.width && isSyncEnabled(element, scr.key));

    syncScreens.forEach((scr) => {
      updates.push(
        ...getSyncedElementUpdates(element, elementDefs, originScreen, scr, screens, options),
      );
    });
  });

  return updates;
}

export function getSyncedElementUpdates(
  element: PebElement,
  defs: { [id: string]: PebElementDef },
  originScreen: PebScreen,
  destinationScreen: PebScreen,
  screens: PebScreen[],
  options: PebSyncUpdateOption
): PebElementDefUpdate[] {
  if (!options) {
    return [];
  }

  const updates: PebElementDefUpdate[] = [];

  if (options.dimension || options.position) {
    updates.push(...getSyncedSizePosition(element, defs, originScreen, destinationScreen, screens, options));
  }

  const elementDef = defs[element.id];

  if (options.textStyles) {
    const updateTextStyles = getCascadeStylesByWidth(elementDef?.styles, screens, destinationScreen.width).textStyles;
    const originalTextStyles = extractElementTextStyles(element);
    if (elementDef && updateTextStyles && originalTextStyles) {
      updates.push(
        getSyncedTxtStyles(elementDef, originalTextStyles, updateTextStyles, originScreen, destinationScreen),
      );
    }
  }

  if (options.padding) {
    updates.push(...getSyncedPadding(elementDef, originScreen, destinationScreen, screens));
  }

  if (options.fill) {
    updates.push(getSyncedStyles(element, ['fill'], destinationScreen));
  }

  return updates;
}

export function getSyncedSizePosition(
  element: PebElement,
  defs: { [id: string]: PebElementDef },
  originScreen: PebScreen,
  destinationScreen: PebScreen,
  screens: PebScreen[],
  options: PebSyncUpdateOption,
): PebElementDefUpdate[] {
  const originModels = elementModels(defs, originScreen, undefined, screens).elements;
  const originalElement = originModels.find(elm => elm.id === element.id);

  if (isSection(originalElement)) {
    return originalElement ? [getSyncedSectionUpdate(originalElement, originScreen, destinationScreen)] : [];
  }

  const destinationModels = elementModels(defs, destinationScreen, undefined, screens).elements;
  const destinationElement = destinationModels.find(elm => elm.id === element.id);
  const originalParent = originalElement?.parent;
  const destinationParent = destinationElement?.parent;

  if (!originalParent || !destinationParent || !originalElement || !destinationElement) {
    return [];
  }

  const skipSync = !elementIsVisible(originalElement) || !elementIsVisible(destinationElement);

  if (skipSync) {
    return [{
      id: element.id, data:
      {
        syncSizePosition: { [originScreen.key]: false, [destinationScreen.key]: false },
      },
    }];
  }

  const scale = getScale(originalElement, originalParent, destinationParent);

  const updates: PebElementDefUpdate[] = [];
  if (options.dimension) {
    updates.push(...getSyncedSizeRecursive(
      originalElement,
      destinationElement,
      scale,
      destinationScreen.key,
    ));
  }

  if (options.position) {
    updates.push(...getSyncedPositionRecursive(
      originalElement,
      scale,
      destinationScreen.key,
    ));
  }

  return updates;
}

export function getSyncedPadding(
  originalElement: PebElementDef,
  originScreen: PebScreen,
  destinationScreen: PebScreen,
  screens: PebScreen[],
): PebElementDefUpdate[] {
  const padding = getCascadeStylesByWidth(originalElement.styles, screens, originScreen.width)?.padding;
  if (!padding) {
    return [];
  }
  const scale = destinationScreen.width / originScreen.width;
  const destinationPadding: PebPadding = {
    left: scale * padding.left,
    top: scale * padding.top,
    right: scale * padding.right,
    bottom: scale * padding.bottom,
  };

  return [{
    id: originalElement.id,
    styles: {
      [destinationScreen.key]: { padding: destinationPadding },
    },
  }];
}

function getSyncedPositionRecursive(
  element: PebElement,
  scale: PebEditorScale,
  destinationScreenKey: string,
): PebElementDefUpdate[] {
  let styles = getSyncedPosition(element, scale);

  const updates: PebElementDefUpdate[] = [{
    id: element.id,
    styles: { [destinationScreenKey]: styles },
  }];

  const handleChildren = !isSection(element) && element.data?.resizeSetting?.resizeChildren;
  if (handleChildren) {
    const originalChildren = [...element.children ?? []];

    originalChildren.forEach((child) => {
      const childUpdates = getSyncedPositionRecursive(child, scale, destinationScreenKey);
      updates.push(...childUpdates);
    });
  }

  return updates;
}

export function getSyncedPosition(element: PebElement, { scaleX, scaleY }: PebEditorScale): Partial<PebElementStyles> {
  const position = {
    ...element.styles.position,
    left: scaleSize(element.styles.position?.left, scaleX, false),
    top: scaleSize(element.styles.position?.top, scaleY, false),
    right: scaleSize(element.styles.position?.right, scaleX, false),
    bottom: scaleSize(element.styles.position?.bottom, scaleY, false),
  };

  return { position };
}

export function getSyncedDimension(element: PebElement, { scaleX, scaleY }: PebEditorScale): Partial<PebElementStyles> {
  const result: Partial<PebElementStyles> = {};
  result.dimension = {
    ...element.styles.dimension,
    width: scaleSize(element.styles.dimension?.width, scaleX, false),
    height: scaleSize(element.styles.dimension?.height, scaleY, false),
  };

  if (isGridElement(element)) {
    result.gridTemplateColumns = element.styles.gridTemplateColumns
      ?.map(col => scaleSize(col, scaleX, false)?.value ?? 0);
    result.gridTemplateRows = element.styles.gridTemplateRows
      ?.map(row => scaleSize(row, scaleY, false)?.value ?? 0);
  }

  return result;
}

export function getSyncedSectionUpdate(
  element: PebElement,
  originalScreen: PebScreen,
  destinationScreen: PebScreen,
): PebElementDefUpdate {
  const scale = getSectionScale(element, originalScreen, destinationScreen);
  const height = scaleSize(element.styles.dimension?.height, scale.scaleY, false);

  return { id: element.id, styles: { [destinationScreen.key]: { dimension: { height } } } };
}

export function getSyncedStyles(
  element: PebElement,
  keys: string[],
  screen: PebScreen,
): PebElementDefUpdate {
  return {
    id: element.id,
    styles: {
      [screen.key]: { ...getResetObject(keys) },
    },
  };
}

export function getSyncedTxtStyles(
  elementDef: PebElementDef,
  originalTextStyles: Partial<PebTextStyles>,
  textStyles: Partial<PebTextStyles>,
  originalScreen: PebScreen,
  destinationScreen: PebScreen,
): PebElementDefUpdate {
  const reset = getResetObject(Object.keys(textStyles));
  delete reset.fontSize;
  delete reset.letterSpacing;
  delete reset.lineHeight;

  const styles: Partial<PebElementStyles> = { textStyles: reset };
  const fontSize = originalTextStyles.fontSize ?? PEB_DEFAULT_FONT_SIZE;

  if (fontSize && elementDef.data?.resizeSetting?.resizeText !== false) {
    const scale = destinationScreen.width / originalScreen.width;
    textStyles.fontSize = fontSize * scale;

    styles.textStyles && (styles.textStyles.fontSize = textStyles.fontSize);
  }

  return { id: elementDef.id, styles: { [destinationScreen.key]: styles } };
}

function getSyncedSizeRecursive(
  originalElement: PebElement,
  destinationElement: PebElement | undefined,
  scale: { scaleX: number, scaleY: number },
  destinationScreenKey: string,
): PebElementDefUpdate[] {
  let styles = getSyncedDimension(originalElement, scale);

  const updates: PebElementDefUpdate[] = [{
    id: originalElement.id,
    styles: { [destinationScreenKey]: styles },
  }];

  const handleChildren = !isSection(originalElement);
  if (handleChildren) {
    const originalChildren = [...originalElement.children ?? []];
    const destinationChildren = [...destinationElement?.children ?? []];

    originalChildren.forEach((child) => {
      let desChild = destinationChildren.find(elm => elm.id === child.id);
      if (!desChild) {
        return;
      }

      const childUpdates =
        getSyncedSizeRecursive(child, desChild, scale, destinationScreenKey);
      updates.push(...childUpdates);
    });
  }

  return updates;
}

export function isSyncEnabled(element: PebElement, screenKey: string): boolean {
  let sync = element?.data?.syncSizePosition ? element.data.syncSizePosition[screenKey] : undefined;

  return sync ?? screenKey !== PEB_ROOT_SCREEN_KEY;
}

function getSectionScale(
  element: PebElement,
  originalScreen: PebScreen,
  destinationScreen: PebScreen,
): { scaleX: number, scaleY: number } {
  let scaleX, scaleY;
  const fullWidth = element.data?.fullWidth;
  const desWidth = destinationScreen.width + (fullWidth ? destinationScreen.padding * 2 : 0);
  const originWidth = originalScreen.width + (fullWidth ? originalScreen.padding * 2 : 0);
  scaleX = scaleY = desWidth / originWidth;

  return { scaleX, scaleY };
}

function getScale(
  element: PebElement,
  parentInOriginScreen: PebElement,
  parentInDestinationScreen: PebElement,
): { scaleX: number, scaleY: number } {
  const originMaxSpace = containerMaxSpace({ ...element, parent: parentInOriginScreen });
  const destinationMaxSpace = containerMaxSpace({ ...element, parent: parentInDestinationScreen });

  const originDim = bboxDimension(originMaxSpace);
  const destinationDim = bboxDimension(destinationMaxSpace);

  const scaleX = originDim.width ? destinationDim.width / originDim.width : 0;
  let scaleY = originDim.height ? destinationDim.height / originDim.height : 0;
  const keepRatio = isSection(element.parent) && !isGridLayout(element.parent?.styles?.layout);
  keepRatio && (scaleY = scaleX);

  return { scaleX, scaleY };
}

function getResetObject(keys: string[]): { [key: string]: undefined } {
  const res: any = {};

  keys.forEach(key => res[key] = undefined);

  return res;
}
