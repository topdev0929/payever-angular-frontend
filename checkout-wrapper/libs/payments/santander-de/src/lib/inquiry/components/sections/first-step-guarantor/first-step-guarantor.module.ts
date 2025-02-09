import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
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
// eslint-disable-next-line
import { AddressFormComponent } from '@pe/checkout/sections/address-edit';
import { UiModule } from '@pe/checkout/ui';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { PERSON_TYPE, PersonTypeEnum } from '../../../../shared';
import { SectionsComponentsModule } from '../../../../shared/sections/components';

import { FirstStepGuarantorFormComponent } from './first-step-guarantor.component';

@NgModule({
  declarations: [
    FirstStepGuarantorFormComponent,
  ],
  imports: [
    AddressFormComponent,
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
      useValue: PersonTypeEnum.Guarantor,
    },
  ],
  exports: [
    FirstStepGuarantorFormComponent,
  ],
})
export class FirstStepGuarantorModule {

  resolveComponent(): Type<FirstStepGuarantorFormComponent> {
    return FirstStepGuarantorFormComponent;
  }
}
