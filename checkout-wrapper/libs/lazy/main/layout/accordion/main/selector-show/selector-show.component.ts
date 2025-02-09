import {
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
  ViewContainerRef,
  createNgModule,
} from '@angular/core';

import { AbstractFlowIdComponent } from '@pe/checkout/core';

import { SELECTOR_TYPES } from './selector-config';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'checkout-main-selector-show',
  template: '<ng-container #container></ng-container>',
})
export class SelectorShowComponent extends AbstractFlowIdComponent {

  @ViewChild('container', { read: ViewContainerRef, static: true }) containerRef: ViewContainerRef;

  @Input() set selector(value: string) {
    if (value in SELECTOR_TYPES) {
      SELECTOR_TYPES[value].import()
        .then((module) => {
          this.containerRef.clear();
          const factory = createNgModule(module, this.injector);
          const componentType = factory.instance.resolveComponent();
          const component = this.containerRef.createComponent(componentType, {
            injector: factory.injector,
          });
          component.changeDetectorRef.detectChanges();

          this.cdr.detectChanges();
        });
    } else {
      throw new Error(`Invalid component\n${JSON.stringify(value)}`);
    }
  }
}
