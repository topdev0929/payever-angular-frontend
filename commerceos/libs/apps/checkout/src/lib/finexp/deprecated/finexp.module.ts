import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import 'hammerjs';
import 'hammer-timejs';

import { AuthModule } from '@pe/auth';
import { FormComponentsColorPickerModule, FormModule, SnackBarModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { ThirdPartyFormModule } from '@pe/tpm';

import { SharedModule } from '..';

import {
  BubbleComponent,
  ButtonComponent,
  CalculatorComponent,
  MarketingAppComponent,
  PosAppComponent,
  QRAppComponent,
  StoreAppComponent,
  TextLinkComponent,
} from './components/channels';
import {
  ChannelSettingsBoxComponent,
  ChannelSettingsInputComponent,
  ExpansionConnMenuListComponent,
  ExpansionMenuListComponent,
  GenerateHtmlComponent,
  MenuListComponent,
} from './components/containers';
import { FinexpRoutingModule } from './finexp-routing.module';
import { GenerateHtmlService } from './services';


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
    GenerateHtmlService,
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
    MarketingAppComponent,
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
    MarketingAppComponent,
  ],
})
export class FinexpModule {}
