import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'finexp-ui-shadow-root-wrapper',
  template: '<ng-content></ng-content>',
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class UIShadowRootWrapperComponent {
}
