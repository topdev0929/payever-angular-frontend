import { CommonModule, CurrencyPipe, registerLocaleData } from '@angular/common';
import localeDE from '@angular/common/locales/en-DE';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ButtonModule } from '@pe/button';
import { PE_ENV, EnvironmentConfigInterface } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { MediaModule, PE_MEDIA_API_PATH } from '@pe/media';
import { PeMessageModule } from "@pe/message";
import { PeMessageAppApiService, PeMessageAppService } from '@pe/message/shared';
import { NotificationModule } from '@pe/notifications';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { SearchDashboardModule } from '@pe/search-dashboard';
import { CheckoutSharedService } from '@pe/shared/checkout';
import { EditWidgetsService, EditWidgetsApiService } from '@pe/shared/widget';
import { PeStepperModule, PeStepperService } from '@pe/stepper';
import { PebButtonToggleModule } from '@pe/ui';
import { PeWidgetsModule } from '@pe/widgets';
import { WindowEventsService } from '@pe/window';

import { WidgetSkeletonComponent } from './components/skeleton/skeleton.component';
import { WidgetActionButtonComponent } from './components/widget-action-button/widget-action-button.component';
import { WidgetStatisticsComponent } from './components/widget-statistics/widget-statistics.component';
import { DashboardWidgetsRoutingModule } from './dashboard-widgets-routing.module';
import { WidgetsResolver } from './resolvers';
import { WidgetsApiService } from './services';
import {
  AdsWidgetComponent,
  AppointmentWidgetComponent,
  AppsWidgetComponent,
  ChartLegendComponent,
  CheckoutWidgetComponent,
  ConnectWidgetComponent,
  ContactsWidgetComponent,
  MarketingCampaignComponent,
  MarketingWidgetComponent,
  PosWidgetComponent,
  ProductItemComponent,
  ProductsWidgetComponent,
  SearchWidgetComponent,
  SettingsWidgetComponent,
  StoreInfoComponent,
  StoreStatsComponent,
  StoreWidgetComponent,
  StudioWidgetComponent,
  TransactionsWidgetComponent,
  TruncatePipe,
  TutorialWidgetComponent,
  WidgetsLayoutComponent,
} from './widgets';
import { BlogWidgetComponent } from './widgets/blog';
import { CouponsWidgetComponent } from './widgets/coupons';
import { EditOverlayComponent } from './widgets/edit-overlay/edit-overlay.component';
import { InvoiceWidgetComponent } from './widgets/invoice/invoice-widget/invoice-widget.component';
import { MessageWidgetComponent } from './widgets/message';
import { ShippingWidgetComponent } from './widgets/shipping';
import { SiteWidgetComponent } from './widgets/site';
import { SocialWidgetComponent } from './widgets/social';
import { SubscriptionsWidgetComponent } from './widgets/subscriptions';


registerLocaleData(localeDE, 'en-DE');

@NgModule({
  imports: [
    CommonModule,
    I18nModule.forChild(),
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatListModule,
    NotificationModule,
    PebButtonToggleModule,
    MatProgressSpinnerModule,
    SearchDashboardModule,
    MediaModule,
    DashboardWidgetsRoutingModule,
    FormsModule,
    ButtonModule,
    PeWidgetsModule,
    PeStepperModule,
    PeMessageModule,
  ],
  exports: [
    AdsWidgetComponent,
    AppsWidgetComponent,
    AppointmentWidgetComponent,
    ChartLegendComponent,
    CheckoutWidgetComponent,
    ConnectWidgetComponent,
    ContactsWidgetComponent,
    MarketingWidgetComponent,
    SearchWidgetComponent,
    SettingsWidgetComponent,
    StoreInfoComponent,
    StoreStatsComponent,
    StoreWidgetComponent,
    StudioWidgetComponent,
    TutorialWidgetComponent,
    TransactionsWidgetComponent,
    PosWidgetComponent,
    ProductItemComponent,
    ProductsWidgetComponent,
    WidgetSkeletonComponent,
  ],
  declarations: [
    WidgetSkeletonComponent,
    AdsWidgetComponent,
    AppsWidgetComponent,
    AppointmentWidgetComponent,
    ChartLegendComponent,
    CheckoutWidgetComponent,
    ConnectWidgetComponent,
    ContactsWidgetComponent,
    CouponsWidgetComponent,
    MarketingCampaignComponent,
    MarketingWidgetComponent,
    SearchWidgetComponent,
    SettingsWidgetComponent,
    SocialWidgetComponent,
    EditOverlayComponent,
    SiteWidgetComponent,
    BlogWidgetComponent,
    MessageWidgetComponent,
    InvoiceWidgetComponent,
    SubscriptionsWidgetComponent,
    ShippingWidgetComponent,
    StoreInfoComponent,
    StoreStatsComponent,
    StoreWidgetComponent,
    StudioWidgetComponent,
    TutorialWidgetComponent,
    TransactionsWidgetComponent,
    PosWidgetComponent,
    ProductsWidgetComponent,
    ProductItemComponent,
    WidgetStatisticsComponent,
    WidgetActionButtonComponent,
    TruncatePipe,
    WidgetsLayoutComponent,
  ],
  providers: [
    CurrencyPipe,
    WidgetsApiService,
    WidgetsResolver,
    EditWidgetsService,
    PeStepperService,
    PeOverlayWidgetService,
    EditWidgetsApiService,
    CheckoutSharedService,
    PeMessageAppService,
    PeMessageAppApiService,
    WindowEventsService,
    {
      deps: [PE_ENV],
      provide: PE_MEDIA_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
    },
  ],
})
export class DashboardWidgetsModule {}
