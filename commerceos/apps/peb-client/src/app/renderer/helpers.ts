import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import {
  PebElementDef,
  PebElementType,
  PebLanguage,
  PebScreen,
  PebValueByScreen,
  pebGenerateId,
  isInternalPage,
  PebPageVariant,
  PEB_ROOT_SCREEN_KEY,
  PEB_DEFAULT_LAYOUT_POSITION,
  isGridLayout,
  PebContextTableDesign,
  PebViewVector,
  isContextTableDesign,
  PebElementDefTree,
  PebDefaultTextStyles,
  PebClientElementDef,
  PebClientElm,
  PebClientRenderingOptions,
  PebRenderElementModel,
  PebRenderContainer,
  PebMap,
  PebPage,
  PebViewPage,
  isAnchorLink,

} from '@pe/builder/core';
import {
  getCascadeStylesByWidth,
  getVectorStyles,
  gridLayout,
  viewElementStyles,
  arrangeLayoutPositions,
  PebLinkedList,
  deserializeLinkedList,
  serializeLinkedList,
  resolveRowAndColByIndex,
  isVector,
  cloneElementDef,
  clonePlainObject,
  getNormalizedKey,
  getDeltaByLanguage,
  getSortedScreens,
  toPebMap,
  getText,
} from '@pe/builder/render-utils';

export const toElement = (
  elm: PebElementDefTree,
  screens: PebScreen[],
  parent: PebElementDefTree | undefined,
  languageKey?: string,
): PebClientElm => {
  const defs = screens.reduce((acc, screen) => {
    let styles = getCascadeStylesByWidth(elm.styles, screens, screen.width, PEB_ROOT_SCREEN_KEY);
    const parentStyles = getCascadeStylesByWidth(parent?.styles, screens, screen.width, PEB_ROOT_SCREEN_KEY);

    let vector: PebViewVector | undefined;
    if (isVector(elm) && elm.data?.vector) {
      const vectorRenderer = getVectorStyles(styles);
      styles = vectorRenderer?.host ?? styles;
      vector = { styles: vectorRenderer?.inner ?? {}, vector: elm.data.vector };
    }

    styles.zIndex = (parent?.children?.length ?? 0) - elm.index;

    acc[screen.key] = {
      visible: styles.display !== 'none',
      style: viewElementStyles(elm, styles, screen, parentStyles),
      pebStyles: styles,
      fill: styles.fill,
      vector,
    };

    return acc;
  }, {} as PebValueByScreen<PebClientElementDef>);

  return {
    id: elm.id,
    name: elm.name ? getNormalizedKey(elm.name) : '',
    type: elm.type,
    parent: elm.parent,
    text: getText(elm, languageKey),
    children: [],
    prev: elm.prev,
    next: elm.next,
    defs,
    animations: elm.animations,
    data: elm.data,
    integration: elm.integration,
    interactions: elm.interactions,
    design: elm.design,
    versionNumber: elm.versionNumber,
    link: elm.link,
  };
};

export const toTree = (value: PebElementDef[]): PebElementDefTree[] => {
  /** Elements definitions array to map for quick access by id. */
  const defs = new Map<string, PebElementDefTree>(
    value.map(def => [def.id, { ...def, children: [], index: 0 }])
  );
  /**
   *  Usually the document is only single root element,
   *  but can have multiple root elements, e.g. in case of stored shapes
   */
  const rootElements: PebElementDefTree[] = [];

  defs.forEach((def) => {
    if (!def.parent) {
      rootElements.push(def);
    } else {
      const parent = defs.get(def.parent.id);
      if (parent?.children?.length === 0) {
        let next: PebElementDefTree | null = def;
        while (next) {
          if (!next.deleted) {
            parent.children.push(next);
          }
          next = next.next ? defs.get(next.next) ?? null : null;
        }

        let prev: PebElementDefTree | null = def.prev ? defs.get(def.prev) ?? null : null;
        while (prev) {
          if (!prev.deleted) {
            parent.children.unshift(prev);
          }
          prev = prev.prev ? defs.get(prev.prev) ?? null : null;
        }

        parent.children.forEach((elm, idx) => elm.index = idx);
      }
    }
  });

  handleGridElementDef(defs);

  return rootElements;
};

