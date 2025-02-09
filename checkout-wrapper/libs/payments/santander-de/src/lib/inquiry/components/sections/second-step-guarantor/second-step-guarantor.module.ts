import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { UiModule } from '@pe/checkout/ui';
import { UtilsModule } from '@pe/checkout/utils';

import { SectionsComponentsModule } from '../../../../shared/sections/components';
import { PERSON_TYPE, PersonTypeEnum } from '../../../../shared/types';

import { SecondStepGuarantorFormComponent } from './second-step-guarantor.component';


@NgModule({
  declarations: [
    SecondStepGuarantorFormComponent,
  ],
  imports: [
    SectionsComponentsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsDateModule,
    CheckoutFormsInputModule,
    CheckoutFormsInputCurrencyModule,
    UiModule,
    UtilsModule,
  ],
  providers: [
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Guarantor,
    },
  ],
  exports: [
    SecondStepGuarantorFormComponent,
  ],
})
export class SecondStepGuarantorModule {
  resolveComponent(): Type<SecondStepGuarantorFormComponent> {
    return SecondStepGuarantorFormComponent;
  }
}
