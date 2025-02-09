import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Store } from '@ngxs/store';

import {
  PebMap,
  PebRenderElementModel,
  PebScreen,
  PebTheme,
  PebViewPage,
  isImage,
} from '@pe/builder/core';
import { getAllScreenStyles, getInitialKeyframeClass } from '@pe/builder/render-utils';
import { PebRenderUpdateAction } from '@pe/builder/view-actions';

export const PEB_LAZY_CLASS = 'peb-lazy-image';
export const PEB_LAZY_LOADED_CLASS = 'peb-lazy-loaded';

@Injectable()
export class PebViewStylesService {
  pageStyles: PebMap<HTMLElement> = {};
  pageExternalLinks: PebMap<HTMLElement> = {};
  private renderer!: Renderer2;

  constructor(
    private readonly store: Store,
    private readonly rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  addPageExternalStyles(theme: PebTheme, page: PebViewPage) {
    if (this.pageExternalLinks[page.id]) {
      return;
    }

    const link = this.renderer.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', `/styles/themes/${theme.id}/version/${theme.versionNumber}/pages/${page.id}.css`);
    this.renderer.appendChild(this.document.head, link);
    this.pageExternalLinks[page.id] = link;
  }

  addPageStyles(pageId: string, elements: PebRenderElementModel[], screens: PebScreen[]) {
    this.removePageStyles(pageId);

    const styleText = getAllScreenStyles(elements, screens);
    const styleElm = this.renderer.createElement(`style`);
    styleElm.setAttribute('id', `page-${pageId}`);
    this.renderer.appendChild(styleElm, this.renderer.createText(styleText));
    this.renderer.appendChild(this.document.head, styleElm);
    this.pageStyles[pageId] = styleElm;
  }

  setElementClasses(elements: PebRenderElementModel[]) {
    const updatePayload = [
      ...elements.map(elm => ({
        id: elm.id,
        style: {
          host: undefined, wrapper: undefined,
          class: {
            [`elm-${elm.id}`]: true,
            [PEB_LAZY_CLASS]: isImage(elm.fill),
            ...getInitialKeyframeClass(elm),
          },
        },
      })),
      ...elements.filter(elm => elm.style.wrapper !== undefined).map(elm => ({
        id: elm.id, style: { wrapper: {} },
      })),
    ];

    this.store.dispatch(new PebRenderUpdateAction(updatePayload as any));
  }

  clearAllExternalStyles(excludePageIds: string[]) {
    Object.keys(this.pageExternalLinks).filter(key => !excludePageIds.some(id => id === key))
      .forEach(pageId => this.removePageExternalStyles(pageId));
  }

  clearAllStyles(excludePageIds: string[]) {
    Object.keys(this.pageStyles).filter(key => !excludePageIds.some(id => id === key))
      .forEach(pageId => this.removePageStyles(pageId));
  }

  removePageExternalStyles(pageId: string) {
    if (this.pageExternalLinks[pageId]) {
      this.pageExternalLinks[pageId].remove();
      delete this.pageExternalLinks[pageId];
    }
  }

  removePageStyles(pageId: string) {
    if (this.pageStyles[pageId]) {
      this.pageStyles[pageId].remove();
      delete this.pageStyles[pageId];
    }
  }
}
