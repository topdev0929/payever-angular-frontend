import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { PebRenderElementModel } from '@pe/builder/core';
import { isSection } from '@pe/builder/render-utils';
import { PebViewState } from '@pe/builder/view-state';

@Injectable()
export class PebViewElementService {
  constructor(
    private readonly store: Store,
  ) {
  }

  getElementById(elementId: string): PebRenderElementModel | undefined {
    return this.store.selectSnapshot(PebViewState.elements)[elementId];
  }

  getElementByName(name: string): PebRenderElementModel | undefined {
    const elements = this.store.selectSnapshot(PebViewState.elements);
    const str = name.toLowerCase();

    return Object.values(elements).find(elm => elm.name && elm.name.toLowerCase() === str);
  }

  getRootElement(): PebRenderElementModel | undefined {
    return this.store.selectSnapshot(PebViewState.rootElement);
  }

  getAllElements(): { [id: string]: PebRenderElementModel } {
    return this.store.selectSnapshot(PebViewState.elements);
  }

  getAllNestedElements(element: PebRenderElementModel): { [id: string]: PebRenderElementModel } {
    const map = {};
    this.findAllNestedElementsRecursive(element, map);

    return map;
  }

  getAllParents(element: PebRenderElementModel): PebRenderElementModel[] {
    const parents: PebRenderElementModel[] = [];
    const elements = this.store.selectSnapshot(PebViewState.elements);
    let parent = elements[element.parent?.id];
    while (parent) {
      parents.push(parent);
      parent = elements[parent.parent?.id];
    }

    return parents;
  }

  findSection(element: PebRenderElementModel | undefined): PebRenderElementModel | undefined {
    if (!element) {
      return undefined;
    }

    if (isSection(element)) {
      return element;
    }

    if (!element.parent) {
      return undefined;
    }

    return this.findSection(element.parent);
  }

  private findAllNestedElementsRecursive(element: PebRenderElementModel, map: { [id: string]: PebRenderElementModel }) {
    if (!element) {
      return;
    }
    map[element.id] = element;
    element.children?.forEach(elm => this.findAllNestedElementsRecursive(elm, map));
  }
}
