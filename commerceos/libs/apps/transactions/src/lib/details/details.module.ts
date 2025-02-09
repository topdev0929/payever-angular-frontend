import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from "@angular/material/dialog";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskModule, IConfig } from 'ngx-mask';

import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { I18nModule } from '@pe/i18n';
import {
  CheckoutMicroService,
  CheckoutSharedService,
} from '@pe/shared/checkout';
import { PeNonBreakingHyphenPipe } from '@pe/shared/pipes';
import {
  PeAuthCodeModule,
  PebFormBackgroundModule,
  PebMessagesModule,
} from '@pe/ui';


import { ApiService } from '../services/api.service';
import { SettingsService } from '../services/settings.service';

import {
  ActionsListComponent,
  MoreActionsComponent,
} from './components/actions';
import {
  ActionableTextSectionComponent,
  GeneralSectionComponent,
  OrderSectionComponent,
  ShippingSectionComponent,
  BillingSectionComponent,
  PaymentSectionComponent,
  SellerSectionComponent,
  TimelineSectionComponent,
  DetailsSectionComponent,
  ProductsSectionComponent,
} from './components/sections';
import { ActionsListContainerComponent, TransactionsDetailsComponent, TransactionsDetailsSkeletonComponent } from './containers';
import { TransactionsDetailsRoutingModule } from './details-routing.module';
import { HideAnonymizedFieldDirective } from './directives';
import { CheckIfHiddenPipe } from './pipes';
import {
  ActionsListService,
  DetailService,
  SectionsService,
  TimelineService,
} from './services';
import { StoreModule } from './store';


const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  imports: [
    CommonModule,
    TransactionsDetailsRoutingModule,
    I18nModule,
    PebMessagesModule,
    PebFormBackgroundModule,
    PeAuthCodeModule,
    NgxMaskModule.forRoot(maskConfig),
    StoreModule,
    ConfirmationScreenModule,
    MatExpansionModule,
    MatDialogModule,
    MatIconModule,
  ],
  declarations: [
    TransactionsDetailsComponent,
    GeneralSectionComponent,
    OrderSectionComponent,
    ShippingSectionComponent,
    BillingSectionComponent,
    PaymentSectionComponent,
    SellerSectionComponent,
    TimelineSectionComponent,
    DetailsSectionComponent,
    ProductsSectionComponent,
    ActionsListComponent,
    MoreActionsComponent,
    ActionsListContainerComponent,
    ActionableTextSectionComponent,
    PeNonBreakingHyphenPipe,
    HideAnonymizedFieldDirective,
    CheckIfHiddenPipe,
    TransactionsDetailsSkeletonComponent,
  ],
  providers: [
    ApiService,
    SettingsService,
    SectionsService,
    DetailService,
    TimelineService,
    CurrencyPipe,
    CheckoutMicroService,
    CheckoutSharedService,
    ActionsListService,
    PeNonBreakingHyphenPipe,
  ],
})

export class TransactionsDetailsModule {
}
