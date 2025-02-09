import {
  PEB_DEFAULT_LAYOUT_POSITION,
  PEB_ROOT_SCREEN_KEY,
  PebContextTableDesign,
  PebDesignType,
  PebElementDef,
  PebLanguage,
  PebLanguageEnum,
  PebScreen,
  isContextTableDesign,
  isGridLayout,
  pebGenerateId,
} from '@pe/builder/core';
import {
  getCascadeStylesByWidth,
  gridLayout,
  arrangeLayoutPositions,
  PebElement,
  PebElementDTO,
  PebLinkedList,
  clonePlainObject,
  deserializeLinkedList,
  isDocument,
  isGridElement,
  resolveRowAndColByIndex,
  serializeLinkedList,
  getDeltaByLanguage,
} from '@pe/builder/render-utils';

import {
  calculateDocumentBBox,
  calculateElementsBBoxes,
  pullElement,
} from './editor';

export const toElementsDTO = (value: PebElementDef[]): PebElementDTO[] => {
  /** elements array to map for quick access */
  const elements = new Map(value.map(elm => [elm.id, { ...elm } as PebElementDTO]));

  elements.forEach((elm) => {
    elm.children = new PebLinkedList<PebElementDTO>();
  });

  /** sort the children */
  elements.forEach((elm) => {
    const parent = elements.get(elm.parent?.id ?? '');

    /** prevent circular references in the list (old themes) */
    const unique = new Set<string>();

    if (parent?.children?.length === 0) {
      let next: PebElementDTO | null = elm;
      while (next && !unique.has(next.id)) {
        unique.add(next.id);
        parent.children.add(next);
        next = next.next ? elements.get(next.next) ?? null : null;
      }

      let prev: PebElementDTO | null = elements.get(elm.prev ?? '') ?? null;
      while (prev && !unique.has(prev.id)) {
        unique.add(prev.id);
        parent.children.prepend(prev);
        prev = elements.get(prev.prev ?? '') ?? null;
      }
    }

    elm.parent = parent;
  });

  return [...elements.values()];
};

export const getRanges = (dimensions: number[]): Array<[number, number]> => {
  return dimensions?.reduce<Array<[number, number]>>((acc, value) => {
    const min = acc[acc.length - 1]?.[1] ?? 0;

    return [...acc, [min, min + value]];
  }, []);
};

export const getParents = (elm: PebElement): PebElement[] => {
  const circularCheck = new Set([elm.id]);
  let parent = elm.parent;
  let parents = [];
  while (parent && !circularCheck.has(parent.id)) {
    parents.push(parent);
    circularCheck.add(parent.id);
    parent = parent.parent;
  }

  return parents;
};

export const onlyVisibleElements = (value: PebElement[]): PebElement[] => {
  const circularCheck = new Set();
  const reduce = (elms: PebElement[], acc: PebElement[] = []): PebElement[] => {
    elms.forEach((elm) => {
      if (circularCheck.has(elm.id)) {
        return;
      }
      circularCheck.add(elm.id);
      const parents = getParents(elm);

      const connectedToDocument = isDocument(elm) || isDocument(parents[parents.length - 1]);
      const visible = elm.visible
        && connectedToDocument
        && parents.every(e => e.visible && e.design?.type !== PebDesignType.NoRender);

      if (visible) {
        acc.push(elm);
        reduce([...elm?.children ?? []], acc);
      }
    });

    return acc;
  };

  return value ? reduce(value) : [];
};

export const isPlainObject = (obj: any): boolean => {
  if (obj) {
    const prototype = Object.getPrototypeOf(obj);

    return prototype === Object.getPrototypeOf({}) || prototype === null;
  }

  return false;
};

export const elementModels = (
  elementDefs: { [id: string]: PebElementDef } | PebElementDTO[],
  screen: PebScreen,
  language: PebLanguage | undefined,
  screens: PebScreen[],
  masterElementDefs?: { [id: string]: PebElementDef } | PebElementDTO[],
): { rootElements: PebElement[], elements: PebElement[], map: Map<string, PebElement> } => {
  const { rootElements, elements, map } = toElementTree(elementDefs, screen, language, screens);
  const document = rootElements.find(isDocument);

  if (masterElementDefs && document) {
    const masterMap = toElementTree(masterElementDefs, screen, language, screens);
    const masterElements = masterMap.elements;
    const masterDocument = masterMap.rootElements.find(isDocument);
    masterElements.forEach(elm => elm.master = { isMaster: true });

    pullElement(document, masterDocument);
  }

  handleGridElements(elements, map);
  handleGridLayoutPositions(elements);

  document && calculateDocumentBBox(document, screen);
  const width = screen.width + screen.padding * 2;
  calculateElementsBBoxes(rootElements.filter(elm => !isDocument(elm)), undefined, width);

  return { rootElements, elements, map };
};

