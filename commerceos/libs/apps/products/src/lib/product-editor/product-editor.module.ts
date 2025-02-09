import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';
import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { DragulaModule } from 'ng2-dragula';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { ColorPickerModule } from '@pe/color-picker';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { FormComponentsColorPickerModule, FormCoreModule, FormModule } from '@pe/forms';
import { I18nModule, LANG } from '@pe/i18n';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { PETextEditorModule } from '@pe/text-editor';
import { ThirdPartyFormModule } from '@pe/tpm';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebMessagesModule,
  PebProductPickerModule,
  PebSelectModule,
  PeSearchModule,
} from '@pe/ui';
import { InputMaskModule } from '@pe/shared/utils';

import { ApolloConfigModule } from '../app.apollo.module';
import { SharedModule } from '../shared/shared.module';

import { ProductsEditorAssetsDragAndDropComponent } from './assets/assets-drag-and-drop/assets-drag-and-drop.component';
import { AssetsShippingIconsComponent } from './assets/assets-shipping-icons/assets-shipping-icons.component';
import {
  ColorPickerComponent,
  CountryPickerComponent,
  EditorDescriptionComponent,
  EditorPicturesComponent,
  LanguagePickerComponent,
  PeProductsAutocompleteComponent,
} from './components';
import {
  EditorAttributesSectionComponent,
  EditorCategorySectionComponent,
  EditorChannelsSectionComponent,
  EditorInventorySectionComponent,
  EditorMainSectionComponent,
  EditorRecommendationsSectionComponent,
  EditorRecurringBillingSectionComponent,
  EditorSeoSectionComponent,
  EditorShippingSectionComponent,
  EditorTaxesSectionComponent,
  EditorVariantsSectionComponent,
  EditorVisibilitySectionComponent,
  ProductsEditorContentSectionComponent,
  ProductsPricingSectionComponent,
  VariantEditorComponent,
} from './components/editor-sections';
import { OptionTypePickerComponent } from './components/option-type-picker/option-type-picker.component';
import { ProductTypeComponent } from './components/product-type/product-type.component';
import { EditorComponent } from './containers/editor/editor.component';
import { ProductsEditorRoutingModule } from './product-editor-routing.module';
import { CountriesResolver } from './resolvers/countries.resolver';
import { LanguagesResolver } from './resolvers/languages.resolve';
import { ProductResolver } from './resolvers/product.resolver';
import { RecurringBillingResolver } from './resolvers/recurring-billing.resolver';
import { VatRatesResolver } from './resolvers/vat-rates.resolver';
import {
  AttribuiteApiService,
  ChannelsService,
  SectionsService as ProductSectionsService,
  VariantStorageService,
  VatRatesApiService,
} from './services';
import { CategoryPredictionApiService } from './services/category-prediction.service';
import { ContactsDialogService } from './services/contacts-dialog.service';
import { CountryService } from './services/country.service';
import { LanguageService } from './services/language.service';
import { VariantState } from './store/variant.state';


export const DragulaModuleForRoot = DragulaModule;
export const NgxsFeatureModule = NgxsModule.forFeature([VariantState]);


const EXP: any[] = [
  AssetsShippingIconsComponent,
  ProductsEditorAssetsDragAndDropComponent,
  EditorComponent,
  EditorPicturesComponent,
  EditorMainSectionComponent,
  ProductsPricingSectionComponent,
  ProductsEditorContentSectionComponent,
  EditorAttributesSectionComponent,
  EditorInventorySectionComponent,
  EditorCategorySectionComponent,
  EditorChannelsSectionComponent,
  EditorRecommendationsSectionComponent,
  EditorRecurringBillingSectionComponent,
  EditorShippingSectionComponent,
  EditorTaxesSectionComponent,
  EditorVariantsSectionComponent,
  EditorVisibilitySectionComponent,
  EditorSeoSectionComponent,
  ProductTypeComponent,
  VariantEditorComponent,
  EditorDescriptionComponent,
  ColorPickerComponent,
  PeProductsAutocompleteComponent,
  CountryPickerComponent,
  LanguagePickerComponent,
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    NgxsFeatureModule,
    MatProgressSpinnerModule,
    ApolloConfigModule,
    ApolloModule,
    HttpLinkModule,
    FormsModule,
    ReactiveFormsModule,
    FormModule,
    ThirdPartyFormModule,
    DragDropModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatExpansionModule,
    DragulaModuleForRoot,
    MediaModule,
    PETextEditorModule,
    FormComponentsColorPickerModule,
    ColorPickerModule,
    FormCoreModule,
    ProductsEditorRoutingModule,
    I18nModule,
    SharedModule,
    ScrollingModule,

    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebFormFieldTextareaModule,
    PebMessagesModule,
    PebSelectModule,
    ConfirmationScreenModule,
    PebFormBackgroundModule,
    PebButtonModule,
    PebButtonModule,
    PebProductPickerModule,
    PeSearchModule,
    InputMaskModule
  ],
  exports: [],
  declarations: [...EXP, OptionTypePickerComponent],
  providers: [
    ProductResolver,
    RecurringBillingResolver,
    ChannelsService,
    ContactsDialogService,
    VatRatesApiService,
    CategoryPredictionApiService,
    AttribuiteApiService,
    VatRatesResolver,
    MediaUrlPipe,
    PeAlertDialogService,
    ProductSectionsService,
    LanguageService,
    CountryService,
    VariantStorageService,
    CountriesResolver,
    LanguagesResolver,
    PeAlertDialogService,
    { provide: LANG, useValue: 'en' },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ProductsEditorModule {
}
