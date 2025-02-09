import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { CouponsComponent } from './coupons.component';

@NgModule({
  declarations: [
    CouponsComponent,
  ],
  imports: [
    CommonModule,
    UiModule,
    UtilsModule,
  ],
  exports: [
    CouponsComponent,
  ],
})
export class CouponsModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<CouponsComponent> {
    return CouponsComponent;
  }
}
