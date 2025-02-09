import { DOCUMENT } from '@angular/common';
import {
  AfterViewChecked,
  Directive,
  EmbeddedViewRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { isEqual } from 'lodash';
import { Subject } from 'rxjs';

import { PebRenderElementModel } from '@pe/builder/core';
import { toInlineStyle } from '@pe/builder/render-utils';

@Directive({
  selector: '[pebRender]',
})
export class PebRenderDirective implements AfterViewChecked, OnChanges, OnDestroy {  
  @Input() pebRender!: { [id: string]: PebRenderElementModel };
  @Input() pebRenderTemplate!: TemplateRef<any>;

  private destroy$ = new Subject<void>();
  private viewModels = new Map<string, RenderingViewModel>();  
  private toRelocate: RenderingViewModel[] = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private viewContainer: ViewContainerRef,
  ) {
  }

  ngAfterViewChecked(): void {
    if (!this.toRelocate.length) {
      return;
    }

    this.relocateElements(this.toRelocate);
    this.toRelocate = [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleElementChanges(
      changes.pebRender.previousValue ?? {},
      changes.pebRender.currentValue ?? {},
    );
  }

  handleElementChanges(
    previousElements: { [id: string]: PebRenderElementModel },
    currentElements: { [id: string]: PebRenderElementModel },
  ) {
    Object.entries(currentElements).forEach(([id, currElm]) => {
      const preElm = previousElements[id];
      let viewModel = this.viewModels.get(id);

      if (!preElm || !viewModel) {
        viewModel = this.createView(currElm);
        this.toRelocate.push(viewModel);
      }
      else if (preElm.updateVersion !== currElm.updateVersion || preElm.parent?.id !== currElm.parent?.id) {
        viewModel.view.context = { $implicit: currElm };
        viewModel.element = currElm;

        !isEqual(preElm.style?.wrapper, currElm.style?.wrapper) && this.updateWrapperStyles(viewModel);

        if (preElm.parent?.id !== currElm.parent?.id) {
          this.toRelocate.push(viewModel);
        }
      }
    });

    this.viewModels.forEach((entry) => {
      if (!currentElements[entry.element.id]) {
        this.destroyView(entry);
      }
    });
  }

  createView(element: PebRenderElementModel): RenderingViewModel {
    const view = this.viewContainer.createEmbeddedView(
      this.pebRenderTemplate,
      { $implicit: element }
    );
    const model = { element, view };
    this.viewModels.set(element.id, model);

    return model;
  }

  destroyView(viewModel: RenderingViewModel) {
    viewModel.view.destroy();
    this.viewModels.delete(viewModel.element.id);
  }

  relocateElements(elements: RenderingViewModel[]) {
    elements.forEach((viewModel) => {
      const parent = viewModel.element.parent;
      if (!parent) {
        return;
      }

      const root = this.getRootNode(parent?.id);
      const wrapper = this.getOrCreateWrapper(viewModel);
      viewModel.view.rootNodes
        .filter(node => node.nodeType !== Node.COMMENT_NODE)
        .forEach((e: HTMLElement) => {
          if (wrapper) {
            wrapper.appendChild(e);
            root?.appendChild(wrapper);
          } else {
            root?.appendChild(e);
          }
        });
    });
  }

  destroyAllViews() {
    this.viewModels.forEach((entry) => {
      entry.view.destroy();
    });

    this.viewModels.clear();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getRootNode(id: string): HTMLElement | undefined {
    return this.viewModels.get(id)?.view.rootNodes.find((n: any) => n.nodeType === Node.ELEMENT_NODE);
  }

  private getOrCreateWrapper(model: RenderingViewModel): HTMLElement | undefined {
    const elm = model.element;

    if (!elm.style?.wrapper) {
      return undefined;
    }

    if (model.wrapper) {      
      this.updateWrapperStyles(model);

      return model.wrapper;
    }

    const wrapper = this.document.createElement('div');
    wrapper.setAttribute('id', `wrapper-${elm.id}`);
    wrapper.setAttribute('class', `wrapper-${elm.id}`);
    model.wrapper = wrapper;
    this.updateWrapperStyles(model);

    return wrapper;
  }

  private updateWrapperStyles(model: RenderingViewModel) {
    if (!model.wrapper) {
      return;
    }
    model.wrapper.setAttribute('style', toInlineStyle(model.element.style?.wrapper ?? {}));
  }
}

interface RenderingViewModel {
  element: PebRenderElementModel;
  view: EmbeddedViewRef<any>;
  wrapper?: HTMLElement;
}
