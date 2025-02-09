import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { PebViewerModule } from '@pe/builder-viewer';
import { PeSidebarModule } from '@pe/sidebar';
import { PeDataGridModule } from '@pe/data-grid';
import { OverlayWidgetModule } from '@pe/overlay-widget';
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
import { I18nModule } from '@pe/i18n';
import { SharedModule as ConnectAppSharedModule } from '@pe/connect-app';
import { SnackBarService, ThirdPartyFormModule } from '@pe/forms';

import { PebPosRouteModule } from './pos.routing';
import { PebPosComponent } from './routes/_root/pos-root.component';
import { pebPosElementsConfig } from './pos.config';
import { PebPosDashboardComponent } from './routes/dashboard/pos-dashboard.component';
import { PebPosSettingsComponent } from './routes/settings/pos-settings.component';
import { PebPosGuard } from './guards/pos.guard';
import {
  PeSettingsCreateAppComponent,
  PeSettingsPayeverDomainComponent,
} from './components';
import { PePosMaterialComponent } from './components/material/material.component';
import { AbbreviationPipe } from './misc/pipes/abbreviation.pipe';
import { PebTerminalConnectComponent } from './routes/connect/pos-connect.component';
import { ConnectAppAddComponent } from './routes/connect/connect-app-add/connect-app-add.component';
import { ConnectAppEditComponent } from './routes/connect/connect-app-edit/connect-app-edit.component';
import { QRIntegrationComponent } from './components/qr-generator/qr-settings.component';


// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const pebViewerModuleForRoot = PebViewerModule.withConfig(pebPosElementsConfig);
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
    pebViewerModuleForRoot,
    NgScrollbarModule,
    MatFormFieldModule,
    MatInputModule,
    PeSidebarModule,
    PeDataGridModule,
    MatSlideToggleModule,
    OverlayWidgetModule,
    ConnectAppSharedModule,
    i18n,
    ThirdPartyFormModule,
  ],
  declarations: [
    PebTerminalConnectComponent,
    ConnectAppAddComponent,
    ConnectAppEditComponent,
    PePosMaterialComponent,
    PebPosComponent,
    PebPosDashboardComponent,
    PebPosSettingsComponent,
    PeSettingsPayeverDomainComponent,
    PeSettingsCreateAppComponent,
    AbbreviationPipe,
    QRIntegrationComponent,
  ],
  providers: [
    PebPosGuard,
    SnackBarService,
  ],
})
export class PebPosModule { }