function handleGridElementDef(map: Map<string, PebElementDefTree>) {
  const defs = Array.from(map.values());
  defs.filter(def => isContextTableDesign(def.design)).forEach((element) => {
    const design = element.design as PebContextTableDesign;
    const templateCell = design?.templateCell ? map.get(design.templateCell) : undefined;

    if (!templateCell) {
      return;
    }

    const { gridTemplateColumns, gridTemplateRows } = element.styles[PEB_ROOT_SCREEN_KEY];
    const colCount = gridTemplateColumns?.length ?? 0;
    const rowCount = gridTemplateRows?.length ?? 0;
    const cloneCount = rowCount * colCount;
    const list = new PebLinkedList<PebElementDefTree>();

    for (let i = 0; i < cloneCount; i += 1) {
      const cloned = cloneElementDefTree(templateCell);
      const { row, column } = resolveRowAndColByIndex(i, rowCount, colCount);
      cloned.styles[PEB_ROOT_SCREEN_KEY].layoutPosition = { row, column };

      list.add(cloned);
    }

    element.children = [...deserializeLinkedList(serializeLinkedList(list))];
  });
};

function cloneElementDefTree(element: PebElementDefTree): PebElementDefTree {
  const cloned = cloneElementDef(element) as PebElementDefTree;
  cloned.id = pebGenerateId();
  cloned.children = element.children?.map(child => ({
    ...cloneElementDefTree(child), parent: { id: cloned.id, type: cloned.type },
  }));

  return cloned;
};

export const toDocument = (
  elements: PebElementDef[],
  options: PebClientRenderingOptions,
): PebClientElm => {
  const sortedScreens = getSortedScreens(options.screens);

  const recursive = (defOrg: PebElementDefTree, parent: PebElementDefTree | undefined): PebClientElm | undefined => {
    const def = produce(defOrg, (draft) => {
      fixGridStyles(draft);
      fixLinks(draft, options.pages, toPebMap(elements));
    });

    const elm = toElement(def, sortedScreens, parent, options.languageKey);
    elm.children = def.children?.map(child => recursive(child, def)).filter(elm => !!elm) as PebClientElm[];

    return elm;
  };

  const rootElements = toTree(elements).map(root => recursive(root, undefined));

  return rootElements.find(elm => elm?.type === PebElementType.Document) as PebClientElm;
};

export function toRenderElement(
  element: PebClientElm,
  screenKey: string,
  pageId: string,
  container: PebRenderContainer,
  languageKey?: string,
): PebRenderElementModel {
  const screenStyles: any = {};
  const pebStyles: any = {};

  Object.entries(element.defs).forEach(([screenKey, def]) => {
    screenStyles[screenKey] = def.style;
    pebStyles[screenKey] = def.pebStyles;
  });

  return {
    ...element,
    ...element.defs[screenKey],
    children: element.children.map(elm => toRenderElement(elm, screenKey, pageId, container, languageKey)),
    text: element.text && languageKey ? getText(element, languageKey) : element.text,
    page: pageId,
    container,
    screenKey: screenKey,
    defs: { screenStyles, pebStyles },
  };
}

export function pullElement(element: PebClientElm, master: PebClientElm): PebClientElm {
  if (!master) {
    return element;
  }

  let children = [...element.children];
  let position = 'top';
  let topIndex = 0;

  master.children.forEach((masterElm) => {
    if (masterElm.name?.toLowerCase().includes('head')) {
      position = 'top';
    }
    else if (masterElm.name?.toLowerCase().includes('foot')) {
      position = 'bottom';
    }

    position === 'top'
      ? children.splice(topIndex, 0, masterElm)
      : children.push(masterElm);

    position === 'top' && topIndex++;
  });

  children = children.map(elm => ({ ...elm, next: null, prev: null, parent: { id: element.id, type: element.type } }));

  const elm = {
    ...element,
    defs: master.defs,
    children,
  };

  return elm as PebClientElm;
}

export function startUrlWithSlash(url: string): string {
  return `${!url?.startsWith('/') ? '/' : ''}${url}`;
}

export function getUrlWithoutParams(url: string): string {
  if (!url) {
    return '';
  }

  return url.split('?')[0].split('#')[0];
}

export function cloneElement(value: PebClientElm, cloneChildren = true) {
  const elm = value;

  const id = pebGenerateId();

  let children: PebClientElm[] = [];
  if (cloneChildren) {
    const list = new PebLinkedList<PebClientElm>();
    for (const child of elm.children) {
      list.add({ ...cloneElement({ ...child, parent: { id, type: elm.type } }) });
    }

    children = [...deserializeLinkedList(serializeLinkedList(list))];
  }

  const clone: PebClientElm = {
    ...elm,
    id,
    children,
    link: elm.link ? { ...elm.link } : undefined,
    defs: clonePlainObject(elm.defs),
    data: clonePlainObject(elm.data),
  };

  return clone;
}

