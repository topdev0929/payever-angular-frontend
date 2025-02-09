import {
  ChangeDetectionStrategy,
  Component,
  Input,
  createNgModule,
} from '@angular/core';

import { BaseSelector } from '../base-selector.directive';
import { LAYOUT_SELECTOR_CONFIG } from '../selectors.config';

@Component({
  selector: 'header-selector',
  template: '<ng-container #container></ng-container>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderSelectorComponent extends BaseSelector {

  @Input() asCustomElement: boolean;

  public loadComponent() {
    const config = LAYOUT_SELECTOR_CONFIG[this.layoutType];
    config
      .header
      .import()
      .then((module) => {
        const moduleRef = createNgModule(module, this.injector);
        this.viewContainerRef.clear();
        const componentRef = this.viewContainerRef.createComponent(moduleRef.instance.resolveComponent());
        const { instance } = componentRef;
        instance.asCustomElement = this.asCustomElement;
        componentRef.hostView.markForCheck();
      });
  }
}
