import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ButtonModule } from '@pe/button';
import { ConfirmationScreenModule } from '@pe/confirmation-screen';
import { PeFoldersModule } from '@pe/folders';
import { ThirdPartyFormModule } from '@pe/forms';
import { FormCoreModule } from '@pe/forms-core';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { PeSidebarModule } from '@pe/sidebar';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebSelectModule,
  PeIconModule,
} from '@pe/ui';

import {
  EditPaymentLinkComponent,
  PaymentLinkPrefillComponent,
  StatusComponent,
  PeEditPaymentLinkSkeletonComponent,
  ShareLinkComponent,
  ShareLinkCellComponent,
} from './components';
import { PaymentLinksComponent } from './payment-links.component';
import {
  PaymentLinksListService,
  PaymentLinksApiService,
  PaymentLinkDialogService,
  PaymentLinksFilterService,
  PaymentLinkGridOptionsService,
} from './services';

@NgModule({
  imports: [
    FormCoreModule,
    PeGridModule,
    PeSidebarModule,
    MatMenuModule,
    MatButtonModule,
    ButtonModule,
    MatIconModule,
    PeFoldersModule,
    CommonModule,
    PebFormBackgroundModule,
    PebSelectModule,
    PebFormFieldInputModule,
    I18nModule,
    PeIconModule,
    CommonModule,
    MatExpansionModule,
    PebExpandablePanelModule,
    ReactiveFormsModule,
    PebButtonToggleModule,
    PebButtonModule,
    ConfirmationScreenModule,
    ThirdPartyFormModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    PaymentLinksListService,
    PaymentLinksApiService,
    PaymentLinkDialogService,
    PaymentLinksFilterService,
    PaymentLinkGridOptionsService,
  ],
  declarations: [
    PeEditPaymentLinkSkeletonComponent,
    PaymentLinkPrefillComponent,
    EditPaymentLinkComponent,
    PaymentLinksComponent,
    StatusComponent,
    ShareLinkComponent,
    ShareLinkCellComponent,
  ],
})
export class PePaymentLinksModule { }
