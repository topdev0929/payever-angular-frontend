import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';

import { AbstractSelectorModule } from '@pe/checkout/main/selectors';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { AddressComponent } from './address.component';

@NgModule({
  declarations: [
    AddressComponent,
  ],
  imports: [
    CommonModule,
    UiModule,
    UtilsModule,
  ],
  exports: [
    AddressComponent,
  ],
})
export class AddressModuleMain extends AbstractSelectorModule {
  resolveComponent(): Type<AddressComponent> {
    return AddressComponent;
  }
}