export interface PebFontProperties {
  normal: Set<number>;
  italic: Set<number>;
}

export const collectFonts = (defs: PebElementDef[], languages: PebLanguage[], screens: PebScreen[]) => {
  const pageFonts = new Map<string, PebFontProperties>();

  defs.forEach((def) => {
    const fonts = getFonts(def, languages, screens);
    for (const [name, props] of fonts.entries()) {
      const font = pageFonts.get(name);
      if (font) {
        props.italic.forEach((w) => {
          font.italic.add(w);
        });
        props.normal.forEach((w) => {
          font.normal.add(w);
        });
      } else {
        pageFonts.set(name, props);
      }
    }
  });

  const result: any = {};

  for (const [key, value] of pageFonts) {
    result[key] = { normal: [...value.normal], italic: [...value.italic] };
  }

  if (Object.keys(result).length === 0) {
    result[PebDefaultTextStyles.fontFamily] = { normal: [400, 700], italic: [] };
  }

  return result;
};

export const getFonts = (elm: PebElementDef, languages: PebLanguage[], screens: PebScreen[]) => {
  const text = elm.data?.text;

  const { fontFamily, fontWeight, italic } = PebDefaultTextStyles;
  const fonts = new Map<string, PebFontProperties>();

  if (text) {
    screens.forEach((screen: PebScreen) => {
      const textStyles = elm.styles[screen.key]?.textStyles;
      addFontToCollection(
        fonts,
        textStyles?.fontFamily ?? fontFamily,
        textStyles?.fontWeight ?? fontWeight,
        italic,
      );

      if (text[screen.key]) {
        languages.forEach((language) => {
          const delta = getDeltaByLanguage(elm.type, text, language.key);
          if (delta) {
            delta.ops.forEach((op: any) => {
              const name = (op.attributes?.fontFamily ?? fontFamily) as string;
              const weight = (op.attributes?.fontWeight ?? fontWeight) as number;
              const oblique = (op.attributes?.italic ?? italic) as boolean;

              addFontToCollection(fonts, name, weight, oblique);
            });
          }
        });
      }
    });
  }

  return fonts;
};

function fixGridStyles(draft: WritableDraft<PebElementDefTree>) {
  Object.keys(draft.styles ?? {}).forEach((key) => {
    let defStyle = draft.styles[key];
    let layout = defStyle.layout;

    if (layout && isGridLayout(defStyle.layout)) {
      const isGrid = draft.type === PebElementType.Grid;
      isGrid && (layout = gridLayout(defStyle));

      const layoutPositions = draft.children?.map(item =>
        ({ ...PEB_DEFAULT_LAYOUT_POSITION, fill: isGrid, ...item.styles[key]?.layoutPosition })
      ) ?? [];

      const children = draft.children ?? [];
      arrangeLayoutPositions(layoutPositions, layout).forEach((lp, idx) => {
        const item = children[idx];
        const style = item?.styles[key];
        style && (style.layoutPosition = lp);
      });

      draft.styles[key].layout = layout;
    }
  });
}

function fixLinks(
  elm: WritableDraft<PebElementDefTree>,
  pages: PebMap<PebPage | PebViewPage>,
  elements: PebMap<PebElementDef>,
) {
  const link = elm.link;
  if (!link) {
    return;
  }

  if (isInternalPage(link)) {
    const page = pages[link.pageId];
    if (page) {
      link.url = page.variant === PebPageVariant.Front ? '/' : startUrlWithSlash(page.url);
    }
  }
  else if (isAnchorLink(link)) {
    const reference = elements[link.anchorElementId];
    if (reference?.name) {
      link.fragment = getNormalizedKey(reference.name);
    }
  }
}

function addFontToCollection(fonts: Map<string, PebFontProperties>, name: string, weight: number, oblique: boolean) {
  const font = fonts.get(name);
  if (font) {
    if (oblique) {
      font.italic.add(weight);
    } else {
      font.normal.add(weight);
    }
  } else if (oblique) {
      fonts.set(name, { italic: new Set([weight]), normal: new Set() });
  } else {
    fonts.set(name, { italic: new Set(), normal: new Set([weight]) });
  }
}
