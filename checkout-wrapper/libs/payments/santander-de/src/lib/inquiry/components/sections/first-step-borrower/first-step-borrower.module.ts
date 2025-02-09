import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { FormUtilsModule } from '@pe/checkout/form-utils';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutAddressAutocompleteModule } from '@pe/checkout/forms/address-autocomplete';
import { CheckoutFormsDateModule } from '@pe/checkout/forms/date';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { UiModule } from '@pe/checkout/ui';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { AdditionalStepsModule } from '../../../../additional-steps';
import { PERSON_TYPE, PersonTypeEnum } from '../../../../shared';
import { SectionsComponentsModule } from '../../../../shared/sections/components';

import { FirstStepBorrowerFormComponent } from './first-step-borrower.component';

@NgModule({
  declarations: [
    FirstStepBorrowerFormComponent,
  ],
  imports: [
    AdditionalStepsModule,
    SectionsComponentsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CheckoutFormsCoreModule,
    CheckoutFormsInputModule,
    CheckoutAddressAutocompleteModule,
    CheckoutFormsDateModule,
    FormUtilsModule,
    UiModule,
    MatProgressSpinnerModule,
    CheckoutUiTooltipModule,
  ],
  providers: [
    {
      provide: PERSON_TYPE,
      useValue: PersonTypeEnum.Customer,
    },
  ],
  exports: [
    FirstStepBorrowerFormComponent,
  ],
})
export class FirstStepBorrowerModule {
  resolveComponent(): Type<FirstStepBorrowerFormComponent> {
    return FirstStepBorrowerFormComponent;
  }
}
