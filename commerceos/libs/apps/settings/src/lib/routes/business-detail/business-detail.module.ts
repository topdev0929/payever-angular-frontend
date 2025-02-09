import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";
import { MatGoogleMapsAutocompleteModule } from "@angular-material-extensions/google-maps-autocomplete";

import { I18nModule } from "@pe/i18n";
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebListInfoModule,
  PebSelectModule,
  PeInputPickerModule,
  PePickerModule,
} from "@pe/ui";
import { InputMaskModule } from '@pe/shared/utils';

import { BusinessDetailComponent } from "./business-detail.component";
import {
  EditAddressComponent,
  EditBankComponent,
  EditCompanyComponent,
  EditContactComponent,
  EditCurrencyComponent,
  EditTaxesComponent,
  EditTransactionRetentionSettingComponent,
  EditTransactionRetentionSettingSkeletonComponent,
  EditWhitelistComponent,
} from "./components";
import { EditCurrencyStylesComponent } from "./components/edit-currency/edit-currency-styles/edit-currency-styles.component";

const routes: Routes = [
  {
    path: ``,
    children: [
      {
        path: ``,
        component: BusinessDetailComponent,
      },
      {
        path: `:modal`,
        component: BusinessDetailComponent,
      },
    ],
  },
];

const businessDetailRouterModule = RouterModule.forChild(routes);

@NgModule({
  imports: [
    I18nModule,
    PebListInfoModule,
    PebFormFieldInputModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    PebSelectModule,
    PebFormBackgroundModule,
    PebButtonModule,
    businessDetailRouterModule,
    PePickerModule,
    PeInputPickerModule,
    PebButtonToggleModule,
    MatGoogleMapsAutocompleteModule,
    InputMaskModule,
  ],
  declarations: [
    BusinessDetailComponent,
    EditAddressComponent,
    EditBankComponent,
    EditCurrencyComponent,
    EditCompanyComponent,
    EditContactComponent,
    EditTaxesComponent,
    EditWhitelistComponent,
    EditCurrencyStylesComponent,
    EditTransactionRetentionSettingComponent,
    EditTransactionRetentionSettingSkeletonComponent,
  ],
})
export class BusinessDetailModule { }
