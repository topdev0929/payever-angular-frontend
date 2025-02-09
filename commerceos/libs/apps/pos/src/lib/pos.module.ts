import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { APP_TYPE, AppType, MicroModule } from '@pe/common';
import { PeFoldersModule } from '@pe/folders';
import { SnackBarService } from '@pe/forms';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { OverlayWidgetModule } from '@pe/overlay-widget';
import { PeSharedCheckoutModule } from '@pe/shared/checkout';
import { ThirdPartyFormModule } from '@pe/tpm';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebLogoPickerModule,
  PebMessagesModule,
  PebSocialSharingImageModule,
} from '@pe/ui';

import {
  PeSettingsCreateAppComponent,
  PeSettingsPayeverDomainComponent,
} from './components';
import { PePosMaterialComponent } from './components/material/material.component';
import { ProductDetailStylesComponent } from './components/product-detail-styles/product-detail-styles.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { QRIntegrationComponent } from './components/qr-generator/qr-settings.component';
import { PebPosGuard } from './guards/pos.guard';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { PebPosRouteModule } from './pos.routing';
import { PebPosComponent } from './routes/_root/pos-root.component';
import { ConnectAppEditComponent } from './routes/connect/connect-app-edit/connect-app-edit.component';
import { PebTerminalConnectComponent } from './routes/connect/pos-connect.component';
import { PebPosDashboardComponent } from './routes/dashboard/pos-dashboard.component';
import { PebPosSettingsComponent } from './routes/settings/pos-settings.component';
import { PosApi } from './services';
import { PosConnectService } from './services/pos-connect.service';

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const i18n = I18nModule.forRoot();


@NgModule({
    imports: [
        ClipboardModule,
        PebSocialSharingImageModule,
        PebButtonToggleModule,
        PebExpandablePanelModule,
        PebFormFieldInputModule,
        PebFormBackgroundModule,
        PebFormFieldTextareaModule,
        PebMessagesModule,
        PebButtonModule,
        PebLogoPickerModule,
        PebPosRouteModule,
        OverlayWidgetModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        MatExpansionModule,
        MatListModule,
        MatCardModule,
        MatDividerModule,
        MatDialogModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        NgScrollbarModule,
        MatFormFieldModule,
        MatInputModule,
        PeGridModule,
        PeFoldersModule,
        MatSlideToggleModule,
        OverlayWidgetModule,
        i18n,
        ThirdPartyFormModule,
        PeSharedCheckoutModule.withConfig({ generatePaymentCode: true }),
        MicroModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
    ],
  declarations: [
    PebTerminalConnectComponent,
    ConnectAppEditComponent,
    PePosMaterialComponent,
    PebPosComponent,
    PebPosDashboardComponent,
    PebPosSettingsComponent,
    PeSettingsPayeverDomainComponent,
    PeSettingsCreateAppComponent,
    AbbreviationPipe,
    QRIntegrationComponent,
    ProductListComponent,
    ProductDetailsComponent,
    ProductDetailStylesComponent,
  ],
  providers: [
    SnackBarService,
    PebPosGuard,
    PosConnectService,
    {
      provide: PosApi,
      useClass: PosApi,
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Pos,
    },
  ],
})
export class PebPosModule { }
