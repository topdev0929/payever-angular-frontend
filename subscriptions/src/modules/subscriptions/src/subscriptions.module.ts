import { CommonModule, CurrencyPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { UrlSerializer } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ClipboardModule } from 'ngx-clipboard';

import { PebActualContextApi, PebContextApi } from '@pe/builder-api';
import { PeDataGridModule } from '@pe/data-grid';
import { PeFiltersModule } from '@pe/filters';
import { I18nModule } from '@pe/i18n';
// import { ProductsModule } from '@pe/products-app';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebMessagesModule,
  PebProductPickerModule,
  PebRadioModule,
  PebSelectModule,
  PePickerModule,
} from '@pe/ui';
import { SharedModule } from '@pe/connect-app';
import { PebThemesModule } from '@pe/themes';
import { PebViewerModule } from '@pe/builder-viewer';
import { MediaModule, MediaUrlPipe } from '@pe/media';
import { OverlayWidgetModule, PeOverlayWidgetService } from '@pe/overlay-widget';
import { ContactsModule } from '@pe/contacts';
import { PebShopEditorModule } from '@pe/builder-shop-editor';

import { PeSubscriptionApi } from './api/subscription/abstract.subscription.api';
import { PeActualSubscriptionApi } from './api/subscription/actual.subscription.api';
import { PeSettingsApi } from './api/settings/abstract.settings.api';
import { PeActualSettingsApi } from './api/settings/actual.settings.api';
import { PeConnectionApi } from './api/connection/abstract.connection.api';
import { PeActualConnectionApi } from './api/connection/actual.connection.api';
import { PesIconsModule } from './misc/icons/icons.module';
import { PeConnectListComponent } from './routes/connect/connect-list/connect-list.component';
import { PeProgramsComponent } from './routes/programs/components/programs-list/programs.component';
import { PeProgramGridItemComponent } from './routes/programs/components/program-grid-item/program-grid-item.component';
import { PebSubscriptionDashboardComponent } from './routes/dashboard/subscription-dashboard.component';
import { PePlanDialogComponent } from './routes/programs/plan-dialog/plan-dialog.component';
import { PeBrowseProductsFormComponent } from './routes/programs/browse-products/browse-products.component';
import { PeBrowseContactsFormComponent } from './routes/programs/browse-contacts/browse-contacts.component';
import { PeSettingsComponent } from './routes/settings/settings.component';
import { PeSettingsPayeverDomainComponent } from './routes/settings/payever-domain/payever-domain.component';
import { PeSettingsPersonalDomainComponent } from './routes/settings/personal-domain/personal-domain.component';
import { PeSettingsConnectExistingComponent } from './routes/settings/connect-existing/connect-existing.component';
import { PeThemesComponent } from './routes/themes/themes.component';
import { CustomUrlSerializer } from './services/custom-url-serializer.service';
import { HeaderService } from './services/header.service';
import { PeSubscriptionSidebarService } from './services/sidebar.service';
import { PeDividerComponent } from './shared/components/divider/divider.component';
import { ConfirmDialogService } from './shared/dialogs/dialog-data.service';
import { PesRouteModule } from './subscription.routing';
import { PeSubscriptionsComponent } from './subscriptions.component';
import { TokenInterceptor } from './token.interceptor';
import { SubscribtionsApolloConfigModule } from './apollo.module';
import { PeSubscriptionGuard } from './guards/subscription.guard';
import { PeSubscriptionMaterialComponent } from './components';

import { ApolloModule } from 'apollo-angular';

export const I18nModuleForChild: ModuleWithProviders<I18nModule> = I18nModule.forChild();
export const frontendModules = [MatSnackBarModule, MatMenuModule, MatProgressSpinnerModule];
export const MediaModuleForRoot = MediaModule.forRoot({});

const uicomp = [
  PebButtonModule,
  PebCheckboxModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebSelectModule,
  PebRadioModule,
  PebFormBackgroundModule,
  PebExpandablePanelModule,
  PebButtonToggleModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebMessagesModule,
  PePickerModule,
  PebProductPickerModule,
];

@NgModule({
  imports: [
    OverlayWidgetModule,
    CommonModule,
    PesRouteModule,
    PeDataGridModule,
    PeSidebarModule,
    PeFiltersModule,
    PesIconsModule,
    I18nModuleForChild,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    ClipboardModule,
    SharedModule,
    PebThemesModule,
    PebViewerModule,
    ApolloModule,
    ContactsModule,
    SubscribtionsApolloConfigModule,
    PebShopEditorModule,
    ...frontendModules,
    ...uicomp,
    MediaModuleForRoot,
  ],
  declarations: [
    PeSubscriptionsComponent,
    PeProgramsComponent,
    PeConnectListComponent,
    PeSettingsComponent,
    PeDividerComponent,
    PeThemesComponent,
    PePlanDialogComponent,
    PeSettingsPayeverDomainComponent,
    PeSettingsPersonalDomainComponent,
    PeSettingsConnectExistingComponent,
    PeProgramGridItemComponent,
    PeBrowseProductsFormComponent,
    PeBrowseContactsFormComponent,
    PebSubscriptionDashboardComponent,
    PeSubscriptionMaterialComponent,
  ],
  providers: [
    PeOverlayWidgetService,
    PeSubscriptionGuard,
    HeaderService,
    MediaUrlPipe,
    { provide: UrlSerializer, useClass: CustomUrlSerializer },
    PeSubscriptionSidebarService,
    CurrencyPipe,
    ConfirmDialogService,
    {
      provide: PeSubscriptionApi,
      useClass: PeActualSubscriptionApi,
    },
    {
      provide: PeSettingsApi,
      useClass: PeActualSettingsApi,
    },
    {
      provide: PeConnectionApi,
      useClass: PeActualConnectionApi,
    },
    {
      provide: PebContextApi,
      useClass: PebActualContextApi,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class PeSubscriptionsModule {}
