import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { CouponsSummaryComponent } from './coupons-summary.component';

@NgModule({
  declarations: [
    CouponsSummaryComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    CouponsSummaryComponent,
  ],
})
export class CouponsSummaryModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<CouponsSummaryComponent> {
    return CouponsSummaryComponent;
  }
}
