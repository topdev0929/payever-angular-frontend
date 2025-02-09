import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { BusinessFormModule } from '@pe/entry/business-form';
import { I18nModule } from '@pe/i18n';
import { NotificationModule } from '@pe/notifications';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { SearchDashboardModule } from '@pe/search-dashboard';
import { AddBusinessOverlayComponent } from '@pe/shared/header';
import { TranslateLoaderModule } from '@pe/translate-loader';

import { HeaderComponent } from './header.component';
import { PeHeaderService } from './services/header.service';


@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    RouterModule,
    NotificationModule,
    BusinessFormModule,
    SearchDashboardModule,
    // PeMessageModule.forFeature(AppType.MessageEmbed),
    I18nModule,
    TranslateLoaderModule,
  ],
  providers: [
    PeHeaderService,
  ],
  declarations: [
    HeaderComponent,
    AddBusinessOverlayComponent,
  ],
  exports: [HeaderComponent],
})
export class PeHeaderModule {}
