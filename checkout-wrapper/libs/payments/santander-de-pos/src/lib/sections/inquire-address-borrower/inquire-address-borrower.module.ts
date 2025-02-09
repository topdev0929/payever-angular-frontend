import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PersonTypeEnum, PERSON_TYPE } from '@pe/checkout/santander-de-pos/shared';
import { AddressFormComponent } from '@pe/checkout/sections/address-edit';
import { AddressViewModule } from '@pe/checkout/sections/address-view';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';

import { InquireFormAddressBorrowerComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContinueButtonModule,
    AddressFormComponent,
    AddressViewModule,
  ],
  declarations: [
    InquireFormAddressBorrowerComponent,
  ],
  providers: [
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Customer,
    },
  ],
})
export class InquireAddressBorrowerModule {
  resolveComponent(): Type<InquireFormAddressBorrowerComponent> {
    return InquireFormAddressBorrowerComponent;
  }
}
