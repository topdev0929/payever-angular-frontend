import { BBox } from 'rbush';

import {
  PEB_ROOT_SCREEN_KEY,
  PebClipboardData,
  PebClipboardRelativePosition,
  PebEditorPoint,
  PebElementDef,
  PebElementStyles,
  PebScreen,
  PebValueByScreen,
  pebGenerateId,
} from '@pe/builder/core';
import { PebElement, getPebSize } from '@pe/builder/render-utils';

import { elementModels } from '../dto';

import { findTotalArea } from './bbox.utils';
import { findElementSection } from './element.utils';

export function getClipboardData(
  copyIds: string[],
  screens: PebScreen[],
  rootElements: PebElement[],
  elements: { [id: string]: PebElementDef },
): PebClipboardData | undefined {
  const baseElement = getTopElement(rootElements);
  const baseSection = findElementSection(baseElement);
  const positions: PebValueByScreen<{ [key: string]: BBox }> = {};

  for (const screen of screens) {
    const models = new Map(elementModels(elements, screen, undefined, screens).elements.map(elm => [elm.id, elm]));
    const roots = rootElements.map(elm => models.get(elm.id)).filter((elm): elm is PebElement => !!elm);

    positions[screen.key] = roots.reduce((acc, elm) => {
      const section = models.get(baseSection?.id ?? '');
      const sectionMinY = section?.minY ?? 0;
      acc[elm.id] = { minX: elm.minX, maxX: elm.maxX, minY: elm.minY - sectionMinY, maxY: elm.maxY - sectionMinY };

      return acc;
    }, {} as { [key: string]: BBox });
  }

  const rootScreen = PEB_ROOT_SCREEN_KEY;
  const elementDefs = copyIds
    .map(id => elements[id])
    .filter(Boolean)
    .sort((a, b) => positions[rootScreen][a.id]?.maxY - positions[rootScreen][b.id]?.maxY);

  return {
    elements: elementDefs,
    positions,
  };
}

export function getClipboardElements(
  data: PebClipboardData,
  screens: PebScreen[],
  pointer?: PebEditorPoint,
): PebElementDef[] {
  const { elements, positions } = data;
  elements.forEach(elm => elm.versionNumber = undefined);

  if (!positions) {
    return elements;
  }

  const relativePositionsPerScreen: PebValueByScreen<PebClipboardRelativePosition> = {};
  const totalAreasPerScreen: PebValueByScreen<BBox> = {};

  for (const screen of screens) {
    const screenPositions = positions[screen.key];
    const totalArea = findTotalArea(Object.values(screenPositions));
    const relativePosition = getRelativePosition(totalArea, screenPositions);
    relativePositionsPerScreen[screen.key] = relativePosition;
    totalAreasPerScreen[screen.key] = totalArea;
  }

  setElementsPosition(elements, screens, relativePositionsPerScreen, totalAreasPerScreen, pointer);

  return elements;
}

function setElementsPosition(
  elements: PebElementDef[],
  screens: PebScreen[],
  relativePositionsPerScreen: PebValueByScreen<PebClipboardRelativePosition>,
  totalAreasPerScreen: PebValueByScreen<BBox>,
  pointer?: PebEditorPoint,
) {
  const groupIds = new Map<string, string>();

  for (const element of elements) {
    const stylesPerScreen: PebValueByScreen<PebElementStyles> = {};
    for (const screen of screens) {
      const styles = { ...element.styles[screen.key] };
      const relativePosition = relativePositionsPerScreen[screen.key]?.[element.id];
      const basePosition = { x: 0, y: 0 };

      if (relativePosition && basePosition) {
        styles.position = {
          ...styles.position,
          left: getPebSize(basePosition.x + relativePosition.deltaX),
          top: getPebSize(basePosition.y + relativePosition.deltaY),
        };
      }

      stylesPerScreen[screen.key] = styles;
    }

    const groupId = element.data?.groupId?.[0];
    if (groupId && !groupIds.has(groupId)) {
      groupIds.set(groupId, pebGenerateId());
    }

    element.styles = stylesPerScreen;

    if (element.data && groupId) {
      element.data.groupId = [groupIds.get(groupId) as string];
    }
  }
}

function getRelativePosition(totalArea: BBox, positions: { [elementId: string]: BBox }): PebClipboardRelativePosition {
  const result: PebClipboardRelativePosition = {};

  for (const id in positions) {
    const position = positions[id];
    result[id] = {
      deltaX: position.minX - totalArea.minX,
      deltaY: position.minY - totalArea.minY,
    };
  }

  return result;
}

export function getTopElement(elements: PebElement[]): PebElement | undefined {
  const [topElement] = elements
    .map((elm) => {
      const section = findElementSection(elm);

      return { element: elm, top: (section?.minY ?? 0) + elm.minY };
    })
    .sort((a, b) => a.top - b.top);

  return topElement?.element;
}
