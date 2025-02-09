import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';

import { UiModule } from '@pe/checkout/ui';

import { AddressSummaryComponent } from './components';
import { AddressFullNamePipe, AddressLinePipe } from './pipes';

@NgModule({
  imports: [
    CommonModule,
    UiModule,
  ],
  declarations: [
    AddressSummaryComponent,
    AddressFullNamePipe,
    AddressLinePipe,
  ],
  exports: [
    AddressSummaryComponent,
  ],
})
export class AddressViewModule {
  resolveAddressSummaryComponent(): Type<AddressSummaryComponent> {
    return AddressSummaryComponent;
  }
}
