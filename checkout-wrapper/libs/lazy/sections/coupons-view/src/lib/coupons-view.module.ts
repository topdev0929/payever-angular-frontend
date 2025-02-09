import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { CouponsModule } from '@pe/checkout/coupons';
import { UtilsModule } from '@pe/checkout/utils';

import { CouponsViewContainerComponent } from './components';


@NgModule({
  imports: [
    CommonModule,

    UtilsModule,

    CouponsModule,
  ],
  declarations: [
    CouponsViewContainerComponent,
  ],
  providers: [
  ],
})
export class CouponsViewModule {
  resolveCouponsViewContainerComponent(): Type<CouponsViewContainerComponent> {
    return CouponsViewContainerComponent;
  }
}
