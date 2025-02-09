import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { ANALYTICS_FORM_SETTINGS } from '@pe/checkout/analytics';
import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutFormsAutocompleteModule } from '@pe/checkout/forms/google-autocomplete';
import { UiModule } from '@pe/checkout/ui';
import { CheckoutUiIconModule } from '@pe/checkout/ui/icon';
import { UtilsModule } from '@pe/checkout/utils';

import { AddressWrapperComponent } from './components';
import { AddressFormComponent } from './components/address-form';
import { AddressService } from './services';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,

    CheckoutFormsAutocompleteModule,
    CheckoutUiIconModule,
    CheckoutFormsCoreModule,
    UtilsModule,
    UiModule,
    AddressFormComponent,
  ],
  declarations: [
    AddressWrapperComponent,
  ],
  exports: [
    AddressWrapperComponent,
  ],
  providers: [
    AddressService,
    {
      provide: ANALYTICS_FORM_SETTINGS,
      useValue: {
        formName: 'FORM_ADDRESS_EDIT',
      },
    },
  ],
})
export class AddressEditModule {
  resolveAddressWrapperComponent(): Type<AddressWrapperComponent> {
    return AddressWrapperComponent;
  }
}
