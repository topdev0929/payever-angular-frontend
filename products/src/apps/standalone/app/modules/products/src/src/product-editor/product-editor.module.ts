import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxsModule } from '@ngxs/store';

import { FormComponentsColorPickerModule, FormCoreModule, FormModule, ThirdPartyFormModule } from '@pe/forms';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { ColorPickerModule } from '@pe/color-picker';
import { AuthModule } from '@pe/auth';
import { I18nModule, LANG } from '@pe/i18n';
import { PebButtonToggleModule, PebExpandablePanelModule,
  PebFormFieldInputModule, PebMessagesModule, PebSelectModule } from '@pe/ui';

import { TextEditorModule, TextEditorToolbarModule } from '../texteditor';
import { ApolloConfigModule } from '../app.apollo.module';
import { EditorDescriptionComponent } from './components/editor-description/editor-description.component';
import { EditorPicturesComponent } from './components/editor-pictures/editor-pictures.component';
import {
  EditorCategorySectionComponent,
  EditorChannelsSectionComponent,
  EditorInventorySectionComponent,
  EditorMainSectionComponent,
  EditorRecommendationsSectionComponent,
  EditorRecurringBillingSectionComponent,
  EditorShippingSectionComponent,
  EditorTaxesSectionComponent,
  EditorVariantsSectionComponent,
  EditorVisibilitySectionComponent,
  VariantEditorComponent,
} from './components/editor-sections';
import { ProductsEditorContentSectionComponent } from './components/editor-sections/editor-content-section/editor-content-section.component';
import { ProductTypeComponent } from './components/product-type/product-type.component';
import { EditorComponent } from './containers/editor/editor.component';
import { ChannelsService, VariantStorageService, VatRatesApiService } from './services';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { OptionTypePickerComponent } from './components/option-type-picker/option-type-picker.component';
import { SectionsService as ProductSectionsService } from './services';
import { ProductsEditorAssetsDragAndDropComponent } from './assets/assets-drag-and-drop/assets-drag-and-drop.component';
import { AssetsShippingIconsComponent } from './assets/assets-shipping-icons/assets-shipping-icons.component';
import { CurrencyService } from '../shared/services/currency.service';
import { ProductResolver } from './resolvers/product.resolver';
import { RecurringBillingResolver } from './resolvers/recurring-billing.resolver';
import { VatRatesResolver } from './resolvers/vat-rates.resolver';
import { ApiBuilderService } from './services/api-builder.service';
import { ProductsEditorRoutingModule } from './product-editor-routing.module';
import { SharedModule } from '../shared/shared.module';
import { PeProductsAutocompleteComponent } from './components/autocomplete/products-autocomplete.component';
import { EditorAttributesSectionComponent } from './components/editor-sections/editor-attributes-section/editor-attributes-section.component';
import {VariantState} from './store/variant.state';

import { ApolloModule } from 'apollo-angular';
import { HttpLinkModule } from 'apollo-angular-link-http';
import { DragulaModule } from 'ng2-dragula';

export const DragulaModuleForRoot = DragulaModule;
export const AuthModuleForRoot = AuthModule.forRoot();
export const NgxsFeatureModule = NgxsModule.forFeature([VariantState]);


const EXP: any[] = [
  AssetsShippingIconsComponent,
  ProductsEditorAssetsDragAndDropComponent,
  EditorComponent,
  EditorPicturesComponent,
  EditorMainSectionComponent,
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
  ProductTypeComponent,
  VariantEditorComponent,
  EditorDescriptionComponent,
  ColorPickerComponent,
  PeProductsAutocompleteComponent,
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
    TextEditorModule,
    TextEditorToolbarModule,
    FormComponentsColorPickerModule,
    ColorPickerModule,
    AuthModuleForRoot,
    FormCoreModule,
    ProductsEditorRoutingModule,
    I18nModule,
    SharedModule,

    PebButtonToggleModule,
    PebExpandablePanelModule,
    PebFormFieldInputModule,
    PebMessagesModule,
    PebSelectModule,
  ],
  exports: [],
  declarations: [...EXP, OptionTypePickerComponent],
  providers: [
    ProductResolver,
    RecurringBillingResolver,
    ChannelsService,
    VatRatesApiService,
    VatRatesResolver,
    MediaUrlPipe,
    ProductSectionsService,
    CurrencyService,
    ApiBuilderService,
    VariantStorageService,
    { provide: LANG, useValue: 'en' },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class ProductsEditorModule {}
