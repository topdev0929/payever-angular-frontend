import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HammerModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
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

import { ClipboardModule } from 'ngx-clipboard';

import { I18nModule } from '@pe/i18n';
import { AuthModule } from '@pe/auth';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { FormComponentsColorPickerModule, FormModule, SnackBarModule, ThirdPartyFormModule } from '@pe/forms';

import { SharedModule } from '..';
import { GenerateHtmlService } from './services';
import { FinexpRoutingModule } from './finexp-routing.module';

import 'hammerjs';
import 'hammer-timejs';

import {
  BubbleComponent,
  ButtonComponent,
  CalculatorComponent,
  MarketingAppComponent,
  PosAppComponent,
  QRAppComponent,
  StoreAppComponent,
  TextLinkComponent
} from './components/channels';
import {
  ChannelSettingsBoxComponent,
  ChannelSettingsInputComponent,
  ExpansionConnMenuListComponent,
  ExpansionMenuListComponent,
  GenerateHtmlComponent,
  MenuListComponent
} from './components/containers';

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
  ],
  providers: [
    GenerateHtmlService
  ],
  declarations: [
    BubbleComponent,
    ButtonComponent,
    TextLinkComponent,
    CalculatorComponent,
    MenuListComponent,
    GenerateHtmlComponent,
    ExpansionMenuListComponent,
    ChannelSettingsBoxComponent,
    ExpansionConnMenuListComponent,
    ChannelSettingsInputComponent,
    StoreAppComponent,
    PosAppComponent,
    QRAppComponent,
    MarketingAppComponent
  ],
  exports: [
    BubbleComponent,
    ButtonComponent,
    TextLinkComponent,
    CalculatorComponent,
    MenuListComponent,
    GenerateHtmlComponent,
    ExpansionMenuListComponent,
    ChannelSettingsBoxComponent,
    ExpansionConnMenuListComponent,
    ChannelSettingsInputComponent,
    StoreAppComponent,
    PosAppComponent,
    QRAppComponent,
    MarketingAppComponent
  ]
})
export class FinexpModule {}
