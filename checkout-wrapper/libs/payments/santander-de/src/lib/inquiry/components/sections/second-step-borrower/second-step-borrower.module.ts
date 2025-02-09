import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
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
import { IncomeService, RatesCalculationService } from '../../../../shared/services';
import { PERSON_TYPE, PersonTypeEnum } from '../../../../shared/types';

import { SecondStepBorrowerFormComponent } from './second-step-borrower.component';

@NgModule({
  declarations: [
    SecondStepBorrowerFormComponent,
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
    IncomeService,
    RatesCalculationService,
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Customer,
    },
  ],
  exports: [
    SecondStepBorrowerFormComponent,
  ],
})
export class SecondStepBorrowerModule {
  resolveComponent(): Type<SecondStepBorrowerFormComponent> {
    return SecondStepBorrowerFormComponent;
  }
}
