import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HammerModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';

import { AuthModule } from '@pe/auth';
import {
  FormComponentsColorPickerModule,
  FormModule,
  SnackBarModule,
} from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { ThirdPartyFormModule } from '@pe/tpm';

import {
  GenerateHtmlComponent,
  ChannelSettingsBoxComponent,
  ChannelSettingsInputComponent,
  ChannelsSettingsComponent,
  ChannelPaymentsSelectComponent,
  ChannelAlignmentComponent,
  ChannelThemeComponent,
} from './components';
import { FinexpRoutingModule } from './finexp-routing.module';
import { GenerateHtmlService } from './services';
import { CheckoutModalModule } from './shared/modal';
import { SharedModule } from './shared/shared.module';

if ((window as any)?.PayeverStatic?.IconLoader) {
  (window as any).PayeverStatic.IconLoader.loadIcons([
    'set',
    'builder',
    'settings',
    'payment-methods',
    'payment-plugins',
    'finance-express',
    'shipping',
  ]);
}

export const I18nModuleForChild = I18nModule.forChild();

@NgModule({
  imports: [
    AuthModule,
    CommonModule,
    RouterModule,
    SharedModule,
    ClipboardModule,
    FinexpRoutingModule,
    FormModule,
    HammerModule,
    I18nModuleForChild,
    PePlatformHeaderModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDividerModule,
    MatExpansionModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    SnackBarModule,
    ReactiveFormsModule,
    MatSelectModule,
    ThirdPartyFormModule,
    FormComponentsColorPickerModule,
    FormsModule,
    CheckoutModalModule,
    OverlayModule,
  ],
  providers: [
    GenerateHtmlService,

  ],
  declarations: [
    ChannelsSettingsComponent,
    GenerateHtmlComponent,
    ChannelSettingsBoxComponent,
    ChannelSettingsInputComponent,
    ChannelPaymentsSelectComponent,
    ChannelAlignmentComponent,
    ChannelThemeComponent,
  ],
  exports: [
    CheckoutModalModule,
    ChannelsSettingsComponent,
    GenerateHtmlComponent,
    ChannelSettingsBoxComponent,
    ChannelSettingsInputComponent,
  ],
})
export class FinexpModule {}
