import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, createNgModule } from '@angular/core';

import { FlowInterface } from '@pe/checkout/types';

import { BaseSelector } from '../base-selector.directive';
import { LAYOUT_SELECTOR_CONFIG } from '../selectors.config';

@Component({
  selector: 'main-selector',
  template: '<ng-container #container></ng-container>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSelectorComponent extends BaseSelector {

  @Input() asCustomElement: boolean;

  @Input() forceHideQRSwitcher: boolean;

  @Input() navigateOnSuccess: boolean;

  @Input() referenceEditEnabled: boolean;

  @Output() submitSuccess = new EventEmitter<FlowInterface>();

  public loadComponent() {
    const config = LAYOUT_SELECTOR_CONFIG[this.layoutType];
    config
      .main
      .import()
      .then((module) => {
        const moduleRef = createNgModule(module, this.injector);
        this.viewContainerRef.clear();
        const componentRef = this.viewContainerRef.createComponent(moduleRef.instance.resolveComponent());
        config.main.init(componentRef, {
          asCustomElement: this.asCustomElement,
          forceHideQRSwitcher: this.forceHideQRSwitcher,
          navigateOnSuccess: this.navigateOnSuccess,
          referenceEditEnabled: this.referenceEditEnabled,
          submitSuccess: this.submitSuccess,
        });
      });
  }
}
