import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';

import { MainAddressSummaryComponent } from './address-summary.component';

@NgModule({
  declarations: [
    MainAddressSummaryComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    MainAddressSummaryComponent,
  ],
})
export class AddressSummaryModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<MainAddressSummaryComponent> {
    return MainAddressSummaryComponent;
  }
}
