import { CommonModule } from '@angular/common';
import { Type, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { CheckoutAddressAutocompleteModule } from '@pe/checkout/forms/address-autocomplete';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { UiModule } from '@pe/checkout/ui';
import { CheckoutUiIconModule } from '@pe/checkout/ui/icon';

import {
  UserCheckFormComponent,
  UserCheckFormStylesComponent,
  UserLoginFormComponent,
} from './components';
import { UserService } from './services';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,

    CheckoutFormsCoreModule,
    CheckoutAddressAutocompleteModule,
    CheckoutFormsInputModule,
    UiModule,
    CheckoutUiIconModule,
  ],
  declarations: [
    UserCheckFormComponent,
    UserCheckFormStylesComponent,
    UserLoginFormComponent,
  ],
  exports: [
    UserCheckFormComponent,
    UserLoginFormComponent,
  ],
  providers: [
    UserService,
  ],
})
export class UserEditModule {
  resolveUserCheckFormComponent(): Type<UserCheckFormComponent> {
    return UserCheckFormComponent;
  }

  resolveUserLoginFormComponent(): Type<UserLoginFormComponent> {
    return UserLoginFormComponent;
  }
}
