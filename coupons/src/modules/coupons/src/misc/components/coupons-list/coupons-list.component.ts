import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'pe-coupons-list',
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeCouponsListComponent {}
