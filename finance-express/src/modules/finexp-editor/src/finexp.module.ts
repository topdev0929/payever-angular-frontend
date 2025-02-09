import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HammerModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import 'hammerjs';
import 'hammer-timejs';
import { ClipboardModule } from 'ngx-clipboard';

import { I18nModule } from '@pe/i18n';
import { AuthModule } from '@pe/auth';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { FormComponentsColorPickerModule, FormModule, SnackBarModule, ThirdPartyFormModule } from '@pe/forms';

import { GenerateHtmlService } from './services';
import { FinexpRoutingModule } from './finexp-routing.module';

import { SharedModule } from './shared/shared.module';
import { ChannelsSettingsComponent } from './components/channels';
import {
  GenerateHtmlComponent,
  ChannelSettingsBoxComponent,
  ChannelSettingsInputComponent
} from './components/containers';
import { CheckoutModalModule } from './shared/modal';

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
    CheckoutModalModule
  ],
  providers: [
    GenerateHtmlService,

  ],
  declarations: [
    ChannelsSettingsComponent,
    GenerateHtmlComponent,
    ChannelSettingsBoxComponent,
    ChannelSettingsInputComponent
  ],
  exports: [
    CheckoutModalModule,
    ChannelsSettingsComponent,
    GenerateHtmlComponent,
    ChannelSettingsBoxComponent,
    ChannelSettingsInputComponent
  ]
})
export class FinexpModule {}
