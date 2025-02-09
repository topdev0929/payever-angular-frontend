import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { PersonTypeEnum, PERSON_TYPE } from '@pe/checkout/santander-de-pos/shared';
import { PersonalModule } from '@pe/checkout/santander-de-pos/shared/personal';
import { ContinueButtonModule } from '@pe/checkout/ui/continue-button';

import { InquireFormPersonalInfoBorrowerComponent } from './components';

@NgModule({
  declarations: [
    InquireFormPersonalInfoBorrowerComponent,
  ],
  imports: [
    CommonModule,
    PersonalModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    ContinueButtonModule,
  ],
  providers: [
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Customer,
    },
  ],
})
export class InquirePersonalInfoBorrowerModule {
  resolveComponent(): Type<InquireFormPersonalInfoBorrowerComponent> {
    return InquireFormPersonalInfoBorrowerComponent;
  }
}