export const toElementTree = (
  elementDefs: { [id: string]: PebElementDef } | PebElementDTO[],
  screen: PebScreen,
  language: PebLanguage | undefined,
  screens: PebScreen[],
): { rootElements: PebElement[], elements: PebElement[], map: Map<string, PebElement> } => {
  const values = Object.values(elementDefs).filter(elm => !elm.deleted && elm.design?.type !== PebDesignType.NoRender);

  if (!values?.length) {
    return { rootElements: [], map: new Map<string, PebElement>(), elements: [] };
  }

  const languageKey = language?.key ?? PebLanguageEnum.Generic;
  const map = new Map<string, PebElement>(values.map((value) => {
    const { styles, ...element } = value;
    const cascadeStyles = getCascadeStylesByWidth(styles, screens, screen.width, PEB_ROOT_SCREEN_KEY);

    return [
      element.id,
      {
        ...element,
        styles: cascadeStyles,
        text: getDeltaByLanguage(element.type, element.data?.text, languageKey),
        visible: cascadeStyles.display !== 'none',
        children: new PebLinkedList<PebElement>(),
        parent: { ...element.parent },
        screen,
        language,
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
      },
    ];
  }));

  const rootElements: PebElement[] = [];
  const elements: PebElement[] = [];

  const circularCheck = new Set<string>();
  map.forEach((element) => {
    const parent = element.parent?.id ? map.get(element.parent.id) : undefined;
    element.parent = parent;
    elements.push(element);
    !parent && rootElements.push(element);

    if (parent?.children?.length === 0) {
      let next: PebElement | undefined = element;
      while (next && !circularCheck.has(next.id)) {
        circularCheck.add(next.id);
        parent.children.add(next);
        next = next.next ? map.get(next.next) : undefined;
      }

      let prev = element.prev ? map.get(element.prev) : undefined;
      while (prev && !circularCheck.has(prev.id)) {
        circularCheck.add(prev.id);
        parent.children.prepend(prev);
        prev = prev.prev ? map.get(prev.prev) : undefined;
      }

      const length = parent.children?.length ?? 0;
      [...parent.children ?? []].forEach((elm, idx) => {
        elm.index = idx;
        elm.styles.zIndex = length - idx;
      });
    }
  });

  return { rootElements, elements, map };
};

export const elementToArray = (elm: PebElement, acc: PebElement[] = []): PebElement[] => {
  acc.push(elm);
  for (const e of elm.children ?? []) {
    elementToArray(e, acc);
  }

  return acc;
};

/** clone and set new uuid */
export function cloneElement(value: PebElement, cloneChildren?: boolean): PebElement;
export function cloneElement(value: PebElement[], cloneChildren?: boolean): PebElement[];
export function cloneElement(value: any, cloneChildren = true) {
  const isArray = Array.isArray(value);
  const elements = isArray ? value : [value];

  const cloned = elements.map((elm: any) => {
    const id = pebGenerateId();
    const clone = {
      ...elm,
      id,
      children: new PebLinkedList<PebElement>(),
      styles: clonePlainObject(elm.styles),
      data: clonePlainObject(elm.data),
      original: elm,
    };

    if (cloneChildren) {
      for (const child of elm.children) {
        clone.children.add({ ...cloneElement({ ...child, parent: clone }) });
      }

      clone.children = deserializeLinkedList(serializeLinkedList(clone.children));
    }

    return clone;
  });

  return isArray ? cloned : cloned[0];
}

/** clone and set new uuid */
export function cloneElementDto(value: PebElementDTO): PebElementDTO;
export function cloneElementDto(value: PebElementDTO[]): PebElementDTO[];
export function cloneElementDto(value: any) {
  const isArray = Array.isArray(value);
  const elements = isArray ? value : [value];

  const cloned = elements.map((elm: any) => {
    const id = pebGenerateId();

    const styles = Object.keys(elm.styles).reduce((acc, key) => {
      acc[key] = clonePlainObject(elm.styles[key]);

      return acc;
    }, {} as any);

    const clone = {
      ...elm,
      id,
      children: new PebLinkedList<PebElementDTO>(),
      styles,
      data: clonePlainObject(elm.data),
    };

    for (const child of elm.children || []) {
      clone.children.add({ ...cloneElementDto({ ...child, parent: clone }) });
    }

    clone.children = deserializeLinkedList(serializeLinkedList(clone.children));

    return clone;
  });

  return isArray ? cloned : cloned[0];
}

function handleGridLayoutPositions(elements: PebElement[]) {
  elements.forEach((elm) => {
    if (!elm.children || !isGridLayout(elm.styles.layout)) {
      return;
    }

    const layoutPositions = [...elm.children ?? []].map(item =>
      ({ ...PEB_DEFAULT_LAYOUT_POSITION, ...item.styles.layoutPosition })
    );

    arrangeLayoutPositions(layoutPositions, elm.styles.layout).forEach((lp, idx) => {
      const item = elm.children?.get(idx);
      item && (item.value.styles.layoutPosition = lp);
    });
  });
}

function handleGridElements(elements: PebElement[], map: Map<string, PebElement>) {
  elements.filter(elm => elm.design && isContextTableDesign(elm.design)).forEach((element) => {
    const design = element.design as PebContextTableDesign;
    const templateCell = design?.templateCell ? map.get(design.templateCell) : undefined;

    if (!templateCell) {
      return;
    }

    const { gridTemplateColumns = [], gridTemplateRows = [] } = element.styles;
    const cloneCount = gridTemplateColumns.length * gridTemplateRows.length - 1;

    for (let i = 0; i < cloneCount; i += 1) {
      const clone = cloneElement(templateCell);
      handleGridElementIds(clone, `${templateCell.id}-${i}`);
      clone.styles.layoutPosition = { fill: true, auto: true };
      !element.children && (element.children = new PebLinkedList<PebElement>());
      element.children.add(clone);

      elementToArray(clone).forEach((elm) => {
        map.set(elm.id, elm);
      });
    }
  });

  elements.filter(elm => isGridElement(elm)).forEach((elm) => {
    const layout = gridLayout(elm.styles);
    elm.styles.layout = layout;

    let index = 0;
    [...elm.children ?? []].forEach((child) => {
      const { row, column } = resolveRowAndColByIndex(index, layout.rows?.length ?? 0, layout.columns?.length ?? 0);
      child.styles.layoutPosition = { auto: false, index, row, column, fill: true };
      index++;
    });
  });
}

function handleGridElementIds(element: PebElement, id: string): void {
  element.id = id;

  [...element.children ?? []].forEach((child, index) => handleGridElementIds(child, `${id}-${index}`));
}
